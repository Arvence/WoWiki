import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App'
import CommunityEntryDetailPage from './features/community/pages/CommunityEntryDetailPage'
import NewsDetailPage from './features/news/pages/NewsDetailPage'

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
    path: '/community/:entryId',
    element: <CommunityEntryDetailPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
