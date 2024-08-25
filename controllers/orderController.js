import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import itemModel from "../models/itemModel.js";
import Stripe from "stripe";
import { use } from "bcrypt/promises.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);
// placing user order for frontend
const placeOrder = async (req, res) => {
    try{
        const newOrder = new orderModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        });
        await newOrder.save();

        const line_items = req.body.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))
        line_items.push({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: 'Shipping'
                },
                unit_amount: 500
            },
            quantity: 1
        })
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items:line_items,
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${process.env.FRONTEND_URL}verify?success=false&orderId=${newOrder._id}`,
        })

        res.json({success:true,session_url:session.url})
    }catch(error){
        console.log(error);
        res.json({success:false,message:"Order could not be placed"})
    }
}

const verifyOrder = async (req, res) => { 
    const {orderId,success} = req.body;
    try{
        if(success==="true"){
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            for(let item of (await orderModel.findById(orderId)).items){
                await itemModel.findByIdAndUpdate(item._id,{$inc:{quantity:-item.quantity}});
                await itemModel.findByIdAndUpdate(item._id,{$inc:{rank:1*item.quantity}});
            }
            
            res.json({success:true,message:"Paid"})
            
    }
    else{
        await orderModel.findByIdAndDelete(orderId);
        res.json({success:false,message:"Not Paid"})
    }
}catch(error){
    console.log(error);
    res.json({success:false,message:"Order could not be verified"})
}}

//user orders for frontend

const userOrders = async (req, res) => {
    try{
    const orders = await orderModel.find({userId:req.body.userId})
    res.json({success:true,data:orders})
}catch(error){
    res.json({success:false,message:"Orders could not be fetched"})
}
}
//list orders for admin
const getOrders = async (req, res) => {
    try{
        const orders = await orderModel.find({})
        res.json({success:true,data:orders})
    }catch(error){
        res.json({success:false,message:"Orders could not be fetched"})
    }
}
   
//update status

const updateStatus = async (req, res) => {
    try{
        await orderModel.findByIdAndUpdate(req.body.orderId,{status:req.body.status})
        res.json({success:true,message:"Status updated"})
    }
    catch(error){
        res.json({success:false,message:"Status could not be updated"})

    }
    
}




export {placeOrder,verifyOrder,userOrders,getOrders,updateStatus}