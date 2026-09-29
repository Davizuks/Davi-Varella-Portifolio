import { createBrowserRouter } from 'react-router-dom'
import { HomePage } from '@/presentation/pages/HomePage/HomePage'
import { NotFoundPage } from '@/presentation/pages/NotFoundPage/NotFoundPage'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '*', element: <NotFoundPage /> },
])
