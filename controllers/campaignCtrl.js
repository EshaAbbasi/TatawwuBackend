const Campaign = require("../models/Campaign");
const CampaignUpdate = require("../models/campaignUpdate");
const Organization = require("../models/organization");
const User = require("../models/user");
const createCertificate = require("../utils/createCertificate");
const cloudinary = require("../config/cloudinary");
const setCoordinates = require("../utils/setCoordinates");

const findOwnCampaign = async (id, user) => {
  const campaign = await Campaign.findById(id).populate("organizationId");
  if (!campaign) throw new Error("Campaign not found");
  if (
    user.role !== "Organizer" ||
    !campaign.organizationId ||
    campaign.organizationId.ownerId.toString() !== user._id
  ) {
    throw new Error("You can only manage your own campaigns");
  }
  return campaign;
};

const checkDetails = (campaign) => {
  if (campaign.startsAt <= new Date()) {
    throw new Error("Choose a start time in the future");
  }
  if (campaign.endsAt <= campaign.startsAt) {
    throw new Error("The end time must be after the start time");
  }
  if (!Number.isInteger(campaign.capacity) || campaign.capacity < 1) {
    throw new Error("Capacity must be a whole number greater than zero");
  }
  if (campaign.capacity < campaign.registeredCount) {
    throw new Error("Capacity cannot be less than the registered participants");
  }
};

const removeImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    return;
  }
};

