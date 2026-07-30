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
            if(req.originalUrl.startsWith("/api")){
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }
            return res.redirect("/error/404")
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            if(req.originalUrl.startsWith("/api")){
                return res.status(400).json({
                success: false,
                message: "Invalid Credentials"
            });
            }
            return res.redirect("/error/400")
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

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        createAuditLog({
            userId: user.id,
            module: "Auth",
            action: "LOGIN",
            description: `${user.role} logged in.`
        });

        if (req.originalUrl.startsWith("/api")) {
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
        }
        return res.redirect("/dashboard");

    } catch (error) {
        if(req.originalUrl.startsWith("/api")){
            return res.status(500).json({
                success: false,
                message: "Internal Server Error"
            });
        }
        return res.redirect("/error/500");
    }
}

export const logout = async (req, res) => {
    try {
       
        if (req.originalUrl.startsWith("/api")) {
            return res.status(200).json({
                success: true,
                message: "Successfully loged out.."
            });
        }
        res.clearCookie("token");
        res.redirect("/login");

    } catch (error) {
        if(req.originalUrl.startsWith("/api")){
            return res.status(500).json({
                success: false,
                message: "Intenal server error",
                error: error.message
            });
        }
        return res.redirect("/error/500");
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
            userId: user.id,
            module: "Auth",
            action: "PROFILE",
            description: `User ${user.name} profile loaded`
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