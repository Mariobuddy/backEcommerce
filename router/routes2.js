const routes2 = require("express").Router();
const {authUser}=require("../middleware/auth");
const authRole=require("../middleware/role");
const {newOrder,singleOrder,myOrder,allOrders,updateOrders,deleteOrder}=require("../controller/order");

routes2.post("/neworder",authUser,newOrder);
routes2.get("/admin/singleorder/:id",authUser,authRole,singleOrder);
routes2.get("/myorder",authUser,myOrder);
routes2.get("/admin/allorder",authUser,authRole,allOrders);
routes2.patch("/admin/updatestock/:id",authUser,authRole,updateOrders);
routes2.delete("/admin/deleteorder/:id",authUser,authRole,deleteOrder);

module.exports=routes2;