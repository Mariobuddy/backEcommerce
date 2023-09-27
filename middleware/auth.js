const userModel = require("../database/schema");
const jwt = require("jsonwebtoken");
const { TOKEN } = require("../config/secure");
const customError = require("../utils/errorHandler");

const authUser = async (req, res, next) => {
  const token =req.cookies.jwt;
  if (!token) {
    return next(new customError("Please login", 422, "fail"));
  }
  try {
    let sign = jwt.verify(token, TOKEN);
    req.user=await userModel.findById(sign._id);
    next();
  } catch (error) {
    console.log(error);
    return next(new customError("Internal server error", 500, "error"));
  }
};

module.exports = {authUser};