const index = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ status: "Approved" })
      .populate("organizationId")
      .sort({ startsAt: 1 });
    const published = campaigns.filter(
      (campaign) => campaign.organizationId && campaign.organizationId.status === "Approved",
    );
    res.status(200).json(published);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("organizationId");
    if (
      !campaign ||
      campaign.status !== "Approved" ||
      !campaign.organizationId ||
      campaign.organizationId.status !== "Approved"
    ) {
      return res.status(404).json({ error: "Campaign is not available" });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const mine = async (req, res) => {
  try {
    const organization = await Organization.findOne({ ownerId: req.user._id });
    if (!organization) return res.status(200).json([]);
    const campaigns = await Campaign.find({ organizationId: organization._id })
      .populate("organizationId")
      .sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const showOwn = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    await campaign.populate("participants.volunteerId", "name username");
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const reviewList = async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate("organizationId")
      .sort({ createdAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const showReview = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("organizationId");
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    if (req.user.role !== "Organizer") {
      return res.status(403).json({ error: "Only organizers can create campaigns" });
    }
    const organization = await Organization.findOne({ ownerId: req.user._id });
    if (!organization) {
      return res.status(400).json({ error: "Create an organization before adding campaigns" });
    }
    const campaign = new Campaign({
      organizationId: organization._id,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      governorate: req.body.governorate,
      area: req.body.area,
      venue: req.body.venue,
      address: req.body.address,
      startsAt: req.body.startsAt,
      endsAt: req.body.endsAt,
      capacity: req.body.capacity,
      coverImage: req.body.coverImage,
      coverImagePublicId: req.body.coverImagePublicId,
    });
    setCoordinates(campaign, req.body);
    checkDetails(campaign);
    await campaign.save();
    await campaign.populate("organizationId");
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    if (
      !["Draft", "Pending", "Approved", "Rejected"].includes(campaign.status) ||
      campaign.startsAt <= new Date()
    ) {
      return res.status(400).json({ error: "This campaign can no longer be edited" });
    }
    const oldImageId = campaign.coverImagePublicId;
    campaign.title = req.body.title;
    campaign.description = req.body.description;
    campaign.category = req.body.category;
    campaign.governorate = req.body.governorate;
    campaign.area = req.body.area;
    campaign.venue = req.body.venue;
    campaign.address = req.body.address;
    campaign.startsAt = req.body.startsAt;
    campaign.endsAt = req.body.endsAt;
    campaign.capacity = req.body.capacity;
    setCoordinates(campaign, req.body);
    if (req.body.coverImage !== undefined) {
      campaign.coverImage = req.body.coverImage;
      campaign.coverImagePublicId = req.body.coverImagePublicId || "";
    }
    checkDetails(campaign);
    if (campaign.status === "Approved" || campaign.status === "Pending") {
      campaign.status = "Pending";
    } else {
      campaign.status = "Draft";
    }
    campaign.reviewReason = "";
    await campaign.save();
    if (oldImageId !== campaign.coverImagePublicId) await removeImage(oldImageId);
    await campaign.populate("participants.volunteerId", "name username");
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    if (campaign.wasPublished || campaign.participants.length > 0) {
      return res.status(400).json({ error: "Only unused unpublished campaigns can be deleted" });
    }
    await CampaignUpdate.deleteMany({ campaignId: campaign._id });
    await campaign.deleteOne();
    await removeImage(campaign.coverImagePublicId);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const submit = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    if (!["Draft", "Rejected"].includes(campaign.status)) {
      return res.status(400).json({ error: "Only drafts and rejected campaigns can be submitted" });
    }
    if (campaign.organizationId.status !== "Approved") {
      return res.status(400).json({ error: "Your organization must be approved first" });
    }
    checkDetails(campaign);
    campaign.status = "Pending";
    campaign.reviewReason = "";
    await campaign.save();
    await campaign.populate("participants.volunteerId", "name username");
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const cancel = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    if (
      !campaign.wasPublished ||
      ["Completed", "Cancelled", "Removed"].includes(campaign.status)
    ) {
      return res.status(400).json({ error: "Only an active published campaign can be cancelled" });
    }
    campaign.status = "Cancelled";
    await campaign.save();
    await campaign.populate("participants.volunteerId", "name username");
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const complete = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    if (campaign.status !== "Approved" || campaign.endsAt > new Date()) {
      return res.status(400).json({ error: "Complete an approved campaign after it ends" });
    }
    const unmarked = campaign.participants.some(
      (participant) => participant.status === "Registered" && participant.attendance === "Unmarked",
    );
    if (unmarked) {
      return res.status(400).json({ error: "Record attendance for every registered participant first" });
    }
    campaign.status = "Completed";
    await campaign.save();
    await campaign.populate("participants.volunteerId", "name username");
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const review = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("organizationId");
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    const status = req.body.status;
    const reason = (req.body.reviewReason || "").trim();
    if (!["Approved", "Rejected", "Removed"].includes(status)) {
      return res.status(400).json({ error: "Choose an approval, rejection, or removal" });
    }
    if (status === "Removed") {
      if (!campaign.wasPublished || campaign.status === "Removed") {
        return res.status(400).json({ error: "Only published campaigns can be removed" });
      }
    } else if (campaign.status !== "Pending") {
      return res.status(400).json({ error: "Only pending campaigns can be approved or rejected" });
    }
    if (status === "Approved") {
      if (!campaign.organizationId || campaign.organizationId.status !== "Approved") {
        return res.status(400).json({ error: "Approve the organization first" });
      }
      if (!campaign.wasPublished && campaign.startsAt <= new Date()) {
        return res.status(400).json({ error: "A new campaign must start in the future" });
      }
      campaign.wasPublished = true;
      campaign.reviewReason = "";
    } else {
      if (!reason) return res.status(400).json({ error: "Add feedback for the organizer" });
      campaign.reviewReason = reason;
    }
    campaign.status = status;
    await campaign.save();
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const activities = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ "participants.volunteerId": req.user._id })
      .populate("organizationId")
      .sort({ startsAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const favorites = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ favorites: req.user._id })
      .populate("organizationId")
      .sort({ startsAt: 1 });
    const saved = campaigns.map((campaign) => {
      if (
        campaign.status !== "Approved" ||
        !campaign.organizationId ||
        campaign.organizationId.status !== "Approved"
      ) {
        return { _id: campaign._id, unavailable: true };
      }
      return campaign;
    });
    res.status(200).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const certificates = async (req, res) => {
  try {
    const campaigns = await Campaign.find({ certificates: req.user._id })
      .populate("organizationId")
      .sort({ endsAt: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const participants = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    await campaign.populate("participants.volunteerId", "name username");
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const join = async (req, res) => {
  try {
    if (req.user.role !== "Volunteer") {
      return res.status(403).json({ error: "Only volunteers can join campaigns" });
    }
    const campaign = await Campaign.findById(req.params.id).populate("organizationId");
    if (
      !campaign ||
      campaign.status !== "Approved" ||
      !campaign.organizationId ||
      campaign.organizationId.status !== "Approved" ||
      campaign.startsAt <= new Date()
    ) {
      return res.status(400).json({ error: "This campaign is not open for registration" });
    }
    const participant = campaign.participants.find(
      (entry) => entry.volunteerId.toString() === req.user._id,
    );
    if (participant && participant.status === "Registered") {
      return res.status(400).json({ error: "You are already registered" });
    }
    if (campaign.availablePlaces <= 0) {
      return res.status(400).json({ error: "This campaign is full" });
    }
    if (participant) {
      participant.status = "Registered";
      participant.attendance = "Unmarked";
    } else {
      campaign.participants.push({ volunteerId: req.user._id });
    }
    await campaign.save();
    res.status(200).json(campaign);
  } catch (error) {
    if (error.name === "VersionError") {
      return res.status(400).json({ error: "This campaign changed. Please try joining again" });
    }
    res.status(400).json({ error: error.message });
  }
};

const leave = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("organizationId");
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    if (campaign.startsAt <= new Date()) {
      return res.status(400).json({ error: "Cancel your place before the campaign starts" });
    }
    const participant = campaign.participants.find(
      (entry) => entry.volunteerId.toString() === req.user._id,
    );
    if (!participant || participant.status !== "Registered") {
      return res.status(400).json({ error: "You are not registered for this campaign" });
    }
    participant.status = "Cancelled";
    participant.attendance = "Unmarked";
    await campaign.save();
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    if (!["Approved", "Completed"].includes(campaign.status) || campaign.endsAt > new Date()) {
      return res.status(400).json({ error: "Record attendance after the campaign ends" });
    }
    if (!["Attended", "Absent"].includes(req.body.attendance)) {
      return res.status(400).json({ error: "Choose Attended or Absent" });
    }
    const participant = campaign.participants.find(
      (entry) => entry.volunteerId.toString() === req.params.volunteerId,
    );
    if (!participant || participant.status !== "Registered") {
      return res.status(404).json({ error: "Registered participant not found" });
    }
    if (campaign.certificates.some((id) => id.toString() === req.params.volunteerId)) {
      return res.status(400).json({ error: "Remove the certificate before changing this attendance" });
    }
    participant.attendance = req.body.attendance;
    await campaign.save();
    await campaign.populate("participants.volunteerId", "name username");
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const favorite = async (req, res) => {
  try {
    if (req.user.role !== "Volunteer") {
      return res.status(403).json({ error: "Only volunteers can save favorites" });
    }
    const campaign = await Campaign.findById(req.params.id).populate("organizationId");
    if (
      !campaign ||
      campaign.status !== "Approved" ||
      !campaign.organizationId ||
      campaign.organizationId.status !== "Approved"
    ) {
      return res.status(404).json({ error: "Campaign is not available" });
    }
    campaign.favorites.addToSet(req.user._id);
    await campaign.save();
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const unfavorite = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("organizationId");
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });
    campaign.favorites.pull(req.user._id);
    await campaign.save();
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const grantCertificate = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    const participant = campaign.participants.find(
      (entry) => entry.volunteerId.toString() === req.params.volunteerId,
    );
    if (
      campaign.status !== "Completed" ||
      !participant ||
      participant.status !== "Registered" ||
      participant.attendance !== "Attended"
    ) {
      return res.status(400).json({ error: "Certificates are for attendees of completed campaigns" });
    }
    campaign.certificates.addToSet(req.params.volunteerId);
    await campaign.save();
    await campaign.populate("participants.volunteerId", "name username");
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const removeCertificate = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    campaign.certificates.pull(req.params.volunteerId);
    await campaign.save();
    await campaign.populate("participants.volunteerId", "name username");
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const certificate = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("organizationId");
    if (
      !campaign ||
      !campaign.certificates.some((id) => id.toString() === req.user._id)
    ) {
      return res.status(404).json({ error: "Certificate not found" });
    }
    const volunteer = await User.findById(req.user._id);
    if (!volunteer) return res.status(404).json({ error: "Volunteer not found" });
    const document = createCertificate({
      recipientName: volunteer.name || volunteer.username,
      campaignTitle: campaign.title,
      organizationName: campaign.organizationId ? campaign.organizationId.name : "",
      endsAt: campaign.endsAt,
    });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="certificate-${campaign._id}.pdf"`);
    document.pipe(res);
    document.end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  index,
  show,
  mine,
  showOwn,
  reviewList,
  showReview,
  create,
  update,
  delete: deleteCampaign,
  submit,
  cancel,
  complete,
  review,
  activities,
  favorites,
  certificates,
  participants,
  join,
  leave,
  markAttendance,
  favorite,
  unfavorite,
  grantCertificate,
  removeCertificate,
  certificate,
};
