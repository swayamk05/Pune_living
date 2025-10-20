const { default: mongoose } = require("mongoose");
const mogoose=require("mongoose");
const schema=mogoose.Schema;

const reviewsschema=new schema({
  comment:String ,
  rating:{
    type:Number,
    min:1,
    max:5

  },
  createdAt:{
      type:Date,
      default:Date.now()
  },
   author: {
        type: schema.Types.ObjectId,
        ref: "User",
    }
});

const review =mongoose.model("review",reviewsschema);
module.exports=review;