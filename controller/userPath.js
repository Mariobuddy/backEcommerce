const userModel = require("../database/schema");
const bcrypt = require("bcrypt");
const customError = require("../utils/errorHandler");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const Register = async (req, res, next) => {
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
    return res
      .status(200)
      .json({ sucess: true, message: "Registration sucessfull" });
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};

const Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(
        new customError("Email and password are required", 422, "fail")
      );
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
    return res.status(200).json({ sucess: true, token, userData });
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};

let Logout = (req, res, next) => {
  res.cookie("jwt", "", { expires: new Date(0), httpOnly: true });
  res.status(200).json({ sucess: true, message: "Logout" });
};

const ForgotPassword = async (req, res, next) => {
  try {
    let forgotEmail = await userModel.findOne({ email: req.body.email });
    if (!forgotEmail) {
      return next(new customError("Email not found", 404, "fail"));
    }
    let resetToken = await forgotEmail.generateResetToken();
    let reqPath = `${req.protocol}://${req.get("host")}/reset/${resetToken}`;
    const message = `we have received a password reset request.Please use the below link to reset your password\n\n${reqPath}`;
    try {
      await sendEmail({
        email: forgotEmail.email,
        subject: "Password change request received",
        message: message,
      });
      res.status(200).json({
        status: "sucess",
        message: "password reset link send to the user email",
      });
    } catch (error) {
      forgotEmail.passwordResetToken = undefined;
      forgotEmail.passwordResetTokenExpires = undefined;
      await forgotEmail.save();
      return next(
        new customError(
          "There was an error sending password request email",
          500,
          "error"
        )
      );
    }
  } catch (error) {
    console.log(error);
    return next(new customError("Internal server error", 500, "error"));
  }
};

const ResetPassword = async (req, res, next) => {
  try {
    let encrypt = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    let user = await userModel.findOne({
      passwordResetToken: encrypt,
      passwordResetTokenExpires: { $gt: Date.now() },
    });
    if (!user) {
      return next(
        new customError("Token is invalid or has expired", 404, "fail")
      );
    }
    const minLength = 6;
    if (
      req.body.password.length < minLength ||
      req.body.cpassword.length < minLength
    ) {
      return next(new customError("Password length is too short", 404, "fail"));
    }
    if (req.body.password !== req.body.cpassword) {
      return next(new customError("Password is not matching", 400, "fail"));
    } else {
      user.password = req.body.password;
      user.cpassword = req.body.cpassword;
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = Date.now();
      await user.save();
      return res
        .status(200)
        .json({ sucess: true, message: "Password updated sucessfully" });
    }
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};

const Profile=async(req,res,next)=>{
  try {
    let user=await userModel.findOne(req.user._id);
    if(!user){
      return next(new customError("Invalid email", 422, "fail"));
    }
    res.status(200).json({sucess:true,user});
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
}

const updatePassword=async(req,res,next)=>{
  try {
    let user=await userModel.findOne(req.user._id).select("-_id password");
    console.log(user);
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }

}

module.exports = {
  Login,
  Register,
  Logout,
  ForgotPassword,
  ResetPassword,
  Profile,
  updatePassword
  
};
