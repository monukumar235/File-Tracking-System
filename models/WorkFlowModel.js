import mongoose from "mongoose";


const workFlowSchema = new mongoose.Schema({
    fileId : {
        type : mongoose.Types.ObjectId,
        ref : "File",
        required : true
    },
    fromUser :{
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    toUser :{
        type : mongoose.Types.ObjectId,
        ref : "User",
        default : null
    },
    action :{
        type : String,
        enum :[
            "SUBMITTED",
            "FORWARD",
            "RETURN",
            "APPROVE",
            "REJECT"
        ]
    },
    remark :{
        type : String,
    }
},{timeseries : true});

export default mongoose.model("WorkFlow",workFlowSchema);