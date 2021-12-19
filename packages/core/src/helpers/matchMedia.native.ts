import 'react-native-match-media-polyfill'

export const matchMedia = window.matchMedia

// @ts-ignore
globalThis['matchMedia'] = matchMedia
