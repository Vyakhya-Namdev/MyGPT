import jwt from "jsonwebtoken";

export default function auth(req, res, next){
    const token = req.cookies?.token;
    if(!token) return res.status(401).json({ message: "Not authenticated" });

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        next();
    }catch(err){
        console.log(err);
        return res.status(401).json({ message: "Not authenticated" });
    }
}