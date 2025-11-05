import jwt from "jsonwebtoken";
import { destructureRequest } from "../utils/apiHelpers.js";
import { userTypeConstants } from "../utils/constants.js";

export function authenticateUser(req, res, next) {
    const { token } = destructureRequest(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        if (decoded.type !== userTypeConstants.USER) return res.status(403).json({ message: "Access Denied You are not a user" });
        req.userID = decoded.id;
        req.type = decoded.type;
        next();
    });
}

export function authenticateCandidate(req, res, next) {
    const { token } = destructureRequest(req);
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        if (decoded.type !== userTypeConstants.CANDIDATE) return res.status(403).json({ message: "Access Denied You are not a candidate" });
        req.userID = decoded.id;
        req.type = decoded.type;
        next();
    });
}
