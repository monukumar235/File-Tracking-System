import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import createAuditLog from "../utils/Audit.js";
import { getAllUsersData } from "../services/userService.js";



export const createUsers = async (req, res) => {
    try {
        const { name, email, password, role, reportingTo } = req.body;


        if (!name || !email || !password || !role) {
            return res.status(400).json({
                succes: false,
                message: "All fields are required"
            });
        }

        const existingUser = await UserModel.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                succes: false,
                message: "User with this email already exists."
            });
        }
        const hashed = await bcrypt.hash(password, 10);

        const user = await UserModel.create({ name, email, password: hashed, role, reportingTo: reportingTo || null });

        const userResponse = user.toObject();
        delete userResponse.password;

        createAuditLog({
            userId: req.userId,
            module: "USER",
            action: "CREATE",
            description: `Created user ${user.name}`
        });

        if (req.originalUrl.startsWith("/api")) {
            return res.status(201).json({
                succes: true,
                message: "User created successfully",
                data: userResponse
            });
        }
        res.redirect("/users")

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const getAllUsers = async (req, res) => {
    try {

        const users = await getAllUsersData();

        if (!users) {
            return res.status(404).json({
                succes: false,
                message: "No Active user found."
            });
        }

        return res.status(200).json({
            succes: true,
            message: "User found successfully",
            count: users.length,
            data: users
        });
    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                succes: false,
                message: "Invalid Id."
            });
        }

        const user = await UserModel.findById(id).select("-password").populate("reportingTo", "name role email");

        if (!user) {
            return res.status(404).json({
                succes: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            succes: true,
            message: "User successfully fatched.",
            data: user
        });

    } catch (error) {
        return res.status(500).json({
            succes: false,
            message: "Internal server error",
            error: error.message
        });
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;

        const { name, email, role, reportingTo, isActive } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({
                success: false,
                message: "Invalid Id."
            })
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return res.status(404).json({
                succes: false,
                message: "User not found"
            });
        }

        if (email) {

            user.email = email;
        }

        if (name) user.name = name;

        if (role) user.role = role;

        if (reportingTo != undefined) {
            user.reportingTo = reportingTo;
        }

        if (isActive != undefined) {
            user.isActive = isActive;
        }

        await user.save();

        const updateUser = await UserModel.findById(id).select("-password").populate("reportingTo", "name role");

        createAuditLog({
            userId: req.userId,
            module: "USER",
            action: "UPDATE USER",
            description: `Update user ${user.name}`
        });

        if (req.originalUrl.startsWith("/api")) {
            return res.status(200).json({
                succes: true,
                message: "Updated Successfully.",
                data: updateUser
            });
        }
        res.redirect("/users")
    } catch (error) {
        return res.status(500).json({
            succes: true,
            message: "Internal server error.",
            error: error.message
        });
    }
}

export const deteleUser = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Id."
            });
        }

        const user = await UserModel.findById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        user.isActive = false;

        await user.save();

        createAuditLog({
            userId: req.userId,
            module: "USER",
            action: "DELETE USER",
            description: `Delete/Deactivate user ${user.name}`
        });

        if (req.originalUrl.startsWith("/api")) {
            return res.status(200).json({
                message: "User deactivated successfully.",
                sucess: true
            });
        }
        res.redirect("/users")
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
}