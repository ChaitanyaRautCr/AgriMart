const User = require("../model/userModal");

const isRetailer = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole && userRole === "seller") {
      next();
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};
module.exports = isRetailer;
