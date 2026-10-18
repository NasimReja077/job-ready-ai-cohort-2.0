import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    }
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});


export const sendEmail = async (to, subject, text, html) => {
    const info = await transporter.sendMail({
        from: `"FrontendForge" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html,
    });

    console.log('Message sent: %s', info.messageId);
};