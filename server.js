const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const multer = require('multer');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Raman@20',
    database: 'locatex'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to database');
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ris213961@gmail.com',
        pass: 'Ris@123456' // Use your Gmail password or App Password here
    }
});

app.post('/report', upload.single('itemImage'), (req, res) => {
    const { itemType, itemName, itemDescription, itemLocation, userEmail } = req.body;
    const itemImage = req.file.buffer;

    const sql = 'INSERT INTO reports (itemType, itemName, itemDescription, itemLocation, userEmail, itemImage) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(sql, [itemType, itemName, itemDescription, itemLocation, userEmail, itemImage], (err, result) => {
        if (err) throw err;
        res.send('Report submitted successfully');
    });
});

app.post('/send-verification', (req, res) => {
    const { userEmail } = req.body;
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit code

    const mailOptions = {
        from: 'ris213961@gmail.com',
        to: userEmail,
        subject: 'Your Verification Code',
        text: `Your verification code is ${verificationCode}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send('Error sending email');
        }
        console.log('Email sent:', info.response);
        res.send('Verification code sent');
    });
});

// Test endpoint to verify email sending
app.get('/test-email', (req, res) => {
    const mailOptions = {
        from: 'ris213961@gmail.com',
        to: 'your-email@example.com', // Replace with your email to test
        subject: 'Test Email',
        text: 'This is a test email'
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending test email:', error);
            return res.status(500).send(`Error sending test email: ${error.message}`);
        }
        console.log('Test email sent:', info.response);
        res.send('Test email sent');
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});