import { Router } from 'express'
const router = Router()
import * as ec from '../../../../src/modules/Auth/Engineers/eng.controller.js'
import { asyncHandler } from '../../../../src/utils/errorhandling.js'
import { allowedExtensions } from '../../../utils/allowedExtensions.js'
import { isAuth } from '../../../middlewares/auth.eng.js'
import { multerCloudFunction } from '../../../services/multerCloud.js'

router.post('/signUp',multerCloudFunction(allowedExtensions.Image).single('image'), asyncHandler(ec.signUp))
router.get('/confirm/:token', asyncHandler(ec.confirmEmail))
router.post('/login', asyncHandler(ec.logIn)) 
router.post('/logout', isAuth(),asyncHandler(ec.logOut)) 
 router.post('/addPost',isAuth(),multerCloudFunction(allowedExtensions.Image).array('image',10),asyncHandler(ec.communityPage)) 
 router.post('/updatePost',isAuth(),multerCloudFunction(allowedExtensions.Image).array('image',10),asyncHandler(ec.updatePost)) 
 router.delete('/deletepost',isAuth(),asyncHandler(ec.deletePost)) 
 router.get('/getUser',isAuth(),asyncHandler(ec.getEngAccount))
 router.get('/GetPosts',isAuth(),asyncHandler(ec.getAllPosts))
 router.post('/Profile',isAuth(),multerCloudFunction(allowedExtensions.Image).single('image'), asyncHandler(ec.profilePic))


export default router