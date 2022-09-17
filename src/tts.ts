import WebSocket from 'ws'
import { v4 as uuidv4 } from 'uuid'
import { generateSpeechConfigMessage, generateSynthesisContextMessage, generateSSMLMessage } from 'messages'
import {
  AUDIO_MESSAGE_PAYLOAD_OFFSET,
  BASE_WS_URL,
  MESSAGE_FIELDS,
  PATHS,
  THROTTLING_ERROR_MESSAGE,
  VOICE,
} from 'consts'

const THROTTLING = 'THROTTLING'
const HANDLED_STATUS_CODES = [429, 502, 503]

const getPathLine = (dataString: string) =>
  dataString
    .split('\n')
    .find((l) => l.startsWith(MESSAGE_FIELDS.PATH))
    ?.trim()

export async function* getVoiceChunks(text: string): AsyncGenerator<Buffer> {
  const lines = text
    .split(/[\.\n]/)
    .map((l) => l.trim())
    .filter((l) => l !== '')
    .map((l) => l + '.')

  let index = 0
  const initTs = Date.now()
  for (const line of lines) {
    let retries = 0
    const progress = index / lines.length
    const secondsRemaining = (Date.now() - initTs) / progress / 1000
    console.debug(`Progress: ${(progress * 100).toFixed(4)}% (ETA ${secondsRemaining / 60} minutes)`)
    while (true) {
      try {
        console.debug('Begin getShortVoice')
        const chunk = await getShortVoice(line)
        console.debug('End getShortVoice')
        yield chunk
        break
      } catch (error) {
        console.debug('New error', error)
        if ((error as Error).message === THROTTLING) {
          const time = 2 ** retries * 100
          console.debug(`Throttling (${time}ms)`)
          await new Promise((res) => setTimeout(res, time))
          retries++
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } else throw new Error((error as any)?.toString() ?? 'Unknown error')
      }
    }
    index++
  }
}

async function getShortVoice(text: string): Promise<Buffer> {
  const reqId = uuidv4().replaceAll('-', '').toUpperCase()
  const audio = await new Promise<Buffer>((res, rej) => {
    console.debug('Connecting to ws')
    const ws = new WebSocket(`${BASE_WS_URL}${reqId}`)

    ws.on('close', (code, buffer) => {
      console.debug('close event:', { code, buffer })

      // data not consistent with the type of the message
      if (code === 1007) {
        console.log({ text })
        rej(Error(THROTTLING))
      }
    })
    ws.on('unexpected-response', async (req, msg) => {
      console.debug('unexpected-response event', { text, statusCode: msg.statusCode })
      ws.close()
      if (HANDLED_STATUS_CODES.includes(msg.statusCode!)) {
        rej(Error(THROTTLING))
      } else {
        console.error('Unhandled status code:', msg.statusCode, { msg })
        rej(Error(THROTTLING))
      }
    })
    ws.on('upgrade', (msg) => console.debug('upgrade event:', { msg }))

    ws.on('open', () => {
      console.debug('open event')
      const m1 = generateSpeechConfigMessage(reqId)
      const m2 = generateSynthesisContextMessage(reqId)
      const m3 = generateSSMLMessage(reqId, VOICE, text)
      console.debug('sending m1')
      ws.send(m1)
      console.debug('sending m2')
      ws.send(m2)
      console.debug('sending m3')
      ws.send(m3)
      console.debug('m3 sent')
    })

    const chunks: Array<Buffer> = []

    ws.on('message', (data: Buffer) => {
      console.debug(`message event (length: ${data.length})`)
      const dataString = data.toString()
      if (dataString.includes(MESSAGE_FIELDS.X_REQUEST_ID)) {
        console.debug('data contains x-requestId')
        const path = getPathLine(dataString)
        console.debug('path:', path)
        if (path === `${MESSAGE_FIELDS.PATH}:${PATHS.AUDIO}`) {
          const chunk = data.subarray(AUDIO_MESSAGE_PAYLOAD_OFFSET)
          console.debug('audio chunk size:', chunk.length)
          if (chunk.length !== 0) {
            chunks.push(chunk)
          }
        } else if (path === `${MESSAGE_FIELDS.PATH}:${PATHS.END}`) {
          console.debug('closing ws')
          ws.close()
          res(Buffer.concat(chunks))
          // } else {
          //   throw { bin: data, string: dataString }
        } else {
          console.debug('Unknown path:', path)
        }
      } else {
        throw { bin: data, string: dataString }
      }
    })
    ws.on('error', (e) => {
      console.debug('error event:', e)
      if (e.message === THROTTLING_ERROR_MESSAGE) {
        rej(Error(THROTTLING))
      } else {
        console.log('ws error:', e, e.message, JSON.stringify(e))
      }
    })
  })

  return audio
}
