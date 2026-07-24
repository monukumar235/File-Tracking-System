import FileModel from "../models/File.js";
import crypto from 'node:crypto';
import mongoose from "mongoose";
import User from "../models/User.js";
import WorkFlowModel from "../models/WorkFlowModel.js";

export const createFile = async (req, res) => {

    try {
        const { subject, description, priority } = req.body;

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject is required"
            });
        }

        const fileNumber = "FTS-" + crypto.randomUUID();

        const file = await FileModel.create({
            fileNumber,
            subject,
            description,
            priority,
            createdBy: req.userId,
            currentOwner: req.userId
        });

        return res.status(201).json({
            success: true,
            message: "File created successfully.",
            data: file
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

export const getAllFiles = async (req, res) => {
    try {
        const userId = req.userId;
        const role = req.roles;

        let filter = {};

        if (role === "ADMIN") {
            filter = {}   //admin sab file access kr sakhta hai 
        }
        else if (role === "EXECUTIVE_1" || role === "EXECUTIVE_2") {
            filter = {
                createdBy: userId   // executive_1 and executive_2 sirf apna created hua file access kr sakhta h.
            }
        }
        else {
            filter = {
                currentOwner: userId // jo file unke inbox me hoga wahi sirf access krega..
            }
        }

        const file = await FileModel.find(filter).populate("createdBy", "name role").populate("currentOwner", "name role").sort({ createdAt: -1 });

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found"
            });
        }
        return res.status(200).json({
            success: true,
            count: file.length,
            data: file
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}

export const getFileById = async (req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(403).json({
                success : false,
                message : "Invalid Id."
            })
        }

        const file = await FileModel.findById(id).populate("createdBy", "name email role").populate("currentOwner", "name email role")

        if (!file) {
            return res.status(404).json({
                success: false,
                message: "File not found."
            });
        }

        const role = req.roles;
        const userId = req.userId;

        if (role !== "ADMIN" && file.createdBy._id.toString() !== userId &&
            file.currentOwner._id.toString() !== userId) {
            return res.status(403).json({
                success: true,
                message: "Your not authorized to access this file."
            });
        }
        return res.status(200).json({
            success : true,
            data : file
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const updateFile =  async (req,res)=>{
    try {
        const {id} = req.params;

        const {subject,description,priority} = req.body;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id"
            });
        }

        const file = await FileModel.findById(id);

        if(!file){
            return res.status(404).json({
                success : false,
                message : "File not found"
            });
        }

        if(file.createdBy.toString() !== req.userId){
            return res.status(403).json({
                success : false,
                message : "You are not authorized to edit this file"
            });
        }

        if(file.status !== "DRAFT"){
            return res.status(400).json({
                success : false,
                message : "Only draft file can be edited."
            });
        }

        if(subject) file.subject = subject;
        
        if(description) file.description = description;

        if(priority) file.priority = priority;

        await file.save();

        return res.status(200).json({
            success : true,
            message : "File updated successfully",
            data : file
        })
    } catch (error) {
        
    }
}


export const uploadAttachment = async (req,res)=>{
    try {
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            });
        }

        const file = await FileModel.findById(id);

        if(!file){
            return res.status(404).json({
                success : false,
                message : "File not found"
            });
        }

        if(file.createdBy.toString()!==req.userId){
            return res.status(403).json({
                success : false,
                message : "Access Denial"
            });
        }

        if(file.status !== "DRAFT"){
            return res.status(403).json({
                success : false,
                message : "Attachment cann't be uploaded after submission."
            });
        }

        if(!req.file){
            return res.status(404).json({
                success : false,
                message : "Attachment is missing."
            });
        }

        file.attachment = req.file.originalname;

        await file.save();

        return res.status(200).json({
            success : true,
            message : "Attachment uploaded successfully.",
            data : file
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}

export const submit = async (req,res)=>{
    try {
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success : false,
                message : "Invalid Id."
            });
        }

        const file = await FileModel.findById(id);

        if(!file){
            return res.status(404).json({
                success : false,
                message : "File not found"
            });
        }

        if(file.createdBy.toString()!== req.userId){
            return res.status(403).json({
                success : false,
                message : "You are not authorized to submit this file."
            });
        }

        if(file.status!=="DRAFT"){
            return res.status(400).json({
                success : false,
                message : "File already submitted."
            });
        }

        const currentUser = await User.findById(req.userId);

        if(!currentUser.reportingTo){
            return res.status(400).json({
                success :false,
                message : "Reporting manager not configed"
            });
        }

        file.status = "SUBMITTED";
        file.currentOwner = currentUser.reportingTo;

        await file.save();

        await WorkFlowModel.create({
            fileId : file._id,
            fromUser : currentUser._id,
            toUser : currentUser.reportingTo,
            action : "SUBMITTED",
            remark : "File Submitted" 
        });

        return res.status(200).json({
            success : true,
            message : "File Submitted successfully.",
            data : file
        });
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Internal server error",
            error : error.message
        });
    }
}