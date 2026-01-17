const jwt = require("jsonwebtoken");

const isAuthenticated = (req, res, next) => {
  let token;

  // 1. Check from cookie (preferred if set in login)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 2. Fallback: Check Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.redirect("/user/login");
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // attach user info
    next();
  } catch (err) {
    res.redirect("/user/login");
  }
};

module.exports = isAuthenticated;
