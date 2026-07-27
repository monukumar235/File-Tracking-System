import AuditLogsModel from "../models/AuditLogsModel.js";




const createAuditLog  = async ({userId,fileId=null,module,action,description})=>{
    await AuditLogsModel.create({
        userId,
        fileId,
        module,
        action,
        description
    }); 
}

export default createAuditLog;