/// <reference types="vite/client" />
/// <reference types="react-three-fiber" />

interface ImportMetaEnv {
    readonly VITE_GEMINI_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}