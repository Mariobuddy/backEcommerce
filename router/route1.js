const routes1 = require("express").Router();
const { authUser } = require("../middleware/auth");
const {
  Login,
  Logout,
  Register,
  ForgotPassword,
  ResetPassword,
  Profile,
  updateProfile,
  updatePassword,
  DeleteUser,
} = require("../controller/userPath");

routes1.post("/register", Register);
routes1.post("/login", Login);
routes1.get("/logout", authUser,Logout);
routes1.post("/forgot", ForgotPassword);
routes1.patch("/reset/:token", ResetPassword);
routes1.get("/profile", authUser, Profile);
routes1.patch("/updatepassword", authUser, updatePassword);
routes1.patch("/updateprofile", authUser, updateProfile);
routes1.delete("/deleteprofile",authUser, DeleteUser);

module.exports = routes1;
