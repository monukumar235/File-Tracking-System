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
    attachment : [
        {
            fileName : {
                type : String,
                required : true
            },

            originalName :{
                type : String,
                required : true
            },
            mimeType : {
                type : String,
                required : true
            },
            size:{
                type : Number,
                required : true
            },
            data :{
                type : Buffer,
                required : true
            },
            uploadedBy :{
                type : mongoose.Types.ObjectId,
                required : true
            },
            uploadedAt : {
                type : Date,
                default : Date.now()
            }
        }
    ]

},{
    timeseries : true
});

export default mongoose.model("File",fileSchema);