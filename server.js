const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const orderRouter = require("./routes/orderRoutes");
const cookieParser = require("cookie-parser");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// connect mongodb
mongoose
  .connect(
    process.env.MONGO_URL ||
      "mongodb+srv://crkon123:66gZr6cLei44O9Tb@cluster1.sfzf8l5.mongodb.net/"
  )
  .then(console.log("MongoDB connected successfully"))
  .catch((err) => console.log(err));

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// cors
app.use(cors());

//ejs
app.set("view engine", "ejs");

//css
app.use(express.static("public"));

// routes
app.use("/user", userRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);

// start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
