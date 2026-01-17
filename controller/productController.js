const Product = require("../model/productModel.js");
const asyncHandler = require("express-async-handler");
const cloudinary = require("../utils/cloudinaryConfig");
const Image = require("../model/imageModal.js");

const productCtrl = {
  //! add product
  addProduct: asyncHandler(async (req, res) => {
    const { productName, price, description, type, status } = req.body; // ✅ include status
    const userId = req.user.id; 
    const imageId = req.savedImage ? req.savedImage._id : null;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (!productName || !price || !description || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let data = {
      sellerId: userId,
      name: productName,
      price: price,
      description: description,
      type: type,
      status: status || "In Stock", // ✅ default fallback
    };

    // Parse specification string back to array
    let specification = JSON.parse(req.body.specification || "[]");

    if (Array.isArray(specification)) {
      data.specification = specification;
    }

    if (imageId) {
      data.image = imageId;
    }

    const product = await Product.create(data);

    if (!product) {
      return res.status(500).json({ message: "Failed to add product" });
    }

    res.status(201).json({ success: true, message: "Product added successfully" });
  }),

  //! delete product
  deleteProduct: asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;

    if (!productId || !userId) {
      return res.status(400).json({ message: "Product ID and User ID required" });
    }

    const product = await Product.findOne({ _id: productId, sellerId: userId }).populate("image");
    if (!product) throw new Error("Product not found");

    if (product.image && product.image.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
      await Image.deleteOne({ _id: product.image._id });
    }

    await Product.deleteOne({ _id: productId, sellerId: userId });
    res.status(200).json({ success: true, message: "Product deleted successfully" });
  }),

  //! update product
  updateProduct: asyncHandler(async (req, res) => {
    const { productName, price, description, type, productId, status } = req.body; // ✅ include status
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    let { specification } = req.body;
    if (typeof specification === "string") {
      try {
        specification = JSON.parse(specification);
      } catch (err) {
        return res.status(400).json({ message: "Invalid specification format" });
      }
    }

    if (!Array.isArray(specification)) {
      return res.status(400).json({ message: "Specification must be an array" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // ✅ safely update only the fields sent
    if (productName) product.name = productName;
    if (price) product.price = price;
    if (description) product.description = description;
    if (type) product.type = type;
    if (status) product.status = status; // ✅ update status
    if (specification) product.specification = specification;
    if (req.savedImage) product.image = req.savedImage._id;

    await product.save();

    res.status(200).json({ success: true, message: "Product updated successfully" });
  }),
};

module.exports = productCtrl;
