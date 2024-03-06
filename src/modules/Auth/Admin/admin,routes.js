import { isAuthAdmin } from '../../../middlewares/auth.admin.js';
import { multerCloudFunction } from '../../../services/multerCloud.js';
import { allowedExtensions } from '../../../utils/allowedExtensions.js';
import { asyncHandler } from '../../../utils/errorhandling.js';
import * as ac from './admin.controller.js'
import { Router } from "express";   
const router = Router()


router.post('/',asyncHandler(ac.SignUp))
router.post('/phonenumber',asyncHandler(ac.signInP))
router.post('/OTP',asyncHandler(ac.signInO))
router.put('/updateprofile',isAuthAdmin(),multerCloudFunction(allowedExtensions.Image).single('image'),asyncHandler(ac.updateProfile))
router.post('/addengineer',isAuthAdmin(),asyncHandler(ac.addEngineer))
router.get('/getengby',asyncHandler(ac.getEngBy))
router.put('/updateEng',isAuthAdmin(),multerCloudFunction(allowedExtensions.Image).single('image'),asyncHandler(ac.updateEng))
router.delete('/delete',isAuthAdmin(),asyncHandler(ac.deleteEng))





export default router;