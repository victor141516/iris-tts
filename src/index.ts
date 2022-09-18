export { getVoiceChunks } from './tts'

// import { open } from 'fs/promises'
// import { getVoiceChunks } from './tts'

// const book = 'hola!'
// const iterator = getVoiceChunks(book, 'es-ES-AlvaroNeural', {
//   throttling(ms) {
//     console.info(`Throttling (${ms}ms)`)
//   },
//   progress(progress, eta) {
//     const secondsRemaining = eta / 1000
//     console.info(
//       `Progress: ${(progress * 100).toFixed(4)}%${
//         Number.isNaN(secondsRemaining)
//           ? ''
//           : ` (ETA ${
//               secondsRemaining / 60 > 1
//                 ? `${(secondsRemaining / 60).toFixed(1)} minutes`
//                 : `${secondsRemaining.toFixed(1)} seconds`
//             })`
//       }`,
//     )
//   },
// })

// ;(async () => {
//   const f = await open('./audio.mp3', 'w+')
//   for await (const chunk of iterator) {
//     f.write(chunk)
//   }
// })()
