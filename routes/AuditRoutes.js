import express from "express";
import { authenticate } from "../middleware/authorization.js";
import { RoleBasedAuthorization } from "../middleware/roleBasedAuthorization.js";
import { getAuditlogs,getFileAuditLogs } from "../controller/AuditController.js";

const auditRoutes = express.Router();

auditRoutes.get("/",authenticate,RoleBasedAuthorization("ADMIN"),getAuditlogs);
auditRoutes.get("/:fileId",authenticate,getFileAuditLogs);

export default auditRoutes;