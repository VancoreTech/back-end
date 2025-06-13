import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import bycrypt from "bcryptjs";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

const JWT_SECREET = process.env.JWT_SECRET;

function generateToken(res, user) {
    const token = jwt.sign({id: user.id}, JWT_SECREET, {expiresIn: "7d"})

    return token
}


export async function register (req, res) {
    const {userName, firstName, lastName, email, phoneNo, businessName, storeUrl, physicalStore, businessCategory, password, confirmPassword} = req.body;

    const userNameExists = await prisma.user.findUnique({where: {userName}})
    if (userNameExists) {
        return res.status(400).json({message: "User with this username already exists"})
    }
    
    const userExists = await prisma.user.findUnique({where: {email}})
    if(userExists) {
        return res.status(400).json({message: "User with this email already exists"})
    }

    if (password !== confirmPassword) {
        return res.status(400).json({message: "Passwords do not match"})
    }

    const storeUrlExists = await prisma.user.findUnique({where: {storeUrl}})
    if (storeUrlExists) {
        return res.status(400).json({message: "A store with this name already exists"})
    }

    const hashedPassword = await bycrypt.hash(password, 10);
    const verificationToken = Math.floor(100000 + Math.random() * 900000)
    const verificationExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    try {
        const user = await prisma.user.create({
            data: {
                userName,
                firstName,
                lastName,
                email,
                phoneNo,
                businessName,
                storeUrl,
                physicalStore,
                businessCategory,
                password: hashedPassword,
                role: "BUSINESS",
                verificationToken,
                verificationExpiresAt,
                verified: false
            }
        })

        const token = generateToken(user);
        await sendVerificationEmail(user.email, verificationToken);
        return res.status(201).json({ message: "User registered successfully", user, token: token})    
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export async function verifyEmail (req, res) {
    const {verificationCode} = req.body;

    try {
        const user = await prisma.user.findUnique({where: {verificationToken: verificationCode, verificationExpiresAt: {gt: new Date()}}})
        if (!user) {
            return res.status(400).json({message: "Invalid verification code"})
        }
        user.verified = true;
        user.verificationToken = null;
        user.verificationExpiresAt = null;
        await user.save();

        await sendWelcomeEmail(user.email, user.firstName);
        return res.status(200).json({message: "Email verified successfully"})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}
    


export async function login (req, res) {
    const {userName, password} = req.body

    const user = await prisma.user.findUnique({where: {userName: userName}})
    if (!user) {
        return res.status(400).json({message: "User not found"})
    }

    const isPasswordValid = await bycrypt.compare(password, user.password)
    if (!isPasswordValid) {
        return res.status(400).json({message: "Invalid password"})
    }

    const token = generateToken(user)
    return res.status(200).json({user, token})
}