import jwt from "jsonwebtoken";
import { destructureRequest } from "../utils/apiHelpers.js";

export function authenticateUser(req, res, next) {
    const { token } = destructureRequest(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.userID = decoded.id;
        req.type = decoded.type;
        next();
    });
}
