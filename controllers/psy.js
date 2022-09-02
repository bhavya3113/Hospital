const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");
const validatePhoneNumber = require('validate-phone-number-node-js');
const passwordValidator = require('password-validator');
const jwt = require('jsonwebtoken');

var schema = new passwordValidator();

schema
.is().min(8)                                    
.is().max(15)      
.has().uppercase()
.has().lowercase()                              
.has().digits(1) 

dotenv.config();

const Patient = require("../models/patient");
const Psychiatrist = require("../models/psychiatrist");
const Hospital = require("../models/hospital");
const Token = require("../models/token");

var emailregex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/


//first psychiatrist need to login in his existing account that 
// would have been provided by the hospital he is working in
exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ Error: "Validation Failed" });
    }
    const { email, password} = req.body;
    var validemail = emailregex.test(email);
    if (!validemail) {
      const error = new Error('Please enter a valid email');
      error.statusCode = 422;
      throw error;
    }
    const psychiatrist = await Psychiatrist.findOne({ email: email });

      if (!psychiatrist) {
        const error = new Error("account not found!!");
        error.statusCode = 400;
        throw error;
      }
      const result = await bcrypt.compare(password, psychiatrist.password);
      if (!result) {
        const error = new Error('Incorrect Password');
        error.statusCode = 403;
        throw error;
      }
    const accesstoken = jwt.sign({ email: email, psychiatristId: psychiatrist._id }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1d' });
    const refreshtoken = jwt.sign({ email: email, psychiatristId: psychiatrist._id }, process.env.REFRESH_TOKEN_KEY, { expiresIn: "30d" });
    const token = new Token({
      email: email,
      token: refreshtoken
    })
    await token.save();
    return res.status(200).json({ message: "LoggedIn", email: email, access_token: accesstoken });
    }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}

//signing up a new patient
exports.patientReg = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ Error: "Validation Failed" });
    }
    
    const psyId = req.psyId;
    const { name, address, phoneno, email, password } = req.body;

    const image = req.files.image;
    let imageUrl;
    if(image){
      imageUrl = image[0].path;
      // console.log(imageUrl);
    }
    var validemail = emailregex.test(email);
    var validnumber = validatePhoneNumber.validate(phoneno);
    var validpswd = schema.validate(password);

    if (!validemail) {
      const error = new Error('Please enter a valid email');
      error.statusCode = 422;
      throw error;
    }
     if(!validpswd)
     {
      const error = new Error('Please enter a valid password');
      error.statusCode = 422;
      throw error;
     }

    if(!validnumber)
    {
      const error = new Error('Please enter a valid number');
      error.statusCode = 422;
      throw error;
    }

    const psy = await Psychiatrist.findOne({_id:psyId}).populate('patients');
    
    const pat = psy.patients.findIndex(i =>i.email == email);
    if(pat !== -1)
    {
      const error = new Error("Patient is already registered!!");
      error.statusCode = 400;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newpatient = new Patient({
     email: email,
     password: hashedPassword,
     name: name,
     address:address,
     phoneno:phoneno,
     imageUrl:imageUrl
  });
  await newpatient.save();
  await psy.patients.push(newpatient);
  return res.status(200).json({ message: "successfully registered"});

}
catch (err) {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}
}



//fetch details
exports.fetchdetails = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ Error: "Validation Failed" });
    }
    
    const hosid = req.body.hospitalid;
   
    const hos = await Hospital.findOne({_id:hosid}).populate('psychiatrist',{email:0,password:0});
    if(!hos)
    {
      const error = new Error("account not found!!");
        error.statusCode = 400;
        throw error;
    }
    var psycount = hos.psychiatrist.length; 
    var patcount = 0;
    hos.psychiatrist.forEach(i=>{
      if(i.patients)
      patcount+=i.patients.length;
    })
    var arr=[];
    hos.psychiatrist.forEach(i=>{
      var obj={}
      obj.name=i.name,
      obj.id = i._id,
      obj.patientsCount = i.patients.length
      arr.push(obj);
    }
    )

   
    return res.status(201).json({name:hos.name, totalpsychiatristcount: psycount, totalpatientcount: patcount, psychiatristDetails:arr});

}
catch (err) {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}
}

//to generate access token
exports.generateAccessToken = async (req, res, next) => {
  try {
    const { refreshtoken } = req.body;
    if (!refreshtoken) {
      const err = new Error('token missing');
      err.statusCode = 401;
      throw err;
    }
    const tokenInDb = await Token.findOne({ token: refreshtoken });
    if (!tokenInDb) {
      const error = new Error('login again');
      error.statusCode = 402;
      throw error;
    }
    const payload = jwt.verify(tokenInDb.token, process.env.REFRESH_TOKEN_KEY);
    const accessToken = jwt.sign({ id: payload._id, email: payload.email }, process.env.ACCESS_TOKEN_KEY, { expiresIn: "1h" });
    return res.status(200).json({ access_token: accessToken });
  }
  catch (err) {
    if (!err.statusCode)
      err.statusCode = 500;
    next(err);
  }
};
