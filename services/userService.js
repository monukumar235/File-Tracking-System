import User from "../models/User.js";


export const getAllUsersData = async (req ,res)=>{
    const users = await User.find({ isActive: true }).select("-password").populate("reportingTo", "name email role");
    return users;
}