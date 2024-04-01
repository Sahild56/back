const mongoose = require("mongoose");

module.exports = mongoose.model("User", {
  name: String,
  universityNo: String,
  department: String,
  contact: String,
  role: String,
  picture: String,
  email: String,
  password: String,
  otp: Number,
  // New fields for login and logout timestamps
  loginDate: Date,
  loginTime: String,
  logoutDate: Date,
  logoutTime: String,
  // book details
  title:String,
  author:String,
  country:String,
  language:String,
  year:String,
  status:String,
  statusDate:Date,
  statusTime:String
});
