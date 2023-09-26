const routes = require("express").Router();
const authUser = require("../middleware/auth");
const authRole=require("../middleware/role");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
} = require("../controller/product");

routes.get("/", authUser,authRole,getAllProducts);
routes.post("/new", createProduct);
routes.get("/:id", getProduct);
routes.put("/:id", updateProduct);
routes.delete("/:id", deleteProduct);

module.exports = routes;
