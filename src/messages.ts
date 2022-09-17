import { encode } from 'html-entities'

export const fixNewLines = (text: string) => text.replaceAll('\n', '\r\n')

export const generateSpeechConfigMessage = (reqId: string) =>
  fixNewLines(`Path: speech.config
X-RequestId: ${reqId}
X-Timestamp: ${new Date().toISOString()}
Content-Type: application/json

{"context":{"system":{"name":"SpeechSDK","version":"1.19.0","build":"JavaScript","lang":"JavaScript"},"os":{"platform":"Browser/MacIntel","name":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36","version":"5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36"}}}`)

export const generateSynthesisContextMessage = (reqId: string) =>
  fixNewLines(`Path: synthesis.context
X-RequestId: ${reqId}
X-Timestamp: ${new Date().toISOString()}
Content-Type: application/json

{"synthesis":{"audio":{"metadataOptions":{"bookmarkEnabled":false,"sentenceBoundaryEnabled":false,"visemeEnabled":false,"wordBoundaryEnabled":false},"outputFormat":"audio-24khz-96kbitrate-mono-mp3"},"language":{"autoDetection":false}}}`)

export const generateSSMLMessage = (reqId: string, voice: string, text: string) =>
  fixNewLines(`Path: ssml
X-RequestId: ${reqId}
X-Timestamp: ${new Date().toISOString()}
Content-Type: application/ssml+xml

<speak xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xmlns:emo="http://www.w3.org/2009/10/emotionml" version="1.0" xml:lang="en-US"><voice name="${voice}"><prosody rate="0%" pitch="0%">${encode(
    text,
  )}</prosody></voice></speak>`)
