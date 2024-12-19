import { Expense } from "../../../DB/models/expenseModel.js";
import { asyncHandler } from "../../utils/asyncHandler.js";


export const addExpense=asyncHandler(async(req,res,next)=>{
    const allowedCategories = [
        "Groceries",
        "Leisure",
        "Electronics",
        "Utilities",
        "Clothing",
        "Health",
        "Others",
    ];
    
    if (!allowedCategories.includes(req.body.category)) {
        return next(new Error("Invalid category. Please choose a valid category.",{cause:400})) 
        
    }
    const expense=await Expense.create({...req.body,userId: req.user.id});

    return res.status(201).json({
        success:true,
        message: "Expense added successfully",
        data: expense,
    });
});

export const allExpenses = asyncHandler(async (req, res, next) => {
    let { page = 1, sort = "-date", keyword, category, filter } = req.query;
    let expensesQuery = Expense.find({ userId: req.user._id }); // Start with userId filter

    const allowedCategories = [
        "Groceries", "Leisure", "Electronics", "Utilities","Clothing", "Health", "Others"];

    // Validate category if it's provided
    if (category && !allowedCategories.includes(category)) {
        return next(new Error("Invalid category provided!", { cause: 400 }));
    }

    // Apply category filter if it's provided
    if (category) {
        expensesQuery = expensesQuery.where("category").equals(category); // Apply category filter
    }

    // Apply search filter if keyword is provided
    if (keyword) {
        expensesQuery = expensesQuery.search(keyword); // Apply search
    }

    // Handle date filters (Past week, Last month, Last 3 months)
    if (filter) {
        const now = new Date();
        let startDate;

        if (filter === 'past-week') {
            startDate = new Date(now.setDate(now.getDate() - 7)); // 7 days ago
        } else if (filter === 'last-month') {
            startDate = new Date(now.setMonth(now.getMonth() - 1)); // 1 month ago
        } else if (filter === 'last-3-months') {
            startDate = new Date(now.setMonth(now.getMonth() - 3)); // 3 months ago
        }

    }

    // Apply sorting (e.g., ascending or descending by date)
    if (sort === 'date') {
        expensesQuery = expensesQuery.sort('date');  // Ascending order by date
    } else if (sort === '-date') {
        expensesQuery = expensesQuery.sort('-date');  // Descending order by date
    } else {
        expensesQuery = expensesQuery.sort('-date');  // Default to descending by date
    }

    // Apply pagination
    const expenses = await expensesQuery.lean().paginate(page); // Use .lean() here

    return res.json({
        success: true,
        results: expenses,
    });

});


export const updateExpense=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
    const {title,date,amount,category}=req.body;

    const allowedCategories = [
        "Groceries",
        "Leisure",
        "Electronics",
        "Utilities",
        "Clothing",
        "Health",
        "Others",
    ];
    
    if (!allowedCategories.includes(req.body.category)) {
        return next(new Error("Invalid category. Please choose a valid category.",{cause:400})) 
        
    }

    const expense=await Expense.findById(id);
    if(!expense)
        return next(new Error("Expense not found!",{cause:404}));

    if(expense.userId.toString()!==req.user.id)
        return next(new Error("Not authorized to update!",{cause:403}));


    const updatedExpense=await Expense.findByIdAndUpdate(id,{title,amount,date,category},{new:true});

    return res.json({
        success:true,
        message:"Expense updated successfully:)",
        results:updatedExpense
    });    
});

export const deleteExpense=asyncHandler(async(req,res,next)=>{
    const {id}=req.params;
    const expense=await Expense.findById(id);
    
    if(!expense)
        return next(new Error("Expense not found!",{cause:404}));

    if(expense.userId.toString()!==req.user.id)
        return next(new Error("Not authorized to update!",{cause:403}));

    await Expense.findByIdAndDelete(id);

    return res.json({
        success:true,
        message:"Expense deleted successfully:)",
    });    
});