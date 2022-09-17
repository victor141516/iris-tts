import { readFileSync } from 'fs'
import { open } from 'fs/promises'
import { getVoiceChunks } from 'tts'

const book = readFileSync('./book.txt').toString()
const iterator = getVoiceChunks(book)

;(async () => {
  const f = await open('./audio.mp3', 'w+')
  for await (const chunk of iterator) {
    f.write(chunk)
  }
})()
