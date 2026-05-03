import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { MusicProvider } from './Context/MusicContext'
import { Toaster } from 'react-hot-toast'
import router from './Route/AppRoutes'
import './Style.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MusicProvider>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 15, 46, 0.9)',
            color: '#e2e8f0',
            border: '1px solid rgba(59, 108, 244, 0.2)'
          }
        }}
      />
    </MusicProvider>
  </StrictMode>
)