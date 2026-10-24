import 'temporal-polyfill/full/global';

import express from "express";
import authRoutes from '../modules/auth/auth.route.js'
import loansRoutes from '../modules/loans/loans.routes.js'


const router  = express.Router()

router.use('/auth',authRoutes)
router.use('/loans',loansRoutes)

export default router 