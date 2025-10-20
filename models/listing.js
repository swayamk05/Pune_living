const { default: mongoose } = require("mongoose");
const mogoose=require("mongoose");
const schema=mogoose.Schema;
const Review=require("./reviews.js");

const listingschema =new schema({
  title:String,
  description:String,
  images: [
        {
            url: String,
            filename: String,
        }
    ],
  price: Number,
  location:String,
  country:String,

  reviews :[
    {
      type:schema.Types.ObjectId,
      ref:"review",

    },
  ],
  owner: {
        type: schema.Types.ObjectId,
        ref: 'User'
    }
});

listingschema.post("findByIdAndDelete",async(listing)=>{
  if(listing){
    await Review.deleteMany({_id:{$in :listing.reviews}})
  }
});

const listing =mongoose.model("listing",listingschema);
module.exports=listing;