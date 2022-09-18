import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid'
import { generateSpeechConfigMessage, generateSynthesisContextMessage, generateSSMLMessage } from './messages'
import { AUDIO_MESSAGE_PAYLOAD_OFFSET, BASE_WS_URL, MESSAGE_FIELDS, PATHS, THROTTLING_ERROR_MESSAGE } from './consts'

const THROTTLING = 'THROTTLING'
const HANDLED_STATUS_CODES = [429, 502, 503]

type Voice = 'es-ES-AlvaroNeural' | 'es-UY-ValentinaNeural'

const getPathLine = (dataString: string) =>
  dataString
    .split('\n')
    .find((l) => l.startsWith(MESSAGE_FIELDS.PATH))
    ?.trim()

function splitTextChunks(text: string, maxChunkSize = 1000) {
  const dotPositions = [] as number[]

  while (true) {
    const pos = text.indexOf('.', (dotPositions.at(-1) ?? -1) + 1)
    if (pos === -1) break
    dotPositions.push(pos)
  }
  dotPositions.push(text.length)
  dotPositions.unshift(0)

  let lastIndex = 0
  while (lastIndex !== dotPositions.length - 1) {
    const gap = dotPositions[lastIndex + 1] - dotPositions[lastIndex]
    if (gap <= maxChunkSize + 1) {
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

export async function* getVoiceChunks(text: string, voice: Voice, handler?: Handler): AsyncGenerator<Buffer> {
  const lines = splitTextChunks(text)

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
          const time = 2 ** retries * 100
          handler?.throttling?.(time)
          await new Promise((res) => setTimeout(res, time))
          retries++
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else throw new Error((error as any)?.toString() ?? 'Unknown error')
      }
    }
    index++
  }
}

async function getShortVoice(text: string, voice: Voice): Promise<Buffer> {
  const reqId = uuidv4().replaceAll('-', '').toUpperCase()
  const audio = await new Promise<Buffer>((res, rej) => {
    const ws = new WebSocket(`${BASE_WS_URL}${reqId}`)

    ws.on('close', (code, buffer) => {
      // data not consistent with the type of the message
      if (code === 1007) {
        console.warn('WS closed with code 1007')
        rej(Error(THROTTLING))
      } else if (code !== 1000) {
        console.error('WS closes with unexpected code', code, { buffer })
      }
    })
    ws.on('unexpected-response', async (req, msg) => {
      ws.close()
      if (HANDLED_STATUS_CODES.includes(msg.statusCode!)) {
        rej(Error(THROTTLING))
      } else {
        console.error('Unhandled status code:', msg.statusCode, { msg })
        rej(Error(THROTTLING))
      }
    })

    ws.on('open', () => {
      const m1 = generateSpeechConfigMessage(reqId)
      const m2 = generateSynthesisContextMessage(reqId)
      const m3 = generateSSMLMessage(reqId, voice, text)
      ws.send(m1)
      ws.send(m2)
      ws.send(m3)
    })

    const chunks: Array<Buffer> = []

    ws.on('message', (data: Buffer) => {
      const dataString = data.toString()
      if (dataString.includes(MESSAGE_FIELDS.X_REQUEST_ID)) {
        const path = getPathLine(dataString)
        if (path === `${MESSAGE_FIELDS.PATH}:${PATHS.AUDIO}`) {
          const chunk = data.subarray(AUDIO_MESSAGE_PAYLOAD_OFFSET)
          if (chunk.length !== 0) {
            chunks.push(chunk)
          }
        } else if (path === `${MESSAGE_FIELDS.PATH}:${PATHS.END}`) {
          ws.close()
          res(Buffer.concat(chunks))
        }
      } else {
        throw { bin: data, string: dataString }
      }
    })
    ws.on('error', (e) => {
      if (e.message === THROTTLING_ERROR_MESSAGE) {
        rej(Error(THROTTLING))
      } else {
        console.log('WS error:', e, e.message, JSON.stringify(e))
      }
    })
  })

  return audio
}
