import jwt from "jsonwebtoken";
import { destructureRequest } from "../utils/apiHelpers.js";
import { userTypeConstants } from "../utils/constants.js";

/**
 * Debug function to help troubleshoot JWT issues
 */
function debugToken(token) {
    if (!token) return { error: "No token provided" };
    
    try {
        // Decode without verification to see the payload
        const decoded = jwt.decode(token);
        return {
            valid: true,
            payload: decoded,
            header: jwt.decode(token, { complete: true })?.header
        };
    } catch (err) {
        return {
            error: "Token decode failed",
            message: err.message
        };
    }
}

export function authenticateUser(req, res, next) {
    const { token } = destructureRequest(req);
    if (!token) {
        console.log('[AUTH ERROR] No token provided for user authentication');
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY);
        
        if (decoded.type !== userTypeConstants.USER) {
            console.log('[AUTH ERROR] Access denied - not a user, type:', decoded.type);
            return res.status(403).json({ message: "Access Denied: You are not a user" });
        }
        
        console.log('[AUTH SUCCESS] User authenticated:', decoded.id);
        req.userID = decoded.id;
        req.type = decoded.type;
        next();
    } catch (err) {
        console.log('[AUTH ERROR] User token verification failed:', err.message);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired", error: "TOKEN_EXPIRED" });
        }
        return res.status(403).json({ message: "Invalid token", error: "INVALID_TOKEN" });
    }
}

export function authenticateCandidate(req, res, next) {
    const { token } = destructureRequest(req);
    if (!token) {
        console.log('[AUTH ERROR] No token provided for candidate authentication');
        return res.status(401).json({ message: "No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY);
        
        if (decoded.type !== userTypeConstants.CANDIDATE) {
            console.log('[AUTH ERROR] Access denied - not a candidate, type:', decoded.type);
            return res.status(403).json({ message: "Access Denied: You are not a candidate" });
        }
        
        console.log('[AUTH SUCCESS] Candidate authenticated:', decoded.id);
        req.userID = decoded.id;
        req.type = decoded.type;
        next();
    } catch (err) {
        console.log('[AUTH ERROR] Candidate token verification failed:', err.message);
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired", error: "TOKEN_EXPIRED" });
        }
        return res.status(403).json({ message: "Invalid token", error: "INVALID_TOKEN" });
    }
}
export function commonAuthenticate(req, res, next) {
    const { token } = destructureRequest(req);
    
    // Enhanced token validation
    if (!token) {
        console.log('[AUTH ERROR] No token provided in request headers');
        console.log('[AUTH DEBUG] Request headers:', {
            authorization: req.headers.authorization,
            'x-auth-token': req.headers['x-auth-token']
        });
        return res.status(401).json({ message: "No token provided" });
    }

    // Debug token structure
    const debugInfo = debugToken(token);
    console.log('[AUTH DEBUG] Token debug info:', debugInfo);
    
    try {
        // Verify token with better error handling
        const decoded = jwt.verify(token, process.env.JWT_SECRET_ACCESS_KEY);
        
        console.log('[AUTH SUCCESS] Token decoded successfully for user:', decoded.id);
        
        req.userID = decoded.id;
        req.type = decoded.type;
        next();
    } catch (err) {
        console.log('[AUTH ERROR] JWT verification failed:', {
            error: err.name,
            message: err.message,
            tokenStart: token ? token.substring(0, 20) + '...' : 'null',
            secretKeySet: !!process.env.JWT_SECRET_ACCESS_KEY
        });

        // Handle specific JWT errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({ 
                message: "Invalid token format",
                error: "INVALID_TOKEN"
            });
        } else if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Token has expired",
                error: "TOKEN_EXPIRED"
            });
        } else if (err.name === 'NotBeforeError') {
            return res.status(401).json({ 
                message: "Token not active yet",
                error: "TOKEN_NOT_ACTIVE"
            });
        } else {
            return res.status(403).json({ 
                message: "Token verification failed",
                error: "TOKEN_ERROR"
            });
        }
    }
}