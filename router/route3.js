const {paymentGateway,getStripeKey}=require("../controller/payment");
const routes3 = require("express").Router();
const {authUser}=require("../middleware/auth")

routes3.post("/paymentgateway",authUser,paymentGateway);
routes3.get("/stripekey",authUser,getStripeKey);

module.exports=routes3;