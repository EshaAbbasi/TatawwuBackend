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
      fixed: "BH",
    },
    governorate: {
      type: String,
      enum: ["Capital", "Northern", "Southern", "Muharraq", "Riffa"],
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
    contactEmail: {
      type: String,
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
    },
    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Approved",
        "Rejected",
        "Removed",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },
  },
  { timestamps: true },
);

const Organization = mongoose.model("Organization", organizationSchema);
module.exports = Organization;
