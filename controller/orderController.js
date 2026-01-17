const Order = require("../model/orderModal");
const User = require("../model/userModal");
const Product = require("../model/productModel");
const mongoose = require("mongoose");
const asyncHandler = require("express-async-handler");

const orderCtrl = {
  //! place order
  placeOrders: asyncHandler(async (req, res) => {
    const { products } = req.body;
    const userId = req.user.id; // get user ID from request
    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }
    if (!Array.isArray(products)) {
      return res.status(400).json({ message: "Products are required" });
    }
    // add orders
    for (let product of products) {
      const order = await Order.create({
        buyerId: userId,
        productId: product.productId,
        quantity: product.quantity,
        sellerId: product.sellerId,
        status: "pending",
      });
    }
    return res
      .status(200)
      .json({ success: true, message: "Order placed successfully" });
  }),
  //! get orders
  getOrders: asyncHandler(async (req, res) => {
    const userId = req.user.id; // get user ID from request
    if (!userId) {
      res.render("login", {
        error: "Unauthorized access",
      });
    }
    const orders = await Order.aggregate([
      // Filter orders by seller
      {
        $match: { sellerId: new mongoose.Types.ObjectId(userId) },
      },

      // Lookup buyer details
      {
        $lookup: {
          from: "users",
          localField: "buyerId",
          foreignField: "_id",
          as: "buyer",
        },
      },
      { $unwind: "$buyer" },

      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // Group by buyerId
      {
        $group: {
          _id: "$buyerId",
          buyerName: { $first: "$buyer.name" },
          buyerEmail: { $first: "$buyer.email" },
          buyerPhone: { $first: "$buyer.phone" },
          buyerAddress: { $first: "$buyer.address" },
          orders: {
            $push: {
              orderId: "$_id", // 👈 include order _id here
              productName: "$product.name",
              price: "$product.price",
              quantity: "$quantity",
              status: "$status",
              createdAt: "$createdAt",
            },
          },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalSales: { $sum: { $multiply: ["$product.price", "$quantity"] } },
        },
      },
    ]);

    res.render("orders", { user: req.user, orders });
  }),

  //! get orders grouped by seller
  getOrdersBuyer: asyncHandler(async (req, res) => {
    const userId = req.user.id; // buyer
    if (!userId) {
      return res.render("login", { error: "Unauthorized access" });
    }

    const orders = await Order.aggregate([
      // Filter orders by buyer
      {
        $match: { buyerId: new mongoose.Types.ObjectId(userId) },
      },

      // Lookup seller details
      {
        $lookup: {
          from: "users",
          localField: "sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: "$seller" },

      // Lookup product details
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // Group by sellerId
      {
        $group: {
          _id: "$sellerId", // group by seller
          sellerId: { $first: "$sellerId" },
          sellerName: { $first: "$seller.name" },
          sellerEmail: { $first: "$seller.email" },
          sellerPhone: { $first: "$seller.phone" },
          sellerAddress: { $first: "$seller.address" }, // 👈 added seller address
          orders: {
            $push: {
              orderId: "$_id",
              productName: "$product.name",
              price: "$product.price",
              quantity: "$quantity",
              status: "$status",
              createdAt: "$createdAt",
            },
          },
          totalOrders: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
          totalSpent: { $sum: { $multiply: ["$product.price", "$quantity"] } },
        },
      },
    ]);

    res.render("buyer-orders", { user: req.user, orders });
  }),

  //! update order status
  updateOrderShipped: asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id; // get user ID from request
    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Check if the user is the seller of the order
    if (order.sellerId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    order.status = "shipped";
    await order.save();
    return res
      .status(200)
      .json({ success: true, message: "Order status updated successfully" });
  }),

  //! update order status delevered
  updateOrderDelivered: asyncHandler(async (req, res) => {
    const orderId = req.params.id;
    const userId = req.user.id; // get user ID from request
    if (!userId) {
      return res.status(400).json({ message: "Unauthorized" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Check if the user is the seller of the order
    if (order.buyerId.toString() !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
    order.status = "delivered";
    console.log(order);

    await order.save();
    return res
      .status(200)
      .json({ success: true, message: "Order status updated successfully" });
  }),
};

module.exports = orderCtrl;
