const productModel = require("../database/schema1");
const customError = require("../utils/errorHandler");
const mongoose = require("mongoose");
const userModel = require("../database/schema");

const createProduct = async (req, res, next) => {
  const { name, price, category, description, images, brand } = req.body;
  if (!name || !price || !category || !description || !images || !brand) {
    return next(new customError("All Field are required", 422, "fail"));
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
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new customError("Invalid format", 400, "fail"));
  }
  try {
    let updateUser = await productModel.findByIdAndUpdate(productId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updateUser) {
      return next(new customError("Product not found", 404, "fail"));
    }
    console.log("Product updated");
    return res.status(200).json({
      sucess: true,
      updateUser,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new customError("Invalid format", 400, "fail"));
  }
  try {
    let del = await productModel.findByIdAndRemove(productId);
    if (!del) {
      return next(new customError("Product not found", 404, "fail"));
    }
    console.log("Product deleted");
    return res.status(200).json({
      sucess: true,
      del,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const getProduct = async (req, res, next) => {
  const productId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new customError("Invalid format", 400, "fail"));
  }
  try {
    let product = await productModel.findById(productId);
    if (!product) {
      return next(new customError("Product not found", 404, "fail"));
    }
    console.log("Product found");
    return res.status(200).json({
      sucess: true,
      product,
    });
  } catch (error) {
    console.log(error);
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const allUser = async (req, res, next) => {
  try {
    const allUser = await userModel.find();
    return res.status(200).json({
      sucess: true,
      allUser,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const singleUser = async (req, res, next) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new customError("Invalid format", 400, "fail"));
  }
  try {
    const singleUser = await userModel.findById(productId);
    if (!singleUser) {
      return next(new customError("User not found", 404, "fail"));
    }
    return res.status(200).json({
      sucess: true,
      singleUser,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const updateRole = async (req, res, next) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new customError("Invalid format", 400, "fail"));
  }
  try {
    let validUser = await userModel.findByIdAndUpdate(productId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!validUser) {
      return next(new customError("User not found", 404, "fail"));
    }

    return res.status(200).json({
      sucess: true,
      validUser,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const deleteUser = async (req, res, next) => {
  const productId = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new customError("Invalid format", 400, "fail"));
  }
  try {
    let del = await userModel.findByIdAndRemove(productId);
    if (!del) {
      return next(new customError("User not found", 404, "fail"));
    }
    return res.status(200).json({
      sucess: true,
      del,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const createReviews = async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return next(new customError("Invalid format", 400, "fail"));
  }
  let reviews = {
    user: req.user._id,
    name: req.user.name,
    comment: comment,
    rating: Number(rating),
  };
  try {
    let product = await productModel.findById(productId);
    if (!product) {
      return next(new customError("Product not found", 404, "fail"));
    }
    let isReviewed = product.reviews.find((val) => {
      return val.user.toString() === req.user._id.toString();
    });
    if (isReviewed) {
      product.reviews.map((val) => {
        if (val.user.toString() === req.user._id.toString()) {
          val.comment = comment;
          val.rating = rating;
        }
      });
    } else {
      product.reviews.push(reviews);
    }
    let sum = product.reviews.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.rating;
    }, 0);
    let avg = sum / product.reviews.length;
    product.numOfReviews = product.reviews.length;
    product.rating = avg.toFixed(1);
    await product.save();
    res.status(200).json({
      sucess: true,
      product,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    const totalProducts = await productModel.countDocuments();
    let page = Number(Math.floor(req.query.page)) || 1;
    let limit = Number(Math.floor(req.query.limit)) || 8;
    let skip = (page - 1) * limit;
    const query = productModel.find();
    query.skip(skip).limit(limit);

    if (req.query.company) {
      query.where("company").equals(req.query.company);
    }

    if (req.query.minStar && req.query.maxStar) {
      query.where("rating").gte(req.query.minStar).lte(req.query.maxStar);
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

    if (req.query.brand) {
      query.where("brand").equals(req.query.brand);
    }

    if (req.query.name) {
      query.where("name").regex(new RegExp(req.query.name, "i"));
    }

    if (req.query.sortBy) {
      const sortFields = req.query.sortBy.split(",");
      query.sort(sortFields.join(" "));
    }

    if (req.query.select) {
      const selectFields = req.query.select.split(",");
      query.select(selectFields.join(" "));
    }

    const items = await query;
    return res.json({
      nbhits: totalProducts,
      items,
      currentPageLength: items.length,
      resultPerPage: limit,
    });
  } catch (error) {
    console.log(error);
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const getReviews = async (req, res, next) => {
  try {
    let product = await productModel.findById(req.query.productId);
    if (!product) {
      return next(new customError("User not found", 404, "fail"));
    }
    res.status(200).json({
      sucess: true,
      review: product.reviews,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const deleteReview = async (req, res, next) => {
  try {
    let product = await productModel.findById(req.query.productId);

    product.reviews = product.reviews.filter((val) => {
      return val._id.toString() !== req.query.Id;
    });

    product.numOfReviews = product.reviews.length;
    let sum = product.reviews.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.rating;
    }, 0);
    let avg = sum / product.reviews.length;
    product.numOfReviews = product.reviews.length;
    product.rating = avg || 0;
    await product.save();
    res.status(200).json({
      sucess: true,
      product,
    });
  } catch (error) {
    console.log(error);
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
  deleteUser,
  createReviews,
  getReviews,
  deleteReview,
};
