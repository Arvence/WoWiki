import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App'
import NewsDetailPage from './pages/NewsDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/news/:newsId',
    element: <NewsDetailPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
