import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import validator from "validator";
import nodemailer from "nodemailer";

//login user
const loginUser = async (req, res) => {
  const {email,password} = req.body;
  try{
    const user = await userModel.findOne({email:email});
    if(!user){
        return res.json({success:false,message:"User not found"})
    }
    const validPassword = await bcrypt.compare(password,user.password);
    if(!validPassword){
        return res.json({success:false,message:"Invalid password"})
    }
    const token = createToken(user._id);
    res.json({success:true,token})

  }catch(error){
      res.json({success:false,message:"User could not be logged in"})

};}

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

//register user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
   try{
        //check if user exists
        const exists = await userModel.findOne({email:email});
        if(exists){
            return res.json({success:false,message:"User already exists"})
        }
 
    //validate email and password strength
    if(!validator.isEmail(email)){
        return res.json({success:false,message:"Invalid email"})
    }
    if(password.length<8){
        return res.json({success:false,message:"Password too short"})
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password,salt);

    const newUser = new userModel({
        name:name,
        email:email,
        password:hashedPassword
    });

  
        const user = await newUser.save();
        const token = createToken(user._id);
        res.json({success:true,token})}
    catch(error){
        res.json({success:false,message:"User could not be registered"})
    }
};

const forgotPassword = async (req, res) => {
    const {email} = req.body;
    try{
        const user = await userModel.findOne({email:email});
        if(!user){
            return res.json({success:false,message:"User not found"})
        }

        const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'1h'});
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.EMAIL,
              pass: process.env.PASSWORD
            }
          });
          
          var mailOptions = {
            from: process.env.EMAIL,
            to:  email,
            subject: 'Reset Password Link',
            text: `${process.env.FRONTEND_URL}reset_password/${user._id}/${token}` 
          };
          
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              return res.json({success:true,message:"Email sent"})
            }
          });

        //send email to user with password reset link
    }catch(error){
        res.json({success:false,message:"Email could not be sent"})
    }
}

const resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err) {
            return res.json({ success: false, message: "Token expired" });
        }

        try {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);

        
            await userModel.findByIdAndUpdate(id, { password: hash });

            return res.json({ success: true, message: "Password updated successfully" });
        } catch (error) {
            console.error(error);
            return res.json({ success: false, message: "Error updating password" });
        }
    });
};


export { loginUser, registerUser,forgotPassword,resetPassword };