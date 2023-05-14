import { encode } from 'html-entities'
import { Voice } from './tts'

export const generateHttpRequest = (text: string, voice: Voice) => {
  const params = {
    headers: {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
      'Cache-Control': 'no-cache',
      'Content-Length': '724',
      'Content-Type': 'application/json',
      Origin: 'https://azure.microsoft.com',
      Pragma: 'no-cache',
      Referer: 'https://azure.microsoft.com/',
      'Sec-Ch-Ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"macOS"',
      'Sec-Fetch-Dest': 'empty',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Site': 'same-site',
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
    },
    body: `{"ttsAudioFormat":"audio-24khz-160kbitrate-mono-mp3","ssml":"<speak xmlns=\\"http://www.w3.org/2001/10/synthesis\\" xmlns:mstts=\\"http://www.w3.org/2001/mstts\\" xmlns:emo=\\"http://www.w3.org/2009/10/emotionml\\" version=\\"1.0\\" xml:lang=\\"en-US\\"><voice name=\\"${voice}\\"><prosody rate=\\"0%\\" pitch=\\"0%\\">${encode(
      text,
    )}</prosody></voice></speak>"}`,
    method: 'POST',
  }
  params.headers['Content-Length'] = params.body.length.toString()
  return params
}
