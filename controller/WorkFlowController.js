import WorkFlowModel from "../models/WorkFlowModel.js";
import FileModel from "../models/File.js";
import mongoose from "mongoose";
import UserModel from "../models/User.js";
import createAuditLog from "../utils/Audit.js";


export const forwardFile = async (req, res) => {
    try {
        const { fileId, remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Id."
            });
        }

        const file = await FileModel.findById(fileId);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found."
            });
        }

        if (file.currentOwner.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denial."
            });
        }

        const currentUser = await UserModel.findById(req.userId);

        if (!currentUser.reportingTo) {
            return res.status(400).json({
                success: false,
                message: "Reporting manager is not configed."
            });
        }

        file.currentOwner = currentUser.reportingTo;
        file.status = "IN_PROGRESS";
        await file.save();

        await WorkFlowModel.create({
            fileId: file._id,
            fromUser: currentUser._id,
            toUser: currentUser.reportingTo,
            action: "FORWARD",
            remark: remarks

        });

        createAuditLog({
            userId: req.userId,
            fileId: file._id,
            module: "WORKFLOW",
            action: "FORWARD",
            description: "File forwarded"
        });

        return res.status(200).json({
            success: true,
            message: "File forwarded successfully."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const returnFile = async (req, res) => {
    try {
        const { fileId, remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid FileId."
            });
        }

        const file = await FileModel.findById(fileId);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found."
            });
        }

        if (file.currentOwner.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denail."
            });
        }

        const lastWorkFlow = await WorkFlowModel.findOne({
            fileId: file._id,
            toUser: req.userId
        }).sort({ createAt: -1 });

        if (!lastWorkFlow) {
            return res.status(404).json({
                success: false,
                message: "Previous user not found."
            });
        }

        file.currentOwner = lastWorkFlow.fromUser;

        await file.save();

        await WorkFlowModel.create({
            fileId: file._id,
            fromUser: req.userId,
            toUser: lastWorkFlow.fromUser,
            action: "RETURN",
            remark: remarks
        });

        createAuditLog({
            userId: req.userId,
            fileId: file._id,
            module: "WORKFLOW",
            action: "RETURN",
            description: "File returned"
        });

        return res.status(200).json({
            success: true,
            message: "File return successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const approveFile = async (req, res) => {
    try {
        const { fileId, remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(403).json({
                success: false,
                message: "Invalid FileId."
            });
        }

        const file = await FileModel.findById(fileId);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found."
            });
        }

        if (file.currentOwner.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denial."
            });
        }

        if (req.roles != "MINISTER") {
            return res.status(403).json({
                success: false,
                message: "Only Minister can approve this file."
            });
        }

        file.status = "APPROVED";
        file.closedBy = req.userId,
        file.closedDate = new Date();
        await file.save();

        await WorkFlowModel.create({
            fileId: file._id,
            fromUser: req.userId,
            toUser: null,
            action: "APPROVED",
            remark: remarks
        });

        createAuditLog({
            userId: req.userId,
            fileId: file._id,
            module: "WORKFLOW",
            action: "APPROVE",
            description: "File approved"
        });

        return res.status(200).json({
            success: true,
            message: "File approved successfully."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const rejectFile = async (req, res) => {
    try {

        const { fileId, remarks } = req.body;

        if (!mongoose.Types.ObjectId.isValid(fileId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid FileId."
            });
        }

        const file = await FileModel.findById(fileId);

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found."
            });
        }

        if (file.currentOwner.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: "Access denial."
            });
        }

        if (req.roles !== "MINISTER") {
            return res.status(403).json({
                success: false,
                message: "Only Minister can approve this file."
            });
        }

        file.status = "REJECTED";
        file.closedBy = req.userId,
        file.closedDate = new Date();

        await file.save();

        await WorkFlowModel.create({
            fileId: file._id,
            fromUser: req.userId,
            toUser: null,
            action: "REJECT",
            remark: remarks
        });

        createAuditLog({
            userId: req.userId,
            fileId: file._id,
            module: "WORKFLOW",
            action: "REJECT",
            description: "File rejected"
        });

        return res.status(200).json({
            success: true,
            message: "File rejected successfully."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
}


export const remarksHistory = async (req,res)=>{
    try {
        const {fileId}  = req.params;

        if(!mongoose.Types.ObjectId.isValid(fileId))
        {
            return res.status(400).json({
                success : false,
                message : "Invalid file id."
            });
        }

        const history = await WorkFlowModel.find({
            fileId
        }).populate("fromUser", "name role").populate("toUser","name role").sort({createdAt : -1});

        return res.status(200).json({
            success : true,
            data : history
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}