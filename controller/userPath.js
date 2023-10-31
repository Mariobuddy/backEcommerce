const userModel = require("../database/schema");
const bcrypt = require("bcrypt");
const customError = require("../utils/errorHandler");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const cloudinary = require("cloudinary");

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

    const myCloud = await cloudinary.v2.uploader.upload(image, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });

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
      image: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });

    await userData.save();
    return res
      .status(200)
      .json({ sucess: true, message: "Registration sucessfull" });
  } catch (error) {
    if (error.errors) {
      let valid = {};
      for (let i in error.errors) {
        valid[i] = error.errors[i].message;
      }
      let err = Object.values(valid);
      return next(new customError(err.toString(), 422, "fail"));
    }
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
      httpOnly: false,
      secure: false,
      expires: new Date(Date.now() + 86400000),
    });
    return res.status(200).json({ sucess: true, token });
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};

let Logout = async (req, res, next) => {
  try {
    res.clearCookie("jwt");
    await req.user.save();
    res.status(200).json({ sucess: true, message: "Logout" });
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};

const ForgotPassword = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new customError("Enter your email", 422, "fail"));
  }
  try {
    let forgotEmail = await userModel.findOne({ email: email });
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
  const { password, cpassword } = req.body;
  if (!password || !cpassword) {
    return next(new customError("All fields are required", 422, "fail"));
  }
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
    if (password.length < minLength) {
      return next(new customError("Password length is too short", 404, "fail"));
    }
    if (cpassword.length < minLength) {
      return next(
        new customError("ConfirmPassword length is too short", 404, "fail")
      );
    }
    if (password !== cpassword) {
      return next(new customError("Password is not matching", 400, "fail"));
    } else {
      user.password = password;
      user.cpassword = cpassword;
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpires = Date.now();
      await user.save();
      return res.status(200).json({ sucess: true, user });
    }
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};

const Profile = async (req, res, next) => {
  try {
    let user = await userModel.findOne(req.user._id);
    if (!user) {
      return next(new customError("Invalid email", 422, "fail"));
    }
    res.status(200).json({ sucess: true, user });
  } catch (error) {
    console.log(error);
    return next(new customError("Internal server error", 500, "error"));
  }
};

const updatePassword = async (req, res, next) => {
  const { currentpassword, newpassword, cnewpassword } = req.body;
  if (!currentpassword || !newpassword || !cnewpassword) {
    return next(new customError("All fields are required", 422, "fail"));
  }
  try {
    let userData = await userModel.findOne(req.user._id);
    const isMatch = await bcrypt.compare(currentpassword, userData.password);
    if (!isMatch) {
      return next(
        new customError("Current password is incorrect", 422, "fail")
      );
    }
    const minLength = 6;
    if (newpassword.length < minLength) {
      return next(new customError("Password length is too short", 404, "fail"));
    }
    if (cnewpassword.length < minLength) {
      return next(
        new customError("ConfirmPassword length is too short", 404, "fail")
      );
    }
    if (newpassword !== cnewpassword) {
      return next(new customError("Passwords do not match", 422, "fail"));
    }
    userData.password = newpassword;
    userData.cpassword = cnewpassword;
    await userData.save();
    const token = await userData.generateAuthToken();
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: false,
      expires: new Date(Date.now() + 86000000),
    });
    return res.status(200).json({ sucess: true, token, userData });
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};
const updateProfile = async (req, res, next) => {
  const { name, surname, email, gender } = req.body;
  if (!name && !surname  && !email && !gender) {
    return next(new customError("Nothing to update", 422, "fail"));
  }
  // const myCloud = await cloudinary.v2.uploader.upload(image, {
  //   folder: "avatars",
  //   width: 150,
  //   crop: "scale",
  // });
  try {
    let user = await userModel.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });
    return res.status(200).json({ sucess: true, user });
  } catch (error) {
    if (error.errors) {
      let valid = {};
      for (let i in error.errors) {
        valid[i] = error.errors[i].message;
      }
      let err = Object.values(valid);
      return next(new customError(err.toString(), 422, "fail"));
    }
    return next(new customError("Internal server error", 500, "error"));
  }
};

const DeleteUser = async (req, res, next) => {
  try {
    await userModel.findByIdAndRemove(req.user._id);
    res.cookie("jwt", "", { expires: new Date(0), httpOnly: true });
    return res.status(200).json({ sucess: true, message: "Delete account" });
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};
module.exports = {
  updateProfile,
  Login,
  Register,
  Logout,
  ForgotPassword,
  ResetPassword,
  Profile,
  updatePassword,
  DeleteUser,
};
