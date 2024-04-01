const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const userController = require('./controller/user');
const userMod = require("./models/user.js")
const app = express();
const booksModel = require("./models/books.js")
const booksDetailModel = require("./models/bookDetails.js");
const qr = require('qr-image');


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



// DB Connect
mongoose.connect('mongodb://localhost:27017/Library_System')
  .then(() => {
    console.log('DB Connected.');
    app.listen(4556, () => {
      console.log(`Backend Running At Port 4556`);
    });
  })
  .catch((err) => {
    console.error('DB Connection Error:', err);
  });


//   send that specific user data when user loged in 
app.get('/userdata/:email' ,async (req,res)=>{
    const email = req.params.email;
    try{
        const myUser = await userMod.findOne({"email":email});
        if(!myUser){
            return res.status(404).json({message:'User Not Found'});

        }
        return  res.status(200).send(myUser);
        
    } catch(e){
        console.log(e);
        return res.status(500).json({message:"Internal Server Error"})
    }
})


// login data
app.post('/send-logindata', async (req, res) => {
  const { email, loginDate, loginTime } = req.body;

  try {
    // Find the user by email
    const user = await userMod.findOne({ email });
     console.log("usrt login",user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's login data
    user.loginDate = loginDate;
    user.loginTime = loginTime;
    await user.save();

    return res.status(200).json({ message: 'login data saved successfully' });
  } catch (error) {
    console.error('Error saving login data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


// logout data
app.post('/send-logoutdata', async (req, res) => {
  const { email, logoutDate, logoutTime } = req.body;

  try {
    // Find the user by email
    const user = await userMod.findOne({ email });
    console.log("bs",user)
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's logout data
    user.logoutDate = logoutDate;
    user.logoutTime = logoutTime;
    await user.save();

    return res.status(200).json({ message: 'Logout data saved successfully' });
  } catch (error) {
    console.error('Error saving logout data:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

app.get('/userdata', async (req, res) => {
  try {
    const users = await userMod.find(); // Assuming User is your Mongoose model
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/admin/books',async (req , res)=>{
  try{
    const books = await booksModel.find();
    res.json(books)
  }
  catch(e){
    console.error(e);
    res.status(500).json({error:"Internal Server Error"});
  }
})

app.post("/admin/addbooks", async (req, res) => {
  try {
    const { title, author, country, language, year } = req.body;
    const newBook = new booksModel({
      title,
      author,
      country,
      language,
      year,
    });
    await newBook.save();
    res.status(200).json({ code: 200, message: "Book added successfully" });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
});

app.post('/signup', userController.signup);
app.post('/signin', userController.signin);
app.post('/logout', userController.logout);
app.post('/submit-otp', userController.submitotp);
app.post('/send-otp', userController.sendotp);
app.post('/signinScanner', userController.signinScanner);


app.post("/bookdetails", async (req, res) => {
  try {
    const {email, title, author, country, language, year ,status , statusDate , statusTime} = req.body;
    const newBook = new booksDetailModel({
      email,
      title,
      author,
      country,
      language,
      year,
      status,
      statusDate,
      statusTime
    });
    await newBook.save();
    res.status(200).json({ code: 200, message: "Book added successfully" });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
});

app.get('/getbookdetails',async (req , res)=>{
  try{
    const booksdetails = await booksModel.find();
    res.json(booksdetails)
  }
  catch(e){
    console.error(e);
    res.status(500).json({error:"Internal Server Error"});
  }
})



app.get('/generateqr', (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const qr_png = qr.image(email, { type: 'png' });
  res.type('png');
  qr_png.pipe(res);
});