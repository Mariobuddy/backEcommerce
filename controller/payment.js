const { STRIPE_API_KEY, STRIPE_SECRET_KEY } = require("../config/secure");
const customError = require("../utils/errorHandler");
const stripe = require("stripe")(STRIPE_SECRET_KEY);

const paymentGateway = async (req, res, next) => {
  const { amount } = req.body;
  try {
    let myPayment = await stripe.paymentIntends.create({
      amount,
      currency: "inr",
      metadata: {
        company: "Mario Store",
      },
    });
    res
      .status(200)
      .json({ sucess: true, client_secret: myPayment.client_secret });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

const getStripeKey = async (req, res, next) => {
  try {
    res.status(200).json({ stripe_key: STRIPE_API_KEY });
  } catch (error) {
    return next(new customError("Internal Server Error", 500, "error"));
  }
};

module.exports = { paymentGateway,getStripeKey };
