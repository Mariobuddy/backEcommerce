const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { TOKEN } = require("../config/secure");
const customError = require("../utils/errorHandler");

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
    enum: ['user', 'admin'],
    default:"user"
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
    min: 1,
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
    minLength: 6,
    required: true,
  },
  cpassword: {
    type: String,
    minLength: 6,
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
  try {
    const token = jwt.sign({ _id: this._id }, TOKEN, {
      expiresIn: "1d",
    });

    this.Tokens.push({ token }); // Use push to add the token to the Tokens array
    await this.save();

    return token;
  } catch (error) {
    return next(new customError("Internal server error", 500, "error"));
  }
};

const userModel = new mongoose.model("userDetail", userSchema);

module.exports = userModel;
