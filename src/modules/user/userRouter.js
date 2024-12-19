import {Router} from 'express';
const router=Router();
import * as userController from './userController.js'
import * as userSchema from './userSchema.js';
import {validation} from '../../middlewares/validationMiddleware.js';

//signup
router.post('/signup',validation(userSchema.signup),userController.signup);

//activate account
router.get('/activate_account/',userController.activateAccount);

//login
router.post('/login',validation(userSchema.login),userController.login);

//forgetCode
router.patch('/forgetCode',validation(userSchema.forgetCode),userController.forgetCode)

//reset password
router.patch('/resetPassword',validation(userSchema.resetPassword),userController.resetPassword);
export default router;

