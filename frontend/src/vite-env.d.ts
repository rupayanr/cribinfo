/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'leaflet/dist/images/marker-icon.png' {
  const value: string
  export default value
}

declare module 'leaflet/dist/images/marker-shadow.png' {
  const value: string
  export default value
}
