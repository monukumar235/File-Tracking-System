import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: [
            "ADMIN",
            "MINISTER",
            "SECRETARY",
            "DIRECTOR",
            "EXECUTIVE_1",
            "EXECUTIVE_2",
            "CLERK"
        ],
        required : true
    },
    reportingTo : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        default : null
    },
    isActive :{
        type : Boolean,
        default : true
    }
},{
    timestamps : true
});


export default mongoose.model("User",userSchema)
