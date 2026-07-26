import UserModel from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import createAuditLog from "../utils/Audit.js";





export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and Password are required"
            });
        }

        const user = await UserModel.findOne({ email, isActive: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            });
        }
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "1d"
            }
        );

        createAuditLog({
            userId : user.id,
            module : "Auth",
            action : "LOGIN",
            description : "User logged in"
        });

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}

export const logout = async (req, res) => {
    try {
        createAuditLog({
            userId : req.userId,
            module : "Auth",
            action : "LOGOUT",
            description : "User logged out"
        });
        return res.status(200).json({
            success: true,
            message: "Successfully loged out.."
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Intenal server error",
            error: error.message
        });
    }
}

export const profile = async (req, res) => {
    try {

        const userId = req.userId;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid UserId"
            });
        }

        const user = await UserModel.findById(userId).select("-password").populate("reportingTo", "name role");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        createAuditLog({
            userId : user.id,
            module : "Auth",
            action : "PROFILE",
            description : "User profile"
        })

        return res.status(200).json({
            success: true,
            message: "Profile found",
            data: user
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}