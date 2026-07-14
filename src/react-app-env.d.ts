/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_PORTFOLIO_CONTENT_URL?: string;
    readonly REACT_APP_SERVICE_ID?: string;
    readonly REACT_APP_TEMPLATE_ID?: string;
    readonly REACT_APP_PUBLIC_KEY?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
