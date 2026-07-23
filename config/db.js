import mongoose, { connect } from "mongoose";


export  const connectToDb = async (req,res)=>{
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Successfully connected to Database!");
    } catch (error) {
        console.log("error while connecting to database");
        console.log("message",error.message);
        process.exit(1);
    }
}