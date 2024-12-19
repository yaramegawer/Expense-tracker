import { User } from "../../../DB/models/userModel.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import bcrypt from 'bcryptjs';
import { sendEmail } from "../../utils/sendEmail.js";
import jwt from 'jsonwebtoken';
import { Token } from './../../../DB/models/tokenModel.js';
import randomstring from 'randomstring';

export const signup=asyncHandler(async(req,res,next)=>{
    //get data from body
    const {email,userName,password,confirmPassword}=req.body;

    //check user existence
    const user=await User.findOne({email});
    if(user)
        return next(new Error("User already exists",{cause:403}));
    //hash password
    const hashedPassword=bcrypt.hashSync(password,parseInt(process.env.SALT_ROUND));

    //create user
    await User.create({...req.body,password:hashedPassword})

    //generate token
    const token=jwt.sign({email},process.env.SECRET_KEY)
    //create confirmationLink
    const confirmationLink=`http://localhost:3000/user/activate_account/?email=${email}`;

    //send email
    const messageSent=await sendEmail({to:email,subject:"Activate account",html:`<a href=${confirmationLink}>Activate account</a>`})
    if(!messageSent)
        return next(new Error("Something went wrong!!",{cause:400}));

    return res.status(201).json({
        success:true,
        message:"User registered successfully!"
    });
});

export const activateAccount=asyncHandler(async(req,res,next)=>{
    const {email}=req.query;
    const user=await User.findOneAndUpdate({email},{isConfirmed:true});
    if(!user)
        return next(new Error("User not found!",{cause:404}));

    return res.json({
        success:true,
        message:"try to login now :)"
    });
});

export const login=asyncHandler(async(req,res,next)=>{
    //check if user in DB
    const {email,password}=req.body;
    const user=await User.findOne({email});
    if(!user)
        return next(new Error("Invalid email!",{cause:404}));

    //check if confirmed
    if(!user.isConfirmed)
        return next(new Error("You have to activate your account first!",{cause:403}));

    //check password
    const match=bcrypt.compareSync(password,user.password);
    if(!match)
        return next(new Error("Invalid password!",{cause:403}));

    let token=jwt.sign({email,id:user._id},process.env.SECRET_KEY);
    token=await Token.create({token,user:user._id});

    //send response
    return res.json({
        success:true,
        message:"User logged in successfully",
        token:{token}

    })
});

export const forgetCode=asyncHandler(async(req,res,next)=>{
    //get data from body
    const {email}=req.body;

    //check user existence
    const user=await User.findOne({email});
    if(!user)
        return next(new Error("Invalid email!",{cause:404}));

    //check if user is confirmed
    if(!user.isConfirmed)
        return next(new Error("You must activate your account first!",{cause:403}));

    //generate code
    const forgetCode=randomstring.generate({
        charset:"numeric",
        length:5
    });
    user.forgetCode=forgetCode;
    await user.save();

    //send email
    const messageSent=await sendEmail({
        to:email,
        subject:"Reset Password",
        html:`Your code to reset your account is ${forgetCode}`,
    });
    if(!messageSent)
        return next(new Error("Something went wrong!",{cause:400}));

    //send response 
    res.json({
        success:true,
        message:"Check your email"
    });
});

export const resetPassword=asyncHandler(async(req,res,next)=>{
    //get data from user
    const {email,password,confirmPassword,forgetCode}=req.body;
    //check user existence
    const user=await User.findOne({email});
    if(!user)
        return next(new Error("Invalid email!",{cause:404}));

    //check if forgetCode is correct
    if(forgetCode!==user.forgetCode)
        return next(new Error("Invalid code!",{cause:403}));

    //hash password
    user.password=bcrypt.hashSync(password,parseInt(process.env.SALT_ROUND));
    await user.save();

    //invalidate all user's tokens
    const tokens=await Token.find({user:user._id});

    tokens.forEach(async(token)=>{
        token.isValid=false;
        await token.save();
    });

    return res.json({
        success:true,
        message:"Password reset successfully, try to login now :)"
    });
});
