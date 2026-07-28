const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            // Decode token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_minicrm_jwt');

            // Allow mock token or pass userId
            req.user = decoded;
            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Master Admin')) {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

const restrictToSelfOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'Master Admin' || req.user.id === req.params.id)) {
        next();
    } else {
        return res.status(403).json({ message: 'Not authorized to access this resource' });
    }
};

module.exports = { protect, admin, restrictToSelfOrAdmin };
