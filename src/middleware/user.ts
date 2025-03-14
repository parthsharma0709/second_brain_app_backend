
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = "userparthsharma";

export const userMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const token = req.headers["authorization"]; 


        const decoded = jwt.verify(token as string, JWT_SECRET) as JwtPayload; 
        req.userId = decoded.userId;
        next(); 
    } catch (e) {
        res.status(403).json({ message: "Invalid or expired token" });
    }
};



