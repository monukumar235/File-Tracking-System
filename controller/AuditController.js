import AuditLogsModel from "../models/AuditLogsModel.js";


export const getAuditlogs = async (req,res)=>{
    try {
        const logs = await AuditLogsModel.find().populate("userId","name role").populate("fileId","fileNumber subject").sort({createdAt :-1});

        return res.status(200).json({
            success :true,
            count : logs.length,
            data : logs
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}


export const getFileAuditLogs = async (req,res)=>{
    try {
        const {fileId} = req.params;

        const logs = await AuditLogsModel.find({fileId}).populate("userId","name role").sort({createdAt :-1});

        return res.status(200).json({
            success : true,
            data : logs
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}