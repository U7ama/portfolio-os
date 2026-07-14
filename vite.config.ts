import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    // Preserve the existing deployment output directory used by CRA.
    build: {
        outDir: 'build',
    },
    // Keep the existing Cloudflare environment-variable names working.
    // These values are consumed by EmailJS in the browser and are public IDs.
    envPrefix: ['VITE_', 'REACT_APP_'],
});
