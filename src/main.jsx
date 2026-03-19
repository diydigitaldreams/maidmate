import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './useAuth'
import MaidMate from './MaidMate'

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <MaidMate />
  </AuthProvider>
)
