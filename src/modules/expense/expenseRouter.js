import {Router} from 'express';
import * as expenseController from './expenseController.js';
import * as expenseSchema from './expenseSchema.js';
import { isAuthenticated } from './../../middlewares/authenticationMiddleware.js';
import { validation } from '../../middlewares/validationMiddleware.js';
const router=Router();


///add new expense
router.post('/',isAuthenticated,validation(expenseSchema.addExpense),expenseController.addExpense);
//get all expenses
router.get('/',isAuthenticated,expenseController.allExpenses);
//update existed expense
router.patch('/:id',isAuthenticated,validation(expenseSchema.updateExpense),expenseController.updateExpense)
//delete expense
router.delete('/:id',isAuthenticated,validation(expenseSchema.deleteExpense),expenseController.deleteExpense)
export default router;