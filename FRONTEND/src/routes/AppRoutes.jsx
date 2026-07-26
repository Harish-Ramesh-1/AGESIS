import { Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from '../pages/Login'
import ParentRoutes from './ParentRoutes'
import AccountantRoutes from './AccountantRoutes'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/parent/*" element={<ParentRoutes />} />
      <Route path="/accountant/*" element={<AccountantRoutes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
