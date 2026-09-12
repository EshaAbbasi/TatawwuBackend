const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "Health",
        "Education",
        "Environment",
        "Culture",
        "Community Support",
        "Food Support",
      ],
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
    address: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    startsAt: {
      type: Date,
      required: true,
    },
    endsAt: {
      type: Date,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    registeredCount: {
      type: Number,
      default: 0,
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

const Campaign = mongoose.model("Campaign", campaignSchema);

module.exports = Campaign;
