import { Router } from 'express'
import * as admin from '../controllers/admin.controller.js'

const router = Router()

router.get('/users', admin.listEndUsers)
router.post('/users', admin.createEndUser)
router.get('/vendors', admin.listAllVendors)
router.get('/vendor-memberships', admin.listVendorMembershipRows)
router.post('/vendors', admin.createVendor)
router.get('/memberships', admin.listMemberships)
router.post('/memberships', admin.createMembership)
router.get('/approved-vendors', admin.approvedVendorsForMembership)
router.post('/vendor-memberships', admin.createVendorMembership)
router.get('/pending-vendors', admin.pendingVendors)
router.get('/pending-users', admin.pendingUsers)
router.post('/vendors/:vendorId/approve', admin.approveVendor)
router.post('/vendors/:vendorId/reject', admin.rejectVendor)

export default router
