const productModel = require("../database/schema1");
const customError = require("../utils/errorHandler");
const mongoose = require("mongoose");
const userModel=require("../database/schema");

const createProduct = async (req, res, next) => {
  const {name,price,category,description,images}=req.body;
  if(!name || !price || !category || !description || !images){
    return next(new customError("All Field are required",422,"fail"))
  }
  req.body.user = req.user._id;
  try {
    let product = await productModel.create(req.body);
    console.log("Product created");
    return res.status(200).json({
      sucess: true,
      product,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const updateProduct = async (req, res, next) => {
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) {
    return next(new customError("Product not found", 404, "fail"));
  }
  try {
     let updateUser=await productModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
    console.log("Product updated");
    return res.status(200).json({
      sucess: true,
      updateUser
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const deleteProduct = async (req, res, next) => {
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) {
    return next(new customError("Product not found", 404, "fail"));
  }
  try {
    let del=await productModel.findByIdAndRemove(req.params.id);
    console.log("Product deleted");
    return res.status(200).json({
      sucess: true,
      del
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const getProduct = async (req, res, next) => {
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) {
    return next(new customError("Product not found", 404, "fail"));
  }
  try {
    let product = await productModel.findById(req.params.id);
    console.log("Product found");
    return res.status(200).json({
      sucess: true,
      product,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const allUser=async(req,res,next)=>{
  try {
    const allUser=await userModel.find();
    return res.status(200).json({
      sucess: true,
      allUser,
    });

  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
}

const singleUser=async(req,res,next)=>{
  try {
    const singleUser=await userModel.findOne({_id:req.params.id});
    if(!singleUser){
    return next(new customError("User not found", 404, "fail"));
    }
    return res.status(200).json({
      sucess: true,
      singleUser,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
}

const updateRole=async(req,res,next)=>{
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) {
    return next(new customError("Product not found", 404, "fail"));
  }
  try {
    let userRole=await userModel.findByIdAndUpdate(req.params.id,req.body,{new:true});
    return res.status(200).json({
      sucess: true,
      userRole,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
}

const deleteUser=async(req,res,next)=>{
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) {
    return next(new customError("Product not found", 404, "fail"));
  }
  try {
    product = await productModel.findByIdAndRemove(req.params.id);
    return res.status(200).json({
      sucess: true,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
}

const getAllProducts = async (req, res, next) => {
  try {
    const query = productModel.find();

    if (req.query.page || req.query.skip) {
      let page = Number(req.query.page) || 1;
      let limit = Number(req.query.limit) || 3;
      let skip = (page - 1) * limit;
      query.skip(skip).limit(limit);
    }

    if (req.query.company) {
      query.where("company").equals(req.query.company);
    }

    if (req.query.maxPrice && req.query.minPrice) {
      const minPrice = parseFloat(req.query.minPrice);
      const maxPrice = parseFloat(req.query.maxPrice);
      if (isNaN(minPrice) || isNaN(maxPrice)) {
        return next(new customError("Invalid price range", 422, "fail"));
      }

      query.where("price").gte(minPrice).lte(maxPrice);
    }

    if (req.query.category) {
      query.where("category").equals(req.query.category);
    }

    if (req.query.name) {
      query.where("name").regex(new RegExp(req.query.name, "i"));
    }

    if (req.query.sortBy) {
      console.log(req.query.sortBy);
      const sortFields = req.query.sortBy.split(",");
      query.sort(sortFields.join(" "));
    }

    if (req.query.select) {
      const selectFields = req.query.select.split(",");
      query.select(selectFields.join(" "));
    }

    const items = await query;
    return res.json({ nbhits: items.length, items });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  allUser,
  singleUser,
  updateRole,
  deleteUser
};
