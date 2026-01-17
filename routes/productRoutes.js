const express = require("express");
const productCtrl = require("../controller/productController.js");
const isAuthenticated = require("../middleware/isAuthenticated.js");
const isRetailer = require("../middleware/isRetailer.js");
const productRouter = express.Router();
const Product = require("../model/productModel.js");
const {
  uploadImageAndExtractBase64,
  updateImage,
} = require("../middleware/uploadImage.js");

// Search must come before ":id"
productRouter.get("/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    })
      .limit(5)
      .lean()
      .populate("image", "-_id -public_id -createdAt -updatedAt -__v");

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Route for single product
productRouter.get("/:id", isAuthenticated, async (req, res) => {
  const id = req.params.id;
  try {
    const product = await Product.findById(id)
      .populate("sellerId", "-_id -password -role")
      .populate("image", "-_id -public_id -createdAt -updatedAt -__v");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.render("product", { user: req.user, product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

productRouter.post(
  "/add-product",
  isAuthenticated,
  isRetailer,
  uploadImageAndExtractBase64,
  productCtrl.addProduct
);

productRouter.delete(
  "/delete-product/:id",
  isAuthenticated,
  isRetailer,
  productCtrl.deleteProduct
);

productRouter.post(
  "/update-product",
  isAuthenticated,
  isRetailer,
  updateImage,
  productCtrl.updateProduct
);

module.exports = productRouter;
