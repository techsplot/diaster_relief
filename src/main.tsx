import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import "@progress/kendo-theme-default/dist/all.css";

// Initialize KendoReact Licensing
import '@progress/kendo-licensing';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
