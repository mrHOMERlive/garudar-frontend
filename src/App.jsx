import './App.css';
import Pages from '@/pages/index.jsx';
import { Toaster as SonnerToaster } from 'sonner';

function App() {
  return (
    <>
      <Pages />
      <SonnerToaster position="top-center" richColors />
    </>
  );
}

export default App;
