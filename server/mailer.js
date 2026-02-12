
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Lazy create transport to allow env vars to load
let transporter;

const getTransporter = () => {
    if (!transporter) {
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
            console.error("GMAIL_USER or GMAIL_APP_PASSWORD missing");
        }
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, ''),
            },
        });
    }
    return transporter;
}

export const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: `"AI Attendance" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is: ${otp}`,
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Verify your email</h2>
        <p>Please use the following One-Time Password (OTP) to complete your registration:</p>
        <h1 style="color: #4F46E5; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
      </div>
    `,
    };

    try {
        const info = await getTransporter().sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};
