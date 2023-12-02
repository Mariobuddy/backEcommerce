const productModel = require("../database/schema1");
const customError = require("../utils/errorHandler");
const userModel = require("../database/schema");
const cloudinary = require("cloudinary");

const createProduct = async (req, res, next) => {
  const { name, price, category, description, images, brand, stock } = req.body;
  if (
    !name ||
    !price ||
    !category ||
    !description ||
    !images ||
    !brand ||
    !stock
  ) {
    return next(new customError("All Field are required", 422, "fail"));
  }
  try {
    let imageLinks = [];

    for (let i = 0; i < images.length; i++) {
      const myCloud = await cloudinary.v2.uploader.upload(images[i], {
        folder: "products",
      });
      imageLinks.push({
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      });
    }
    req.body.images = imageLinks;
    req.body.user = req.user._id;
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
  try {
    let product = await productModel.findById(productId);
    if (!product) {
      return next(new customError("Product not found", 404, "fail"));
    }

    if (req.body.images !== undefined && req.body.newImages.length !== 0) {
      for (let i = 0; i < product.images.length; i++) {
        await cloudinary.v2.uploader.destroy(product.images[i].public_id);
      }
      let imageLinks = [];
      for (let i = 0; i < req.body.newImages.length; i++) {
        const myCloud = await cloudinary.v2.uploader.upload(
          req.body.newImages[i],
          {
            folder: "products",
          }
        );
        imageLinks.push({
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        });
      }
      req.body.images = imageLinks;
    }
    await productModel.findByIdAndUpdate(productId, req.body, {
      new: true,
      runValidators: true,
    });
    console.log("Product updated");
    return res.status(200).json({
      sucess: true,
      product,
    });
  } catch (error) {
    console.log(error);
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const deleteProduct = async (req, res, next) => {
  const productId = req.params.id;
  try {
    let product = await productModel.findById(productId);
    if (!product) {
      return next(new customError("Product not found", 404, "fail"));
    }
    for (let i = 0; i < product.images.length; i++) {
      await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }
    await productModel.findByIdAndRemove(productId);

    console.log("Product deleted");
    return res.status(200).json({
      sucess: true,
      product,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const getProduct = async (req, res, next) => {
  const productId = req.params.id;
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
    console.log(error);
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const deleteUser = async (req, res, next) => {
  const productId = req.params.id;
  try {
    let del = await userModel.findById(productId);
    if (!del) {
      return next(new customError("User not found", 404, "fail"));
    }
    await cloudinary.v2.uploader.destroy(del.image.public_id);
    await userModel.findByIdAndRemove(productId);
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

const getAdminProducts = async (req, res, next) => {
  try {
    const allProducts = await productModel.find();
    return res.json({
      allProducts,
    });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const getAllProducts = async (req, res, next) => {
  try {
    let page = Number(Math.floor(req.query.page)) || 1;
    let limit = Number(Math.floor(req.query.limit)) || 10;
    let skip = (page - 1) * limit;
    const query = productModel.find();

    let filters = {};

    if (req.query.minStar || req.query.maxStar) {
      const { minStar, maxStar } = req.query;
      if (minStar && maxStar) {
        filters.rating = { $gte: parseInt(minStar), $lte: parseInt(maxStar) };
      } else if (minStar) {
        filters.rating = { $gte: parseInt(minStar) };
      } else if (maxStar) {
        filters.rating = { $lte: parseInt(maxStar) };
      }
    }

    if (req.query.maxPrice || req.query.minPrice) {
      const { minPrice, maxPrice } = req.query;
      if (minPrice && maxPrice) {
        filters.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
      } else if (minPrice) {
        filters.price = { $gte: parseInt(minPrice) };
      } else if (maxPrice) {
        filters.price = { $lte: parseInt(maxPrice) };
      }
    }

    if (req.query.category) {
      filters.category = req.query.category;
    }

    if (req.query.brand) {
      filters.brand = req.query.brand;
    }

    if (req.query.name) {
      filters.name = new RegExp(req.query.name, "i");
    }

    let sort = "";
    if (req.query.sortBy) {
      sort = req.query.sortBy;
    }

    let select = "";
    if (req.query.select) {
      select = req.query.select.split(",").join("");
    }
    const items = await query
      .find(filters)
      .select(select)
      .sort(sort)
      .skip(skip)
      .limit(limit);
    const totalProducts = await productModel.countDocuments(filters);
    return res.json({
      nbhits: totalProducts,
      items,
      resultPerPage: limit,
    });
  } catch (error) {
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

    if (!product) {
      return next(new customError("Product not found", 404, "fail"));
    }
    product.reviews = product.reviews.filter((val) => {
      return val._id.toString() !== req.query.Id;
    });
    let sum = product.reviews.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.rating;
    }, 0);
    let avg = sum / product.reviews.length;
    product.numOfReviews = product.reviews.length;
    product.rating = avg || 0;
    await product.save();
    res.status(200).json({
      sucess: true,
      review: product.reviews,
    });
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
  deleteUser,
  createReviews,
  getReviews,
  deleteReview,
  getAdminProducts,
};
