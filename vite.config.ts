import { remoteProxyPlugin } from 'vite-remote-proxy-plugin';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
const target = "http://domain.com";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(),
    remoteProxyPlugin({
    target: target,
    bundles: [{ dataName: "public", entryPoint: "examples/basic/main.jsx" }],
  })],
})
