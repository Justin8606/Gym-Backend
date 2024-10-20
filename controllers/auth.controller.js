import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

export const register = async (req,res)=>{
    //db operations
    // console.log(req.body)
    const { username,email, password } = req.body;
    //Hash the password

try{

const hashedPassword = await bcrypt.hash(password, 10)
console.log(hashedPassword)

    //create a new user and save to DB
    const newUser = await prisma.user.create({
        data:{
            username,
            email,
            password:hashedPassword,
        },
    });

    console.log(newUser);

    res.status(201).json({ message: "User created successfully"})
}catch(err){
    console.log(err)
    res.status(500).json({message:"Failed to create user!"})
}
}
export const login = async (req,res)=>{
    //db operations
    const { username, password } = req.body;
    try{
    // check if the user exists
        const user = await prisma.user.findUnique({
            where:{username}
        })

        if(!user) return res.status(401).json({message:"Invalid Credintials!"});

    //check if the password is correct

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid) return res.status(401).json({message:"Invalid Credintials!"});

    //generate cookie token and send to the user

    // res.setHeader("Set-Cookie", "test=" + "myValue").json("success")

    const age = 1000 * 60 * 60 * 24 * 7;


        const token = jwt.sign(
        {
            id:user.id,
            isAdmin: false,
        },
         process.env.JWT_SECRET_KEY,
        { expiresIn: age }
    );

        const {password:userPassword, ...userInfo} = user

    res.cookie("token", token, {
        httpOnly:true,
        // secure:true  //in the production mode make sure secure is true(ie . for the https)
        maxAge: age,
    })
    .status(200)
    .json(userInfo)

    }catch(err){
        console.log(err)
        res.status(500).json({message:"Failed to login!"})
    }

}
export const logout = (req,res) => {
    //db operations
    res.clearCookie("token").status(200).json({ message: "Logout Successful" })
}