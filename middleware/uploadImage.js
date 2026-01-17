require("dotenv").config();
const multer = require("multer");
const cloudinary = require("../utils/cloudinaryConfig");
const Image = require("../model/imageModal");
const streamifier = require("streamifier");
const crypto = require("crypto");
const Product = require("../model/productModel");

// hash function
function generateImageHash(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

// memory storage for fast access to image
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/bmp",
      "image/tiff",
      "image/avif",
      "image/x-icon",
      "image/heic",
      "image/heif",
    ];

    if (allowedTypes.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image format."), false);
    }
  },
}).single("image");

const uploadImageAndExtractBase64 = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) {
      req.savedImage = null;
      return next();
    }

    try {
      // file data
      const file = req.file;
      const fileBuffer = file.buffer;
      const base64 = fileBuffer.toString("base64");
      const hashedData = generateImageHash(fileBuffer);
      const userId = req.user?.id || "anonymous";

      //? later add index to mongoose
      // check if same image uploaded by user
      let image = await Image.findOne({
        userId,
        hash: hashedData,
      });

      if (image) {
        // Attach inlineData
        req.savedImage = {
          _id: image._id,
        };
        return next();
      }

      // save image to db
      image = await Image.create({
        userId,
        hash: hashedData,
      });
      req.savedImage = {
        _id: image._id,
      };
      // ⏳ Asynchronously upload to Cloudinary (non-blocking)
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `chaitanya_app/${userId}`,
          public_id:
            file.originalname
              .split(".")[0]
              .replace(/\s+/g, "_")
              .replace(/[^a-zA-Z0-9_-]/g, "") +
            "_" +
            Date.now(),
          transformation: [
            { width: 2048, height: 2048, crop: "limit", quality: "auto:best" },
          ],
        },
        async (err, result) => {
          if (!err && result) {
            image.url = result.secure_url;
            image.public_id = result.public_id;

            await image.save();
          }
        }
      );

      // Pipe buffer to cloudinary stream
      streamifier.createReadStream(file.buffer).pipe(stream);

      next();
    } catch (error) {
      console.error("Image upload failed:", error);
      next(); // continue anyway, Gemini can still work
    }
  });
};

//! update image
const updateImage = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) {
      req.savedImage = null;
      return next();
    }

    try {
      const file = req.file;
      const fileBuffer = file.buffer;
      const hashedData = generateImageHash(fileBuffer);
      const userId = req.user?.id || "anonymous";

      // check if same image already exists
      let image = await Image.findOne({ userId, hash: hashedData });

      if (image) {
        req.savedImage = { _id: image._id };
        return next();
      }

      // get product
      const productId = req.body.productId;
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ error: "Product not found" });

      // 🔥 If product already has an image, delete the old one from Cloudinary
      if (product.image) {
        const oldImage = await Image.findById(product.image);
        if (oldImage && oldImage.public_id) {
          await cloudinary.uploader.destroy(oldImage.public_id);
          await Image.deleteOne({ _id: oldImage._id }); // optional: remove record from DB
        }
      }

      // create a new image record
      image = await Image.create({ userId, hash: hashedData });
      product.image = image._id;
      await product.save();

      // upload new image to Cloudinary
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `chaitanya_app/${userId}`,
          public_id:
            file.originalname
              .split(".")[0]
              .replace(/\s+/g, "_")
              .replace(/[^a-zA-Z0-9_-]/g, "") +
            "_" +
            Date.now(),
          transformation: [
            { width: 2048, height: 2048, crop: "limit", quality: "auto:best" },
          ],
        },
        async (err, result) => {
          if (!err && result) {
            image.url = result.secure_url;
            image.public_id = result.public_id;
            await image.save();
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(stream);
      req.savedImage = { _id: image._id };
      next();
    } catch (error) {
      console.error("Image update failed:", error);
      next(error);
    }
  });
};

module.exports = { uploadImageAndExtractBase64, updateImage };
