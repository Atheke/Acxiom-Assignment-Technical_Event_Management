import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminHome from './pages/AdminHome.tsx'
import AdminPlaceholderPage from './pages/AdminPlaceholderPage.tsx'
import MaintainUserPage from './pages/MaintainUserPage.tsx'
import MaintainVendorPage from './pages/MaintainVendorPage.tsx'
import PendingUsersPage from './pages/PendingUsersPage.tsx'
import PendingVendorsPage from './pages/PendingVendorsPage.tsx'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import UserHome from './pages/UserHome.tsx'
import VendorHome from './pages/VendorHome.tsx'
import VendorPlaceholderPage from './pages/VendorPlaceholderPage.tsx'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <MaintainUserPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/membership/add"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminPlaceholderPage
                title="Membership — Add"
                homeTo="/admin/users"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/membership/update"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminPlaceholderPage
                title="Membership — Update"
                homeTo="/admin/users"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/management/add"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <PendingUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/management/update"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminPlaceholderPage
                title="User Management — Update"
                homeTo="/admin/users"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <MaintainVendorPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors/membership/add"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminPlaceholderPage
                title="Membership — Add"
                homeTo="/admin/vendors"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors/membership/update"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminPlaceholderPage
                title="Membership — Update"
                homeTo="/admin/vendors"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors/management/add"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <PendingVendorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors/management/update"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminPlaceholderPage
                title="Vendor Management — Update"
                homeTo="/admin/vendors"
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/your-items"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorPlaceholderPage title="Your Item" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/add-item"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorPlaceholderPage title="Add New Item" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/transactions"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorPlaceholderPage title="Transection" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserHome />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
