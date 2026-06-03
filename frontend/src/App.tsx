import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './context/useAuth'
import LoginPage from './pages/LoginPage'
import TopPage from './pages/TopPage'
import TransactionsPage from './pages/TransactionsPage'
import TransactionFormPage from './pages/TransactionFormPage'
import AccountsPage from './pages/AccountsPage'
import CategoriesPage from './pages/CategoriesPage'
import SummaryPage from './pages/SummaryPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ textAlign: 'center', marginTop: 80, color: 'var(--color-text-sub)' }}>読み込み中...</div>
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><TopPage /></PrivateRoute>} />
      <Route path="/transactions" element={<PrivateRoute><TransactionsPage /></PrivateRoute>} />
      <Route path="/transactions/new" element={<PrivateRoute><TransactionFormPage /></PrivateRoute>} />
      <Route path="/transactions/:id/edit" element={<PrivateRoute><TransactionFormPage /></PrivateRoute>} />
      <Route path="/accounts" element={<PrivateRoute><AccountsPage /></PrivateRoute>} />
      <Route path="/categories" element={<PrivateRoute><CategoriesPage /></PrivateRoute>} />
      <Route path="/summary" element={<PrivateRoute><SummaryPage /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
