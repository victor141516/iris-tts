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
