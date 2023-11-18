const {paymentGateway}=require("../controller/payment");
const routes3 = require("express").Router();
const {authUser}=require("../middleware/auth")

routes3.post("/paymentgateway",authUser,paymentGateway);

module.exports=routes3;