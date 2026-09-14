const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema(
  {
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    CampaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },

    status: {
      type: String,
      enum: ["Pending", "Registered", "Cancelled"],
      default: "Pending",
    },

    attendance: {
      type: String,
      enum: ["Unmarked", "Attended", "Absent"],
      default: "Unmarked",
    },
  },
  {
    timestamps: true,
  },
);

const Registration = mongoose.model("Registration", registrationSchema);
module.exports = Registration;
