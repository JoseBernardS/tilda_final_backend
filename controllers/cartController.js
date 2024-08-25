import userModel from "../models/userModel.js";
import itemModel from "../models/itemModel.js";


//add to cart
const addToCart = async (req, res) => {
try{
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;
    if(!cartData[req.body.itemId]){
        cartData[req.body.itemId] = 1;
}
else{
    cartData[req.body.itemId] += 1;
}
await userModel.findByIdAndUpdate(req.body.userId,{cartData})
res.json({success:true,message:"Item added to cart"})
}
catch(error){
    res.json({success:false,message:"Item could not be added to cart"})
}


}

    
const clearCart = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(req.body.userId, {cartData:{}});
        res.json({ success: true, message: "Cart cleared" });
}
catch(error){
    res.json({success:false,message:"Cart could not be cleared"})

}
};
//remove from cart

const removeFromCart = async (req, res) => {

try{
    let userData = await userModel.findById(req.body.userId)
    let cartData = await userData.cartData;
    if(cartData[req.body.itemId]>0){
        cartData[req.body.itemId] -= 1;
    }
    await userModel.findByIdAndUpdate(req.body.userId,{cartData});
    res.json({success:true,message:"Removed from cart"})
}catch(error){
    res.json({success:false,message:"Item could not be removed from cart"})
}

}

//get from cart
const getCart = async (req, res) => {
    try {
        let userData = await userModel.findById(req.body.userId);
        let cartData = userData.cartData;

       
        const existingItems = await itemModel.find({});
        const existingItemIds = new Set(existingItems.map(item => item._id.toString()));
        for (const key of Object.keys(cartData)) {
            if (!existingItemIds.has(key)) {
                delete cartData[key];
            }
        }

        await userModel.findByIdAndUpdate(req.body.userId, { cartData });

        res.json({ success: true, cartData, message: "Cart cleaned up and fetched" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not get cart" });
    }
};


export {addToCart, removeFromCart,getCart,clearCart}