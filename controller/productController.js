import Product from '../models/products.js';
import Users from '../models/user.js';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from './userController.js';
import mongoose from 'mongoose';

// create product.................................................
export const createProduct = async (req, res) => {
    let products = await Product.find({});
    let id;
    if (products.length > 0) {
        id = products[products.length - 1].id + 1;
    } else {
        id = 1;
    }
    try {
        const newProduct = new Product({
            id: id,
            name: req.body.name,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
            category: req.body.category,
            imageUrl: req.body.imageUrl
            
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

};
// delete product.................................................


export const removeProduct = async (req, res) => {
   
        console.log('Received ID:', req.body.id);
        
        // Find by custom 'id' field, not '_id'
        const product = await Product.findOneAndDelete({ id: req.body.id });
        res.json({ 
            success: true,
            message: "Product deleted successfully",
            name: product.name  
        });
        
};

// getting all product.............................................
export const allProducts = async (req, res) => {
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
};


// new collection .................................
 
export const newCollection = async (req, res) => {

        let products = await Product.find({});
        let new_collection = products.slice(1).slice(-8);
        console.log("New Collections Fetched");
        res.send(new_collection);
};   



// popular products ...............................
export const popularInMen = async (req, res) => {
    let products = await Product.find({category: "men"});
    let popular_in_men = products.slice(0,4);
    console.log("Popular in Men Fetched");
    res.send(popular_in_men);
};

// fetch user............................................
export const fetchUser = (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).send({ error: "Please authenticate using a valid token" });
    }
};

// Add to cart............................................
export const addToCart = async (req, res) => {
   let userData = await Users.findOne({_id:req.user.id});
   userData.cartData[req.body.itemId] += 1;
   await Users.findOneAndUpdate({_id:req.user.id}, {cartData: userData.cartData});
   res.send("Added");
};



// Remove from cart............................................
export const removeFromCart = async (req, res) => {
    let userData = await Users.findOne({_id:req.user.id});
    if(userData.cartData[req.body.itemId] > 0)
   userData.cartData[req.body.itemId] -= 1;
   await Users.findOneAndUpdate({_id:req.user.id}, {cartData: userData.cartData});
   res.send("Removed");
};

// get cart data............................................
export const getCartData = async (req, res) => {
    let userData = await Users.findOne({_id:req.user.id});
    res.json(userData.cartData);
};