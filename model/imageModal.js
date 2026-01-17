const mongoose = require("mongoose");

const imageSchema = mongoose.Schema(
  {
    url: {
      type: String,
      default: null,
    },
    public_id: {
      type: String,
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    hash: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Image", imageSchema);
