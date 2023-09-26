const userModel = require("../database/schema");
const bcrypt = require("bcrypt");
const customError = require("../utils/errorHandler");

const getRegister = async (req, res, next) => {
  try {
    const {
      name,
      surname,
      age,
      email,
      gender,
      password,
      cpassword,
      number,
      image,
    } = req.body;

    if (
      !name ||
      !surname ||
      !age ||
      !email ||
      !gender ||
      !password ||
      !cpassword ||
      !number ||
      !image
    ) {
    return next(new customError("All fields are required", 422, "fail"));

    }

    const preUser = await userModel.findOne({ email: email });

    if (preUser) {
    return next(new customError("Email already exists", 422, "fail"));
    }

    if (password !== cpassword) {
        return next(new customError("Passwords do not match", 422, "fail"));
    }

    const userData = new userModel({
      name,
      surname,
      age,
      password,
      cpassword,
      number,
      email,
      gender,
      image,
    });

    await userData.save();
    return res.status(200).json({sucess:true,message: "Registration sucessfull" });
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};

const getLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
    return next(new customError("Email and password are required", 422, "fail"));
    }

    const userData = await userModel.findOne({ email: email });

    if (!userData) {
    return next(new customError("Invalid email", 422, "fail"));
    }

    const isMatch = await bcrypt.compare(password, userData.password);

    if (!isMatch) {
    return next(new customError("Password does not match", 422, "fail"));
    }

    const token = await userData.generateAuthToken();

    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      expires: new Date(Date.now() + 9000000),
    });

    const validUser = await userData.save();
    return res.status(200).json({sucess:true,token,validUser});
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};

let getLogout=(req,res,next)=>{
    res.cookie('jwt', '', { expires: new Date(0), httpOnly: true });
    res.status(200).json({sucess:true,message:"Logout"});
}

module.exports = {getLogin, getRegister,getLogout};
