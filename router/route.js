const routes = require("express").Router();
const {authUser} = require("../middleware/auth");
const authRole=require("../middleware/role");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  allUser,
  singleUser,
  updateRole,
  deleteUser
} = require("../controller/product");

routes.get("/",getAllProducts);
routes.get("/:id", getProduct);
routes.post("/admin/new",authUser,authRole,createProduct);
routes.put("/admin/updateproduct/:id",authUser, authRole,updateProduct);
routes.delete("/admin/:id",authRole, deleteProduct);
routes.get("/admin/alluser",allUser);
routes.get("/admin/singleuser/:id",singleUser);
routes.patch("/admin/updaterole/:id",authUser,authRole,updateRole);
routes.delete("/admin/deleteuser/:id",authUser,authRole,deleteUser);


module.exports = routes;
