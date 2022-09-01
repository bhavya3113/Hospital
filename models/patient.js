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
    default:  path.join('images','image-noprofile.png')
  }
})

module.exports = mongoose.model("patients",pateintSchema);