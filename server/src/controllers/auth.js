const jwt = require('jsonwebtoken');
const User = require('../models/user');
const bcrypt = require('bcrypt');

exports.signup = async (req, res) => {
    try {

        const {
            name,
            email,
            password,
        } = req.body;

        const user = await User.create({
            name,
            email,
            password
        });

        const token = jwt.sign({
            email: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};

exports.signin = async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        const user = await User.findOne({
            email
        });

        if (!user) {
            return res.status(400).json({
                message: 'User not found'
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);


        if (!isPasswordMatch) {
            return res.status(400).json({
                message: 'Invalid credentials'
            });
        }

        const token = jwt.sign({
            email: user._id
        }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(200).json({
            message: 'User signed in successfully',
            user,
            token
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
};