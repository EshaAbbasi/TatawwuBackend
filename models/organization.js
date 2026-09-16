const mongoose = require("mongoose");
const organizationSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      enum: ["BH"],
      default: "BH",
    },
    governorate: {
      type: String,
      enum: ["Capital", "Northern", "Southern", "Muharraq"],
      required: true,
    },
    area: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    latitude: { type: Number, min: -90, max: 90, default: null },
    longitude: { type: Number, min: -180, max: 180, default: null },
    contactEmail: {
      type: String,
      required: true,
    },
    contactPhone: {
      type: String,
    },
    whatsappNumber: {
      type: String,
    },
    website: {
      type: String,
    },
    logo: {
      type: String,
      default: "",
    },
    logoPublicId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Removed"],
      default: "Pending",
    },
    reviewReason: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Organization = mongoose.model("Organization", organizationSchema);
module.exports = Organization;
