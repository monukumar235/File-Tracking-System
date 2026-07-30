

export const RoleBasedAuthorization = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.roles)){
            if(req.originalUrl.startsWith("/api")){
                return res.status(403).json({
                    message : "Access Denial"
                });
            }
            return res.redirect("/error/403")
        }
        next();
    }
}