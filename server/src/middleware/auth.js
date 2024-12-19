const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const User = require('../models/user');

exports.auth = async (req, res, next) => {
    try {
        const token = req.body.token || req.headers['authorization'].replace('Bearer ', '');
        console.log('Token: ', token);
        if (!token) {
            return res.status(401).json({
                message: 'Access Denied'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.email);
        if (!user) {
            return res.status(401).json({
                message: 'Invalid Token'
            });
        }

        req.user = user;

        next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};