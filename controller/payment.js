const { STRIPE_SECRET_KEY } = require("../config/secure");
const customError = require("../utils/errorHandler");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const paymentGateway = async (req, res, next) => {
  const { amount } = req.body;
  if (!amount) {
    return next(new customError("Amount Not Received", 422, "error"));
  }
  try {
    const myPayment = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
    });
    res
      .status(200)
      .json({ sucess: true, client_secret: myPayment.client_secret });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

module.exports = { paymentGateway };
