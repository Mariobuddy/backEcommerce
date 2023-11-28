const routes = require("express").Router();
const { authUser } = require("../middleware/auth");
const authRole = require("../middleware/role");
const {
  getAllProducts,
  createProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  allUser,
  singleUser,
  updateRole,
  deleteUser,
  createReviews,
  getReviews,
  deleteReview,
  getAdminProducts
} = require("../controller/product");

routes.get("/products", getAllProducts);
routes.get("/products/:id", getProduct);
routes.post("/products/admin/new", authUser, authRole, createProduct);
routes.get("/products/admin/allproducts", authUser, authRole, getAdminProducts);
routes.patch("/products/admin/updateproduct/:id", authUser, authRole, updateProduct);
routes.delete("/products/admin/deleteproduct/:id", authUser, authRole, deleteProduct);
routes.get("/products/admin/alluser", authUser, authRole, allUser);
routes.get("/products/admin/singleuser/:id", authUser, authRole, singleUser);
routes.patch("/products/admin/updaterole/:id", authUser, authRole, updateRole);
routes.delete("/products/admin/deleteuser/:id", authUser, authRole, deleteUser);
routes.patch("/products/reviews", authUser, createReviews);
routes.get("/products/getreview", authUser, getReviews);
routes.delete("/products/deletereview", authUser, deleteReview);
module.exports = routes;
