const UserModel = require('../models/user')
const nodemailer = require('nodemailer')
const QRCode = require('qrcode');

module.exports.signup = async (req, res) => {
    try {
        // Check if the email already exists
        const checkUser = await UserModel.findOne({ email: req.body.email });
        if (checkUser) return res.status(401).send({ message: "Email already exists" });

        // Generate QR code for email
        const qrCodeData = `mailto:${req.body.email}`;
        const qrCodeOptions = { type: 'png', width: 250, errorCorrectionLevel: 'H' };
        const qrCodeBuffer = await QRCode.toBuffer(qrCodeData, qrCodeOptions);
        const qrCodeBase64 = qrCodeBuffer.toString('base64');

        // Save user data including QR code
        const newUser = new UserModel({
            name: req.body.name,
            email: req.body.email,
            universityNo: req.body.universityNo,
            department: req.body.department,
            contact: req.body.contact,
            password: req.body.password,
            role: req.body.role,
            picture: req.body.picture,
            qrCode: qrCodeBase64 // Save QR code in the database
        });

        await newUser.save();

        res.status(200).json({ code: 200, message: 'Signup success', qrCode: qrCodeBase64 });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ code: 500, message: 'Signup error' });
    }
};


module.exports.signin = async (req, res) => {
    console.log(req.body.role);
    const { loginDate, loginTime } = req.body;

    try {
        // Find the user by email and role
        const user = await UserModel.findOne({ email: req.body.email, role: req.body.role });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        // Check if the password matches
        if (user.password !== req.body.password) {
            return res.status(401).json({ code: 401, message: 'Incorrect password' });
        }

        // Update the user's login date and time
        await UserModel.updateOne({ email: req.body.email }, { $set: { loginDate, loginTime } });

        // Respond with success message, user details, and token
        res.status(200).json({
            code: 200,
            message: 'Login successful',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                password:user.password
                // Include other user details as needed
            },
            token: 'hfgdhg' // This should ideally be a JWT token based on your authentication setup
        });
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).json({ code: 500, message: 'Internal server error' });
    }
};


// login using scanner
module.exports.signinScanner = async (req, res) => {
    console.log("scanneremail",req.body.email);

    try {
        // Find the user by email and role
        const user = await UserModel.findOne({ email: req.body.email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        // Check if the password matches
        
        // Update the user's login date and time
        

        // Respond with success message, user details, and token
        res.status(200).json({
            code: 200,
            message: 'Login successful',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                password:user.password
                // Include other user details as needed
            },
            token: 'hfgdhg' // This should ideally be a JWT token based on your authentication setup
        });
    } catch (error) {
        console.error('Error signing in:', error);
        res.status(500).json({ code: 500, message: 'Internal server error' });
    }
};



module.exports.logout = async (req, res) => {
    console.log("logout",req.body.email);
    const { logoutDate, logoutTime } = req.body;

    try {
        // Find the user by email
        const user = await UserModel.findOne({ email: req.body.email });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        // Update the user's logout date and time
        await UserModel.updateOne({ email: req.body.email }, { $set: { logoutDate, logoutTime } });

        // Respond with success message
        res.status(200).json({
            code: 200,
            message: 'Logout successful',
            user: {
                name: user.name,
                email: user.email,
                role: user.role,
                // Include other user details as needed
            },
            token: 'hfgdhg' 
        });
    } catch (error) {
        console.error('Error logging out:', error);
        res.status(500).json({ code: 500, message: 'Internal server error' });
    }
};


module.exports.sendotp = async (req, res) => {
    console.log(req.body);
    const _otp = Math.floor(100000 + Math.random() * 900000);
    console.log(_otp);

    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: 'matteo.casper54@ethereal.email',
        pass: '2VXzRk9USbX5jNPc2S'
        },
        debug: true, // Enable debugging to get detailed logs
    });

    try {
        const info = await transporter.sendMail({
            from: 'yash4545tarate@gmail.com',
            to: req.body.email,
            subject: "OTP",
            text: `Your OTP: ${_otp}`, // Include OTP in the email content
            html: `<html><body><p>Your OTP: ${_otp}</p></body></html>`,
        });

        console.log("Email sent:", info);
        res.send({ code: 200, message: 'OTP sent successfully' });
    } catch (err) {
        console.error("Error sending email:", err);
        return res.status(500).send({ code: 500, message: 'Server error while sending email' });
    }
};

module.exports.submitotp = (req, res) => {
    console.log(req.body)


    UserModel.findOne({ otp: req.body.otp }).then(result => {

        //  update the password 

        UserModel.updateOne({ email: result.email }, { password: req.body.password })
            .then(result => {
                res.send({ code: 200, message: 'Password updated' })
            })
            .catch(err => {
                res.send({ code: 500, message: 'Server err' })

            })


    }).catch(err => {
        res.send({ code: 500, message: 'otp is wrong' })

    })


}

module.exports.bookdetails = async (req, res) => {
    console.log("back bookdetails", req.body);

    try {
        const { email, title, author, country, language, year, status, statusDate, statusTime } = req.body;

        // Check if the user exists
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(404).json({ code: 404, message: 'User not found' });
        }

        // Add the book to the user's books array
        user.UserModel.push({
            title,
            author,
            country,
            language,
            year,
            status,
            statusDate,
            statusTime
        });

        // Save the updated user object
        await user.save();

        res.status(200).json({ code: 200, message: 'Book added successfully' });
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
    }
};