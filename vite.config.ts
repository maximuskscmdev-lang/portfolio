import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { heroEditorPlugin } from './vite-hero-editor-plugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), heroEditorPlugin()],
})
