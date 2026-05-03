import { Navigate } from 'react-router-dom'
import { isAdminAuthenticated } from '../utils/adminStore'

const ProtectedAdminRoute = ({ children }) => {
  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

export default ProtectedAdminRoute
