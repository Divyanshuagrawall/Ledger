const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

async function Register(req, res){
    const {email, password, name} = req.body;
    const isExists = await userModel.findOne({email});
    if(isExists){
        return res.status(422).json({
            message:"user already exists"
        })
    }
    const user = await userModel.create({
        email, password, name
    })
    const token = jwt.sign({user:user._id}, process.env.JWT_SECRET, {expiresIn:"3d"})
    res.cookie("token", token);
    res.status(201).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        }, 
        token
    })
} 

async function Login(req, res){
    const {email, password} = req.body;
    const user = await userModel.findOne({email}).select("+password");
    if(!user){
        return res.status(401).json({
            message:"email or password is invalid"
        })
    }
    const isValidPassword = await user.comparePassword(password);
    if(!isValidPassword){
        return res.status(401).json({
            message:"email or password is invalid"
        })
    }
    const token = jwt.sign({userId:user._id}, process.env.JWT_SECRET, {expiresIn:"3d"})
    res.cookie("token", token);
    res.status(200).json({
        user:{
            _id:user._id,
            email:user.email,
            name:user.name
        }, 
        token
    }) 
}

module.exports = {Register, Login};