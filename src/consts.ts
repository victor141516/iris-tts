export const BASE_WS_URL =
  'wss://eastus.api.speech.microsoft.com/cognitiveservices/websocket/v1?TrafficType=AzureDemo&Authorization=bearer%20undefined&X-ConnectionId='
export const MESSAGE_FIELDS = {
  X_REQUEST_ID: 'X-RequestId',
  PATH: 'Path',
}
export const PATHS = {
  AUDIO: 'audio',
  END: 'turn.end',
}
export const AUDIO_MESSAGE_PAYLOAD_OFFSET = 130
export const THROTTLING_ERROR_MESSAGE = 'Unexpected server response: 429'
export const HTTP_HEADERS = {
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Connection: 'Upgrade',
  Host: 'eastus.api.speech.microsoft.com',
  Origin: 'https://azure.microsoft.com',
  Pragma: 'no-cache',
  'Sec-WebSocket-Extensions': 'permessage-deflate; client_max_window_bits',
  'Sec-WebSocket-Version': '13',
  Upgrade: 'websocket',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36',
}
