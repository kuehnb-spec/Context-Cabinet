import { ElectronAPI } from '@electron-toolkit/preload'

interface ContextCabinetAPI {
  ping: () => Promise<string>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: ContextCabinetAPI
  }
}
