const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TOKEN } = require("../config/secure");
const customError = require("../utils/errorHandler");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    required: true,
    trim: true,
    enum: ["user", "admin"],
    default: "user",
  },
  image: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
    min: [18,"Under age"],
    max:[100,"Over age"]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Not valid email");
      }
    },
  },
  password: {
    type: String,
    minLength: [6,"Password is to short"],
    required: true,
  },
  cpassword: {
    type: String,
    minLength: [6,"Password is to short"],
    required: true,
  },

  gender: {
    type: String,
    required: true,
  },

  Tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
  number:{
    type:Number,
    required:true,
  },
  passwordResetToken: String,
  passwordResetTokenExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    try {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
      this.cpassword = await bcrypt.hash(this.cpassword, saltRounds);
      next();
    } catch (error) {
      return next(new customError("Internal server error", 500, "error"));
    }
  }
});

userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id }, TOKEN, {
    expiresIn: "1d",
  });
  this.Tokens=[];
  this.Tokens.push({ token });
  await this.save();
  return token;
};

userSchema.methods.generateResetToken = async function () {
  let Token = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(Token)
    .digest("hex");
  this.passwordResetTokenExpires = Date.now() + 10 * 60 * 1000;
  await this.save();
  return Token;
};

const userModel = new mongoose.model("userDetail", userSchema);

module.exports = userModel;
