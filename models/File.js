import mongoose, { Types } from "mongoose";


const fileSchema = new mongoose.Schema({

    fileNumber :{
        type : String,
        unique : true,
        required :true
    },
    subject : {
        type : String,
        required : true
    },
    description : {
        type : String,
    },
    priority :{
        type : String,
        enum : ["LOW","MEDIUM","HIGH"],
        default : "MEDIUM"
    },
    status : {
        type : String,
        enum : [
            "DRAFT",
            "SUBMITTED",
            "IN_PROGRESS",
            "APPROVED",
            "REJECTED",
            "CLOSED"
        ],
        default : "DRAFT"
    },
    createdBy : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        required : true
    },
    currentOwner : {
        type : mongoose.Types.ObjectId,
        ref : "User",
        default : null
    },
    closedBy :{
        type : mongoose.Types.ObjectId,
        ref : "User",
        default : null
    },
    closedDate : {
        type : Date,
        default : null
    },
    attachment : {
        type :String,
        default : null
    }

},{
    timeseries : true
});

export default mongoose.model("File",fileSchema);