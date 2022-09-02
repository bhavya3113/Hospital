const express = require("express");
const router = express.Router();
const {body} = require("express-validator");

const psyController = require("../controllers/psy");
const isAuth = require("../middleware/isAuth");

//to login
router.post("/login",[body("email").normalizeEmail().isEmail().withMessage('please enter a valid email')], psyController.login);

//to register a new patient
router.post("/patientRegistration",isAuth,psyController.patientReg);

//to get hospital details
router.get("/fetchdetails",psyController.fetchdetails);
//
router.post("/generateaccesstoken",psyController.generateAccessToken);

module.exports=router; 