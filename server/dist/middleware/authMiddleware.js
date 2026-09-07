"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.optionalAuthenticateUser = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge_secret_fallback_key';
const authenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Authentication required. No token provided.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await db_1.default.user.findUnique({
            where: { id: decoded.id },
            include: {
                studentProfile: { select: { id: true } },
                academicianProfile: { select: { id: true } },
                industryProfile: { select: { id: true } },
                institutionProfile: { select: { id: true } },
            },
        });
        if (!user) {
            res.status(401).json({ message: 'User account no longer exists.' });
            return;
        }
        let profileId;
        if (user.role === 'STUDENT')
            profileId = user.studentProfile?.id;
        else if (user.role === 'ACADEMICIAN')
            profileId = user.academicianProfile?.id;
        else if (user.role === 'INDUSTRY')
            profileId = user.industryProfile?.id;
        else if (user.role === 'INSTITUTION')
            profileId = user.institutionProfile?.id;
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            profileId,
        };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
exports.authenticateUser = authenticateUser;
const optionalAuthenticateUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const user = await db_1.default.user.findUnique({
            where: { id: decoded.id },
            include: {
                studentProfile: { select: { id: true } },
                academicianProfile: { select: { id: true } },
                industryProfile: { select: { id: true } },
                institutionProfile: { select: { id: true } },
            },
        });
        if (user) {
            let profileId;
            if (user.role === 'STUDENT')
                profileId = user.studentProfile?.id;
            else if (user.role === 'ACADEMICIAN')
                profileId = user.academicianProfile?.id;
            else if (user.role === 'INDUSTRY')
                profileId = user.industryProfile?.id;
            else if (user.role === 'INSTITUTION')
                profileId = user.institutionProfile?.id;
            req.user = {
                id: user.id,
                email: user.email,
                role: user.role,
                profileId,
            };
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuthenticateUser = optionalAuthenticateUser;
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ message: 'Authentication required.' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                message: `Access denied. Role '${req.user.role}' is not authorized to access this resource.`,
            });
            return;
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
