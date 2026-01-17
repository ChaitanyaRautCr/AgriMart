const express = require("express");
const orderCtrl = require("../controller/orderController.js");
const isCustomer = require("../middleware/isCustomer.js");
const isAuthenticated = require("../middleware/isAuthenticated.js");
const isRetailer = require("../middleware/isRetailer.js");

const orderRouter = express.Router();

orderRouter.post(
  "/place-order",
  isAuthenticated,
  isCustomer,
  orderCtrl.placeOrders
);

orderRouter.get(
  "/get-orders",
  isAuthenticated,
  isRetailer,
  orderCtrl.getOrders
);

orderRouter.get(
  "/get-orders-buyer",
  isAuthenticated,
  isCustomer,
  orderCtrl.getOrdersBuyer
);
orderRouter.post(
  "/update-order-shipped/:id",
  isAuthenticated,
  isRetailer,
  orderCtrl.updateOrderShipped
);
orderRouter.post(
  "/update-order-delivered/:id",
  isAuthenticated,
  isCustomer,
  orderCtrl.updateOrderDelivered
);

module.exports = orderRouter;
