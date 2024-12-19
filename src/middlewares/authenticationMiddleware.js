import { Token } from "../../DB/models/tokenModel.js";
import { User } from "../../DB/models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from 'jsonwebtoken';

export const isAuthenticated=asyncHandler(async(req,res,next)=>{
    let token=req.headers["token"];
    if(!token || !token.startsWith(process.env.BEARER_KEY)) return next(new Error("valid token is required!"));

    token=token.split(process.env.BEARER_KEY)[1];
    const payload=jwt.verify(token,process.env.SECRET_KEY);

    const tokenDB=await Token.findOne({token,isValid:true});
    if(!tokenDB)
        return next(new Error("Invalid token!",{cause:403}));

    const user= await User.findById(payload.id);
    if(!user) return next(new Error("User not found!",{cause:404}));

    req.user=user;
    return next();
});