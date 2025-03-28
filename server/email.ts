import nodemailer from 'nodemailer';
import { log } from './vite';

// Setup email transporter
export const createTransporter = () => {
  // In development, we'll use a test account
  if (process.env.NODE_ENV !== 'production') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || '',
      },
    });
  }
  
  // In production, use real credentials
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Generate a random verification code
export const generateVerificationCode = (length = 6): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  code: string
): Promise<boolean> => {
  try {
    // For development: log the verification code to the console
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log(`📧 DEVELOPMENT MODE: EMAIL NOT ACTUALLY SENT`);
      console.log(`📧 To: ${email}`);
      console.log(`📧 Verification Code: ${code}`);
      console.log('==================================================\n');
      
      // Return success for development environment
      return true;
    }
    
    // For production: actually send the email
    const transporter = createTransporter();
    
    const info = await transporter.sendMail({
      from: `"Cocktail App" <${process.env.EMAIL_USER || 'noreply@cocktailapp.com'}>`,
      to: email,
      subject: 'Verify Your Email',
      text: `Your verification code is: ${code}. It will expire in 15 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Welcome to Cocktail App!</h2>
          <p>Thank you for signing up. Please use the following code to verify your email address:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <h1 style="font-size: 24px; letter-spacing: 5px; color: #111827;">${code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, you can safely ignore this email.</p>
        </div>
      `,
    });
    
    log(`Verification email sent to ${email}: ${info.messageId}`, 'email');
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    // For development: even if the email sending fails, print the code and return success
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n==================================================');
      console.log(`📧 DEVELOPMENT MODE: EMAIL SEND FAILED, BUT CODE PROVIDED`);
      console.log(`📧 To: ${email}`);
      console.log(`📧 Verification Code: ${code}`);
      console.log('==================================================\n');
      return true;
    }
    return false;
  }
};