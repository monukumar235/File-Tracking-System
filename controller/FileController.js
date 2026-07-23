import FileModel from "../models/File.js";
import crypto from 'node:crypto';
import mongoose from "mongoose";


export const createFile = async (req, res) => {

    try {
        const { subject, description, priority } = req.body;

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: "Subject is required"
            });
        }

        const fileNumber = "FTS-" + Date.now() + "-" + crypto.randomUUID();

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

        const file = await FileModel.findById(id).populate("createdBy", "name email role").populate("currentOwner", "name email,role")

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