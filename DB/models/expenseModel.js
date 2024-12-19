import { model, Schema, Types } from "mongoose";

const expenseSchema=new Schema({
    title:{type:String,required:true,min:3,max:25},
    amount:{type:Number,required:true},
    category:{type:String,required:true,enum:["Groceries", "Leisure", "Electronics", "Utilities", "Clothing", "Health", "Others"]},
    date:{type:Date,required:true},
    userId:{type:Types.ObjectId,ref:"User",required:true}
},{timestamps:true,strictQuery:true,});


expenseSchema.query.paginate = function (page, limit = 4) {
    page = page < 1 || isNaN(page) || !page ? 1 : page;
    const skip = limit * (page - 1);
    return this.skip(skip).limit(limit);
};

expenseSchema.query.search=function (keyword){
    //this>>query
    if(keyword){
        return this.find({title:{$regex:keyword,$options:"i"}});
    }
};


export const Expense=model("Expense",expenseSchema);