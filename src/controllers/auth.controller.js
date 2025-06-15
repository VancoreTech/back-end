import jwt from "jsonwebtoken";
import prisma from "../prismaClient.js";
import bycrypt from "bcryptjs";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

const JWT_SECREET = process.env.JWT_SECRET;

function generateToken(res, user) {
    const token = jwt.sign({id: user.id}, JWT_SECREET, {expiresIn: "7d"})

    return token
}


export async function checkEmail (req, res) {
    const {email} = req.body;
    
   if (!email) {
    return res.status(400).json({message: "Email is required"})
   } 

   const emailExists = await prisma.user.findUnique({where: {email}})
   if (emailExists) {
    return res.status(400).json({message: "User with this email already exists"})
   }

    const verificationToken = Math.floor(100000 + Math.random() * 900000)
    const verificationExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

   await sendVerificationEmail(email, verificationToken, verificationExpiresAt);

   const user = await prisma.user.create({
    data: {
        email,
        verificationToken,
        verificationExpiresAt,
        verified: false
    }
   })

   return res.status(200).json({message: "Verification email sent successfully", userId: user.id})
}

export async function verifyEmail (req, res) {
    const {userId, verificationCode} = req.body;

    try {
        const user = await prisma.user.findFirst(
            {where: 
                {
                    id: userId, 
                    verificationToken: verificationCode,
                    verificationExpiresAt: {gt: new Date()}
                }
            }
        )
        if (!user) {
            return res.status(400).json({message: "Invalid verification code"})
        }

        const updatedUser = await prisma.user.update({
            where: {id: user.id},
            data: {
                verified: true,
                verificationToken: null,
                verificationExpiresAt: null
            }
        })

        return res.status(200).json({message: "Email verified successfully", user: updatedUser})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

export async function createUser (req, res) {
    const {userId, userName, firstName, lastName} = req.body;

    if (!userName) {
        return res.status(400).json({message: "Username is required"})
    }

    const usernameExists = await prisma.user.findUnique({where: {userName}})
    if (usernameExists) {
        return res.status(400).json({message: "A User with this Username Exists"})
    }

    if (!firstName) {
        return res.status(400).json({message: "Firstname is required"})
    }

    if (!lastName) {
        return res.status(400).json({messge: "Lastname is required"})
    }

    try {
        const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                userName,
                firstName,
                lastName
            }
        })

        return res.status(200).json({message: "User Created successfully", user: updatedUser})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}


export async function addBusinessInfo (req, res) {
    const {userId, businessName, storeUrl, physicalStore, businessCategory} = req.body;

    if (!businessName) {
        return res.status(400).json({message: "Business name is required"})
    }

    const businessNameExists = await prisma.user.findUnique({where: {businessName}})
    if (businessNameExists) {
        return res.status(400).json({message: "Business name already exists"})
    }

    if (!storeUrl) {
        return res.status(400).json({message: "Store URL is required"})
    }

    const storeUrlExists = await prisma.user.findUnique({where: {storeUrl}})
    if (storeUrlExists) {
        return res.status(400).json({message: "Store URL already exists"})
    }

    try {
       const updatedUser = await prisma.user.update({
            where: {id: userId},
            data: {
                businessName,
                storeUrl,
                physicalStore,
                businessCategory
            }
        })
    
        return res.status(200).json({message: "Business info added successfully", user: updatedUser})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}

    
export async function register (req, res) {
    const {userId, password, confirmPassword} = req.body;

    if (!password) {
        return res.status(400).json({message: "Password is required"})
    }

    if (!confirmPassword) {
        return res.status(400).json({message: "Confirm Password is required"})
    }

    if (password !== confirmPassword) {
        return res.status(400).json({message: "Passwords do not match"})
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"})
    }

   
    
    const user = await prisma.user.findUnique({where: {id: userId}})
    if (!user) return res.status(400).json({message: "User does not exist"})
    if (!user.email || !user.userName || !user.businessName || !user.storeUrl || !user.verified) {
        res.status(400).json({message: "Incomplete profile"})
    }

    const hashedPassword = await bycrypt.hash(password, 10);

    try {
       const updatedUser = await prisma.user.update({
        where: {id: userId},
        data: {
            password: hashedPassword
        }
       })

        const token = generateToken(user);
        await sendWelcomeEmail(user.email, user.firstName);
       
        return res.status(201).json({ message: "Account Registered Sucessfully", user: updatedUser, token: token})    
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

export async function getUser (req, res) {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({message: "User ID is required"})
    }

    try {
        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {
                id: true,
                userName: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNo: true,
                businessName: true,
                storeUrl: true,
                physicalStore: true,
                businessCategory: true,
                verified: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        })

        if (!user) {
            return res.status(400).json({message: "User not found"})
        }

        return res.status(200).json({user})
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
}
    