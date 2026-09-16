const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["Registered", "Cancelled"],
    default: "Registered",
  },
  attendance: {
    type: String,
    enum: ["Unmarked", "Attended", "Absent"],
    default: "Unmarked",
  },
});

const campaignSchema = new mongoose.Schema(
  {
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
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
    country: { type: String, enum: ["BH"], default: "BH" },
    governorate: {
      type: String,
      enum: ["Capital", "Northern", "Southern", "Muharraq"],
      required: true,
    },
    area: { type: String, required: true },
    venue: { type: String, required: true },
    address: { type: String, required: true },
    startsAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    coverImage: { type: String, default: "" },
    coverImagePublicId: { type: String, default: "" },
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
      default: "Draft",
    },
    reviewReason: { type: String, default: "" },
    wasPublished: { type: Boolean, default: false },
    participants: [participantSchema],
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    certificates: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true, optimisticConcurrency: true, toJSON: { virtuals: true } },
);

campaignSchema.virtual("registeredCount").get(function () {
  return this.participants.filter(
    (participant) => participant.status === "Registered",
  ).length;
});

campaignSchema.virtual("availablePlaces").get(function () {
  return this.capacity - this.registeredCount;
});

module.exports = mongoose.model("Campaign", campaignSchema);
