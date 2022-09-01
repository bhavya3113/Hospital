const mongoose = require("mongoose");
const schema = mongoose.Schema;

const psychiatristSchema = new schema({
  name:{
    type: String,
    require: true
  },
  patients:[
    {
      type:schema.Types.ObjectId,
      ref:"patients"
    }
  ]
})

module.exports = mongoose.model("psychiatrists",psychiatristSchema);