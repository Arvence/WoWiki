import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App'
import CommunityEntryDetailPage from './features/community/pages/CommunityEntryDetailPage'
import NewsDetailPage from './features/news/pages/NewsDetailPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import AboutPage from './pages/AboutPage'
import CareersPage from './pages/CareersPage'

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
    path: '/privacy',
    element: <PrivacyPage />,
  },
  {
    path: '/terms',
    element: <TermsPage />,
  },
  {
    path: '/contact',
    element: <ContactPage />,
  },
  {
    path: '/about',
    element: <AboutPage />,
  },
  {
    path: '/careers',
    element: <CareersPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
