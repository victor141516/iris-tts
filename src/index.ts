// // import { getShortVoice } from './tts'
export { getVoiceChunks } from './tts'
// import { readFileSync } from 'fs'
// import { open } from 'fs/promises'
// import { getVoiceChunks } from 'tts'

// // const text = `hola que tal`
// // getShortVoice(text, 'es-UY-ValentinaNeural')
// //   .then(async (e) => {
// //     console.log('ok!', { e })
// //     const f = await open('./audio.mp3', 'w+')
// //     f.write(e)
// //   })
// //   .catch((e) => console.log('ko :(', e))

// const book = readFileSync('./book.txt', 'utf-8').slice(0, 10000)
// const iterator = getVoiceChunks(
//   book,
//   'es-ES-AlvaroNeural',
//   {
//     throttling(ms) {
//       console.info(`Throttling (${ms}ms)`)
//     },
//     progress(progress, eta) {
//       const secondsRemaining = eta / 1000
//       console.info(
//         `Progress: ${(progress * 100).toFixed(4)}%${
//           Number.isNaN(secondsRemaining)
//             ? ''
//             : ` (ETA ${
//                 secondsRemaining / 60 > 1
//                   ? `${(secondsRemaining / 60).toFixed(1)} minutes`
//                   : `${secondsRemaining.toFixed(1)} seconds`
//               })`
//         }`,
//       )
//     },
//   },
//   500,
// )
// ;(async () => {
//   const f = await open('./audio.mp3', 'w+')
//   for await (const chunk of iterator) {
//     f.write(chunk)
//   }
// })()
