const User = require("../model/userModal");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const Orders = require("../model/orderModal");
const Product = require("../model/productModel");

const userCtrl = {
  //! register user
  registerUser: asyncHandler(async (req, res) => {
    const { name, email, password, role, street, city, state, zip, phone } =
      req.body;

    if (!name || !email || !password || !role) {
      return res.render("register", {
        error: "All fields are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render("register", { error: "Email already in use" });
    }

    const userData = {
      name,
      email,
      password,
      role,
      phone,
    };

    // Optional: add address only if all parts are present
    if (street && city && state && zip) {
      userData.address = { street, city, state, zip };
    }
    const user = await User.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in ms
    });

    res.redirect("/user/dashboard");
  }),
  //! login
  loginUser: asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.render("login", {
        error: "Email and password are required",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.render("login", { error: "User not found" });
    }
    if (!user.password === password) {
      return res.render("login", { error: "Invalid password" });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "3d",
      }
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days in ms
    });
    res.redirect("/user/dashboard");
  }),

  //! get dashboard
  getDashboard: asyncHandler(async (req, res) => {
    const userRole = req.user.role;
    if (userRole === "buyer") {
      let popularProducts = await Orders.aggregate([
        { $match: { status: "delivered" } },

        {
          $group: {
            _id: "$productId",
            totalOrdered: { $sum: "$quantity" },
            orderCount: { $sum: 1 },
          },
        },

        { $sort: { totalOrdered: -1 } },
        { $limit: 10 },

        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },
        { $unwind: "$product" },

        {
          $lookup: {
            from: "images",
            localField: "product.image",
            foreignField: "_id",
            as: "imageData",
          },
        },
        { $unwind: { path: "$imageData", preserveNullAndEmptyArrays: true } },

        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                "$product",
                {
                  totalOrdered: "$totalOrdered",
                  orderCount: "$orderCount",
                  image: { url: "$imageData.url" }, // 👈 match Product schema
                },
              ],
            },
          },
        },

        {
          $project: {
            name: 1,
            price: 1,
            type: 1,
            specification: 1,
            totalOrdered: 1,
            orderCount: 1,
            image: 1, // keep consistent structure
          },
        },
      ]);

      // is no popular porducts
      if (popularProducts.length < 6) {
        let popularProducts = await Product.find()
          .limit(10)
          .populate("image", "-_id -public_id -createdAt -updatedAt -__v");
        res.render("dashboard", { user: req.user, popularProducts });
      } else {
        res.render("dashboard", { user: req.user, popularProducts });
      }
    } else if (userRole === "seller") {
      const userId = req.user.id; // get user ID from request
      if (!userId) {
        res.redirect("/user/login");
      }
      const orders = await Orders.find({ sellerId: userId })
        .populate({
          path: "buyerId",
          select: "name email address phone",
        })
        .populate({
          path: "productId",
          select: "price name image", // include image reference
          populate: {
            path: "image", // populate the image reference
            select: "url -_id", // only get url, exclude _id
          },
        });

      res.render("dashboard", {
        user: req.user,
        orders,
      });
    }
  }),
};

module.exports = userCtrl;
