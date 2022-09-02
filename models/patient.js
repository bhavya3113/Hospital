const mongoose = require("mongoose");
const schema = mongoose.Schema;

const pateintSchema = new schema({
  name:{
    type: String,
    require: true
  },
  email:{
    type: String,
    require: true
  },
  address:{
    type: String,
    minlength:10,
    require:true
  },
  mobileno:{
    type: Number,
    require: true
  },
  password:{
    type: String,
    require:true
  },
  imageUrl:{
    type: String,
    require:true
  }
})

module.exports = mongoose.model("patients",pateintSchema);