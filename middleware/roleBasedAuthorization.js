

export const RoleBasedAuthorization = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.roles)){
            return res.status(403).json({
                message : "Access Denial"
            });
        }
        next();
    }
}