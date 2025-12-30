import User from "../models/user.js";
import jwt from "jsonwebtoken";

// JWT Secret Key
export const JWT_SECRET = process.env.JWT_SECRET; 

// Create user (Signup)
export const createUser = async (req, res) => {
    let users = await User.find({});
    let id;
    if (users.length > 0) {
        id = users[users.length - 1].id + 1;
    } else {
        id = 1;
    }
    let cart = {};
    for (let i = 0; i < 300; i++)
        cart[i]=0;
    try {
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            cartData: cart,
        });
        
        await newUser.save();

        // Generate JWT token
        const data = {
            user:{id:newUser.id}
        }
        const token = jwt.sign(
            data,  
            JWT_SECRET,           
            { expiresIn: '1d' }  
        );

        res.status(201).json({
            success: true,
            token: token,
            user: newUser
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        
        if (user.password !== password) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        const data = {
            user: { id: user.id }
        };
        const token = jwt.sign(
            data,
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};



