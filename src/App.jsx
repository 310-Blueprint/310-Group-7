import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/routing/ProtectedRoute'
import PublicOnlyRoute from './components/routing/PublicOnlyRoute'
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import DocumentsPage from './pages/documents/DocumentsPage'
import TaskListPage from './pages/tasks/TaskListPage'
import CalendarPage from './pages/calendar/CalendarPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'

/*
 * Routing table. Three kinds of route:
 *
 *   PublicOnlyRoute — auth forms; signed-in users get sent to the dashboard.
 *   ProtectedRoute  — the real app; signed-out users get sent to login.
 *   unguarded       — /reset-password only. The recovery link creates a real
 *                     session, so PublicOnlyRoute would bounce it, and an
 *                     expired link has no session, so ProtectedRoute would
 *                     dump the user on login with no explanation. The page
 *                     handles both cases itself.
 *
 * "/" is the login page for now — it becomes the landing page later, with
 * login moving to "/login".
 */
function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignUpPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/documents"
        element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <TaskListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <AnalyticsPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
