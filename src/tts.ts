import fetch from 'node-fetch'
import { HTTP_ENDPOINT } from './consts'
import { generateHttpRequest } from './messages'

const THROTTLING = 'THROTTLING'

export type Voice = 'es-ES-AlvaroNeural' | 'es-UY-ValentinaNeural'

function splitTextChunks(text: string, voice: Voice, maxChunkSize = 1000) {
  const ssmlWrapperOffset = generateHttpRequest('', voice).body.length
  const dotPositions = [] as number[]

  while (true) {
    const pos = text.indexOf('.', (dotPositions.at(-1) ?? -1) + 1)
    if (pos === -1) break
    dotPositions.push(pos)
  }
  dotPositions.push(text.length)
  dotPositions.unshift(-1)

  let lastIndex = 0
  while (lastIndex !== dotPositions.length - 1) {
    const gap = dotPositions[lastIndex + 1] - dotPositions[lastIndex]
    if (gap + ssmlWrapperOffset <= maxChunkSize + 1) {
      const maybeGap = dotPositions[lastIndex + 2] - dotPositions[lastIndex]
      if (maybeGap <= maxChunkSize + 1) {
        dotPositions.splice(lastIndex + 1, 1)
      } else {
        lastIndex++
      }
    } else {
      lastIndex++
    }
  }

  const chunks = [] as string[]
  for (let i = 0; i < dotPositions.length - 1; i++) {
    chunks.push(text.slice(dotPositions[i] + 1, dotPositions[i + 1] + 1).trim())
  }

  return chunks
}

type Handler = { throttling?: (ms: number) => void; progress?: (progress: number, eta: number) => void } | undefined

export async function* getVoiceChunks(
  text: string,
  voice: Voice,
  handler?: Handler,
  maxChunkSize = 1000,
): AsyncGenerator<Buffer> {
  const lines = splitTextChunks(text, voice, maxChunkSize)

  let index = 0
  const initTs = Date.now()
  for (const line of lines) {
    let retries = 0
    const progress = index / lines.length
    const msRemaining = ((Date.now() - initTs) * (1 - progress)) / progress
    handler?.progress?.(progress, msRemaining)
    while (true) {
      try {
        const chunk = await getShortVoice(line, voice)
        yield chunk
        break
      } catch (error) {
        if ((error as Error).message === THROTTLING) {
          if (retries > 7) {
            if (maxChunkSize < 5) break // ignore this little chunk
            yield* getVoiceChunks(line, voice, handler, maxChunkSize / 2)
          }
          const time = 2 ** retries * 100
          handler?.throttling?.(time)
          await new Promise((res) => setTimeout(res, time))
          retries++
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else throw new Error((error as any)?.toString() ?? 'Unknown error')
      }
    }
    await new Promise((res) => setTimeout(res, 1000))
    index++
  }
}

export async function getShortVoice(text: string, voice: Voice): Promise<Buffer> {
  try {
    return await fetch(HTTP_ENDPOINT, generateHttpRequest(text, voice)).then((res) => {
      return res.buffer()
    })
  } catch (error) {
    console.error('Error fetching voice', error)
    throw new Error(THROTTLING)
  }
}
