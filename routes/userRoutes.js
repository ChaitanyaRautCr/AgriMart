const express = require("express");
const userCtrl = require("../controller/userController.js");
const isAuthenticated = require("../middleware/isAuthenticated.js");
const isCustomer = require("../middleware/isCustomer.js");
const Product = require("../model/productModel.js");
const Orders = require("../model/orderModal.js");
const isRetailer = require("../middleware/isRetailer.js");

const userRouter = express.Router();

userRouter.get("/register", (req, res) => {
  res.render("login_register");
});

userRouter.get("/login", (req, res) => {
  res.render("login");
});

userRouter.get("/dashboard", isAuthenticated, userCtrl.getDashboard);

userRouter.get("/vegetables", isAuthenticated, isCustomer, async (req, res) => {
  const products = await Product.find({ type: "vegetable" }).populate(
    "image",
    "-_id -public_id -createdAt -updatedAt -__v"
  );
  res.render("vegetables", { user: req.user, products });
});

userRouter.get("/fruits", isAuthenticated, isCustomer, async (req, res) => {
  const products = await Product.find({ type: "fruit" }).populate(
    "image",
    "-_id -public_id -createdAt -updatedAt -__v"
  );
  res.render("fruits", { user: req.user, products });
});

userRouter.get("/flowers", isAuthenticated, isCustomer, async (req, res) => {
  const products = await Product.find({ type: "flower" }).populate(
    "image",
    "-_id -public_id -createdAt -updatedAt -__v"
  );
  res.render("flowers", { user: req.user, products });
});

userRouter.get("/Tools", isAuthenticated, isCustomer, async (req, res) => {
  const products = await Product.find({ type: "Tools" }).populate(
    "image",
    "-_id -public_id -createdAt -updatedAt -__v"
  );
  res.render("Tools", { user: req.user, products });
});

userRouter.get("/fertilizers", isAuthenticated, isCustomer, async (req, res) => {
  const products = await Product.find({ type: "fertilizers" }).populate(
    "image",
    "-_id -public_id -createdAt -updatedAt -__v"
  );
  res.render("fertilizers", { user: req.user, products });
});

userRouter.get("/cart", isAuthenticated, isCustomer, async (req, res) => {
  res.render("cart", { user: req.user });
});

userRouter.get("/logout", isAuthenticated, (req, res) => {
  res.clearCookie("token");
  res.redirect("/user/login");
});

userRouter.get("/add-product", isAuthenticated, async (req, res) => {
  let product = null;
  if (req.query.productId) {
    product = await Product.findById(req.query.productId).populate(
      "image",
      "-_id -public_id -createdAt -updatedAt -__v"
    );
  }
  res.render("add-product", { user: req.user, product });
});

userRouter.get("/my-product", isAuthenticated, isRetailer, async (req, res) => {
  const userId = req.user.id;
  const products = await Product.find({ sellerId: userId }).populate(
    "image",
    "-_id -public_id -createdAt -updatedAt -__v"
  );
  res.render("my-products", { user: req.user, products });
});

userRouter.post("/register", userCtrl.registerUser);

userRouter.post("/login", userCtrl.loginUser);

userRouter.get("/payment",isAuthenticated,isCustomer, (req, res) => {
   res.render("payment",{user:req.user})});

module.exports = userRouter;
