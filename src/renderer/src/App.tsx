import { AppShell } from './components/layout/AppShell'
import { ToastProvider } from './components/shared/Toast'

function App(): JSX.Element {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  )
}

export default App
