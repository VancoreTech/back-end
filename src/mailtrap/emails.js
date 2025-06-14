import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE } from "./emailTemplate.js"
import { mailtrapTransport } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email, verificationCode, verificationExpiresAt) => {
 const recipient = [{email}]  
 
 try {
    const response = await mailtrapTransport.sendMail({
        from: sender, 
        to: recipient,
        subject: "Verify Your Email",
        html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationCode).replace("{verificationExpiresAt}", verificationExpiresAt),
        category: "Email Verification"
    })

    return response
 } catch (error) {
    throw new Error(`Failed to send verification email: ${error.message}`)
 }
}

export const sendWelcomeEmail = async (email, firstName) => {
    const recipient = [{email}]  
    
    try {
        const response = await mailtrapTransport.sendMail({
            from: sender,
            to: recipient,
            subject: "Welcome to Vancore",
            html: WELCOME_EMAIL_TEMPLATE.replace("{name}", firstName).replace("{dashboardLink}", "http://localhost:3000/dashboard"),
            category: "Welcome Email"
        })

        return response
    } catch (error) {
        throw new Error(`Failed to send welcome email: ${error.message}`)
    }
}
    