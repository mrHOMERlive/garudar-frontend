import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"

function App() {
  return (
    <>
      <Pages />
      <Toaster />
      <SonnerToaster position="top-center" richColors />
    </>
  )
}

export default App