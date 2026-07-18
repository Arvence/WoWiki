import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App'
import CommunityEntryDetailPage from './features/community/pages/CommunityEntryDetailPage'
import CommunityPage from './features/community/pages/CommunityPage'
import NewsDetailPage from './features/news/pages/NewsDetailPage'
import ContactPage from './pages/ContactPage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import AboutPage from './pages/AboutPage'
import CareersPage from './pages/CareersPage'
import DatabaseCollectionPage from './pages/DatabaseCollectionPage'
import DatabaseIndexPage from './pages/DatabaseIndexPage'
import AuthPage from './features/auth/AuthPage'
import ProfilePage from './features/auth/ProfilePage'

export const router = createBrowserRouter([
  { path: '/auth', element: <AuthPage /> },
  { path: '/profile', element: <ProfilePage /> },
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/news/:newsId',
    element: <NewsDetailPage />,
  },
  {
    path: '/community',
    element: <CommunityPage />,
  },
  {
    path: '/community/:entryId',
    element: <CommunityEntryDetailPage />,
  },
  {
    path: '/database',
    element: <DatabaseIndexPage />,
  },
  {
    path: '/database/:collection',
    element: <DatabaseCollectionPage />,
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
