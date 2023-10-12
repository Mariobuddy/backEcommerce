const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
  shippingInfo: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    pinCode: { type: Number, required: true },
    phoneNo: { type: Number, required: true },
  },

  orderItems:[
    {
        name:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true
        },
        quantity:{
            type:Number,
            required:true
        },
        product:{
            type:mongoose.Schema.ObjectId,
            ref:"rohitProduct",
            required:true,
        },
        image:{
            type:String,
            required:true
        }
    }
  ],
  user:{
    type:mongoose.Schema.ObjectId,
    ref:"userDetail",
    required:true,
  },
  paymentInfo:{
    id:{
        type:String,
        required:true
    },
    status:{
        type:String,
        required:true
    }
  },
  paidAt:{
    type:Date,
    required:true
  },
  itemPrice:{
    type:Number,
    required:true,
    default:0
  },
  taxPrice:{
    type:Number,
    required:true,
    default:0
  },
  shippingPrice:{
    type:Number,
    required:true,
    default:0
  },
  totalPrice:{
    type:Number,
    required:true,
    default:0
  },
  deliveredAt:Date,
  orderStatus:{
    type:String,
    required:true,
    default:"Processing"
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  }
});

const orderModel=mongoose.model("order",orderSchema);

module.exports=orderModel;