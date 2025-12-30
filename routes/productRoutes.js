import express from 'express';
import { createProduct, removeProduct, allProducts, newCollection, popularInMen, fetchUser, addToCart, removeFromCart, getCartData } from '../controller/productController.js';


const router = express.Router();



router.post('/', createProduct);
router.delete('/', removeProduct);
router.get('/', allProducts);
router.get('/new-collection', newCollection);
router.get('/popular-in-men', popularInMen);


router.post('/addtocart', fetchUser, addToCart);
router.post('/removefromcart', fetchUser, removeFromCart);
router.post('/getcart', fetchUser, getCartData);






export default router;