import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { AppProviders } from './app/providers.tsx'
import { router } from './app/router.tsx'
import { AuthProvider } from '@/lib/auth'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppProviders>
  </StrictMode>,
)
