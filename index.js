const express = require("express");
const mongoose = require("mongoose"); 
const dotenv = require("dotenv");
const path= require("path");

const psyRoutes = require("./routes/psy");

dotenv.config();
const app = express();


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});


const multer = require('multer');

const fileStorage = multer.diskStorage({
  destination:(req,file,cb)=>{
      cb(null, 'images');
  },
  filename: (req,file,cb)=>{
    cb(null,  file.fieldname + '-' + file.originalname)
  }
})

const fileFilter=(req,file,cb)=>{
  var ext = path.extname(file.originalname);
    if(ext == '.png' || ext == '.jpg' || ext == '.jpeg')
       cb(null,true);
    else {
      cb(null,false);
      console.log("wrong file type")}

}
app.use(multer({storage:fileStorage,fileFilter:fileFilter}).single('image'));
app.use('/psy',psyRoutes);



app.use((error, req, res, next) => {
  // console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});


mongoose
  .connect(
    process.env.CONNECT_TO_DB
  )
  .then(result => {
    app.listen(process.env.PORT);
    console.log("connected");
  })
  .catch(err => console.log("error",err));
  