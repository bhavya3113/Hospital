const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const dotenv = require("dotenv");


dotenv.config();

const Patient = require("../models/patient");

var emailregex = /^[-!#$%&'*+\/0-9=?A-Z^_a-z{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/

//signing up a new patient
exports.patientReg = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ Error: "Validation Failed" });
    }

    const { name, address, phoneno, email, password,image } = req.body;

    var validemail = emailregex.test(email);

    if (!validemail) {
      const error = new Error('Please enter a valid email');
      error.statusCode = 422;
      throw error;
    }

    const patient = await Patient.findOne({ email: email });
    if (patient) {
      const error = new Error("patient already registered !!");
      error.statusCode = 400;
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newpatient = new Patient({
     email: email,
     password: hashedPassword,
     name: name,
     address:address,
     phoneno:phoneno
  });
  await newpatient.save();
 
  return res.status(200).json({ message: "successfully registered"});

}
catch (err) {
  if (!err.statusCode) {
    err.statusCode = 500;
  }
  next(err);
}
}
