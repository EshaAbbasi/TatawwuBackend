const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["Issued", "Processing"],
      default: "Processing",
    },
    issuedDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

const Certificate = mongoose.model("Certificate", certificateSchema);

module.exports = Certificate;
