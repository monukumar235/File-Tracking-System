import mongoose from "mongoose";


const auditLogsSchema = new mongoose.Schema({

    userId :{
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },

    fileId : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        default : null
    },
    module : {
        type : String,
        required : true
    },
    action :{
        type : String,
        required : true
    },
    description :{
        type : String
    }
},{
    timestamps : true
});
 
export default mongoose.model("AuditLogs",auditLogsSchema);