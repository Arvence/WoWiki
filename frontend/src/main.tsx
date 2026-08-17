import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { router } from './router'
import { AuthProvider } from './features/auth/AuthContext'
import { BookmarksProvider } from './features/bookmarks/BookmarksContext'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider><BookmarksProvider><RouterProvider router={router} /></BookmarksProvider></AuthProvider>
  </React.StrictMode>
)
