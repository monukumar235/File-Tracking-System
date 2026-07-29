import jwt from "jsonwebtoken";


export const authenticate = (req, res, next) => {
    try {
        const token =
            req.cookies?.token ||
            req.headers.authorization?.split(" ")[1];

        

        if (!token) {
            return res.status(404).json({
                succss: false,
                message: "Unauthorized"
            });
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY);
        req.roles = decode.role;
        req.userId = decode.userId
        next();
    } catch (error) {
        return res.status(500).json({
            succss: false,
            message: "Invalid token",
            error: error.message
        })
    }
}