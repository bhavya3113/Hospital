const mongoose = require("mongoose");
const schema = mongoose.Schema;

const hospitalSchema = new schema({
  name:{
    type: String,
    require: true
  },
  psychiatrist:[{
    type:schema.Types.ObjectId,
    ref:"psychiatrists"
  }]
})

module.exports = mongoose.model("hospitals",hospitalSchema);