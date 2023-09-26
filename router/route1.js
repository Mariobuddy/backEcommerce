const routes1 = require("express").Router();

const { getLogin, getLogout, getRegister } = require("../controller/userPath");

routes1.post("/register", getRegister);
routes1.post("/login", getLogin);
routes1.get("/logout", getLogout);

module.exports = routes1;
