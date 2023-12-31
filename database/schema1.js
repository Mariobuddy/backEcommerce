const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter product name"],
    trim: true,
  },
  brand: {
    type: String,
    required: [true, "Please enter brand name"],
    trim: true,
  },

  price: {
    type: Number,
    required: [true, "Please enter product price"],
    maxLength: [8, "Price cannot exceed 8 characters"],
  },

  description: {
    type: String,
    required: [true, "Please enter product description"],
  },
  category: {
    type: String,
    required: [true, "Please enter product category"],
  },

  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    maxLength: [5, "Stock cannot exceed 4 characters"],
    default: 0,
  },
  images: [
    {
      public_id: {
        type: String,
        required: true,
      },
      url: {
        type: String,
        required: true,
      },
    },
  ],

  rating: {
    type: Number,
    default: 0,
  },

  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      name: {
        type: String,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
      },
      comment: {
        type: String,
        required: true,
      },
      user:{
        type:mongoose.Schema.ObjectId,
        ref:"userDetail",
        required:true,
      }
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  user:{
    type:mongoose.Schema.ObjectId,
    ref:"userDetail",
    required:true,
  }
});

const productModel = mongoose.model("rohitProduct", productSchema);

module.exports = productModel;
