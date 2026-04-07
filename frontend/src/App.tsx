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
import UserCart from './pages/UserCart.tsx'
import UserPlaceholderPage from './pages/UserPlaceholderPage.tsx'
import UserVendorCategory from './pages/UserVendorCategory.tsx'
import UserVendorShop from './pages/UserVendorShop.tsx'
import VendorHome from './pages/VendorHome.tsx'
import VendorAddItem from './pages/VendorAddItem.tsx'
import VendorPlaceholderPage from './pages/VendorPlaceholderPage.tsx'
import VendorRequestItem from './pages/VendorRequestItem.tsx'
import VendorYourItems from './pages/VendorYourItems.tsx'
import VendorTransactionHub from './pages/VendorTransactionHub.tsx'
import VendorTransactionRecords from './pages/VendorTransactionRecords.tsx'
import VendorUserRequests from './pages/VendorUserRequests.tsx'
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
              <VendorYourItems />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/add-item"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorAddItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/product-status"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorPlaceholderPage title="Product Status" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/request-item"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorRequestItem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/transactions"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorTransactionHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/transactions/records"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorTransactionRecords />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendor/transactions/user-requests"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorUserRequests />
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
        <Route
          path="/user/cart"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserCart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/guest-list"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserPlaceholderPage title="Guest List" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/order-status"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserPlaceholderPage title="Order Status" />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/vendors/:category"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserVendorCategory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/shop/:vendorId"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserVendorShop />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
