import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

// QueryClient = motor de cache — como RESULT_CACHE a nivel de app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // datos frescos por 5 minutos sin re-fetch
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
)

// Elimina el pre-loader una vez que React monta la app
document.getElementById('pre-loader')?.remove()
