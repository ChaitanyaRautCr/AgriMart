const User = require("../model/userModal");

const isCustomer = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    if (userRole && userRole === "buyer") {
      next();
    } else {
      console.log("error");
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = isCustomer;
