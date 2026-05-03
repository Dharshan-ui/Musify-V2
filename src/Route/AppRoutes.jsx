import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Home from '../Pages/Home'
import Login from '../Pages/Login'
import Register from '../Pages/Register'
import ForgotPassword from '../Pages/ForgotPassword'
import AlbumPage from '../AlbumLandingPages/AlbumPage'
import ProfilePage from '../UserProfile/ProfilePage'
import EditProfile from '../UserProfile/EditProfile'
import ChangePassword from '../UserProfile/ChangePassword'
import UploadPhoto from '../UserProfile/UploadPhoto'
import Settings from '../UserProfile/Settings'
import AdminDashboard from '../Admin/AdminDashboard'
import UploadSong from '../Admin/UploadSong'
import ManageAlbums from '../Admin/ManageAlbums'
import AdminLogin from '../Admin/AdminLogin'
import ProtectedAdminRoute from '../Admin/ProtectedAdminRoute'
import AdminRoute from '../Admin/AdminRoute'
import AdminUsers from '../Admin/AdminUsers'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />
      },
      {
        path: 'album/:id',
        element: <AlbumPage />
      },
      {
        path: 'profile',
        element: <ProfilePage />
      },
      {
        path: 'profile/edit',
        element: <EditProfile />
      },
      {
        path: 'profile/change-password',
        element: <ChangePassword />
      },
      {
        path: 'profile/upload-photo',
        element: <UploadPhoto />
      },
      {
        path: 'profile/settings',
        element: <Settings />
      },
      {
        path: 'settings',
        element: <Settings />
      },
      {
        path: 'admin',
        element: (
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )
      },
      {
        path: 'admin/login',
        element: <AdminLogin />
      },
      {
        path: 'admin/upload-song',
        element: (
          <AdminRoute>
            <UploadSong />
          </AdminRoute>
        )
      },
      {
        path: 'admin/albums',
        element: (
          <AdminRoute>
            <ManageAlbums />
          </AdminRoute>
        )
      },
      {
        path: 'admin/users',
        element: (
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        )
      }
    ]
  }
])

export default router
