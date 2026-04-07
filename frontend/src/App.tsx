import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import AdminHome from './pages/AdminHome.tsx'
import MaintainUserPage from './pages/MaintainUserPage.tsx'
import AdminAddVendor from './pages/AdminAddVendor.tsx'
import AdminUserManagementAdd from './pages/AdminUserManagementAdd.tsx'
import AdminUserManagementUpdate from './pages/AdminUserManagementUpdate.tsx'
import AdminUserMembershipAdd from './pages/AdminUserMembershipAdd.tsx'
import AdminUserMembershipUpdate from './pages/AdminUserMembershipUpdate.tsx'
import AdminVendorManagementUpdate from './pages/AdminVendorManagementUpdate.tsx'
import AdminVendorMembershipAdd from './pages/AdminVendorMembershipAdd.tsx'
import AdminVendorMembershipUpdate from './pages/AdminVendorMembershipUpdate.tsx'
import MaintainVendorPage from './pages/MaintainVendorPage.tsx'
import PendingVendorsPage from './pages/PendingVendorsPage.tsx'
import Login from './pages/Login.tsx'
import Signup from './pages/Signup.tsx'
import UserHome from './pages/UserHome.tsx'
import UserCart from './pages/UserCart.tsx'
import UserCheckout from './pages/UserCheckout.tsx'
import UserGuestList from './pages/UserGuestList.tsx'
import UserOrderStatus from './pages/UserOrderStatus.tsx'
import UserVendorCategory from './pages/UserVendorCategory.tsx'
import UserVendorShop from './pages/UserVendorShop.tsx'
import VendorHome from './pages/VendorHome.tsx'
import VendorAddItem from './pages/VendorAddItem.tsx'
import VendorRequestItem from './pages/VendorRequestItem.tsx'
import VendorYourItems from './pages/VendorYourItems.tsx'
import VendorProductStatus from './pages/VendorProductStatus.tsx'
import VendorTransactionHub from './pages/VendorTransactionHub.tsx'
import VendorTransactionRecords from './pages/VendorTransactionRecords.tsx'
import VendorOrderUpdateStatus from './pages/VendorOrderUpdateStatus.tsx'
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
              <AdminUserMembershipAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/membership/update"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminUserMembershipUpdate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/management/add"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminUserManagementAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users/management/update"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminUserManagementUpdate />
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
              <AdminVendorMembershipAdd />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors/membership/update"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminVendorMembershipUpdate />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors/management/add"
          element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminAddVendor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/vendors/pending-approvals"
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
              <AdminVendorManagementUpdate />
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
              <VendorProductStatus />
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
          path="/vendor/transactions/orders/:orderId/update-status"
          element={
            <ProtectedRoute allowedRole="VENDOR">
              <VendorOrderUpdateStatus />
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
          path="/user/checkout"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserCheckout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/guest-list"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserGuestList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/order-status"
          element={
            <ProtectedRoute allowedRole="USER">
              <UserOrderStatus />
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
