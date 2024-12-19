import joi from 'joi';
import { isValidObjectId } from '../../middlewares/validationMiddleware.js';


export const addExpense=joi.object({
    title:joi.string().min(3).max(25).required(),
    amount:joi.number().required(),
    category:joi.string().required(),
    date:joi.date().required(),
}).required();

export const updateExpense=joi.object({
    id:joi.string().custom(isValidObjectId).required(),
    title:joi.string().min(3).max(25).required(),
    amount:joi.number().required(),
    category:joi.string().required(),
    date:joi.date().required(),
}).required();

export const deleteExpense=joi.object({
    id:joi.string().custom(isValidObjectId).required(),
}).required();