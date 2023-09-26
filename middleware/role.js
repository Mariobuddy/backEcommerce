const customError = require("../utils/errorHandler");

const authRole = async (req, res, next) => {
    try {
      if (req.user && req.user.role === "admin") {
        return next();
      }
      return next(new customError("Access denied. Admins only.", 403, "fail"));
    } catch (error) {
      return next(new customError("Internal server error.", 500, "error"));
    }
  };

module.exports = authRole;
