# <img align="left" width="100" style="margin-right: 15px" src="https://i.imgur.com/CMtSAu1.png"> Iris TTS

This is a node library that uses a _third party service_ to provide high quality text-to-speech. It can handle any amount of text.

## Usage

```js
import { open } from 'fs/promises'
import { getVoiceChunks } from './tts'

const iterator = getVoiceChunks('hola!', 'es-ES-AlvaroNeural')

;(async () => {
  const f = await open('./audio.mp3', 'w+')
  for await (const chunk of iterator) {
    f.write(chunk)
  }
})()
```