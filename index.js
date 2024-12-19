import express from 'express';
import dotenv from 'dotenv';
import {connectDB} from './DB/connection.js';
import userRouter from './src/modules/user/userRouter.js';
import expenseRouter from './src/modules/expense/expenseRouter.js';
dotenv.config();
const app = express()

await connectDB();

app.use(express.json())

//Routers
app.use("/user",userRouter);
app.use('/expense',expenseRouter);

app.use('*', (req, res,next) =>{
    return next(new Error("page not found",{cause:404}))
})

app.use((error,req,res,next)=>{
    const statusCode=error.cause||500;
    return res.status(statusCode).json({
        success:false,
        message:error.message,
        stack:error.stack
    });
});

app.listen(process.env.PORT, () => console.log(`App listening at ${process.env.PORT}`));