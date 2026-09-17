const Organization = require("../models/organization");
const Campaign = require("../models/Campaign");
const cloudinary = require("../config/cloudinary");
const setCoordinates = require("../utils/setCoordinates");

const removeLogo = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch {
    return;
  }
};

const create = async (req, res) => {
  try {
    if (req.user.role !== "Organizer") {
      return res.status(403).json({ error: "Only organizers can create an organization" });
    }
    const existingOrganization = await Organization.findOne({ ownerId: req.user._id });
    if (existingOrganization) {
      return res.status(400).json({ error: "You already have an organization" });
    }

    const organization = new Organization({
      ownerId: req.user._id,
      name: req.body.name,
      description: req.body.description,
      country: "BH",
      governorate: req.body.governorate,
      area: req.body.area,
      address: req.body.address,
      contactEmail: req.body.contactEmail,
      contactPhone: req.body.contactPhone,
      whatsappNumber: req.body.whatsappNumber,
      website: req.body.website,
      logo: req.body.logo,
      logoPublicId: req.body.logoPublicId,
      status: "Pending",
    });
    setCoordinates(organization, req.body);
    await organization.save();
    res.status(201).json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const index = async (req, res) => {
  try {
    const organizations = await Organization.find({ status: "Approved" }).sort({ name: 1 });
    res.json(organizations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const showMine = async (req, res) => {
  try {
    const organization = await Organization.findOne({ ownerId: req.user._id });
    res.json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const organization = await Organization.findOne({ _id: req.params.id, status: "Approved" });
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    res.json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const reviewList = async (req, res) => {
  try {
    const organizations = await Organization.find().sort({ updatedAt: -1 });
    res.json(organizations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    if (req.user.role !== "Organizer" || organization.ownerId.toString() !== req.user._id) {
      return res.status(403).json({ error: "You can only edit your own organization" });
    }

    const oldLogoPublicId = organization.logoPublicId;
    organization.name = req.body.name;
    organization.description = req.body.description;
    organization.governorate = req.body.governorate;
    organization.area = req.body.area;
    organization.address = req.body.address;
    setCoordinates(organization, req.body);
    organization.contactEmail = req.body.contactEmail;
    organization.contactPhone = req.body.contactPhone;
    organization.whatsappNumber = req.body.whatsappNumber;
    organization.website = req.body.website;
    if (req.body.logo !== undefined) {
      organization.logo = req.body.logo;
      organization.logoPublicId = req.body.logoPublicId || "";
    }
    organization.status = "Pending";
    organization.reviewReason = "";
    await organization.save();

    if (oldLogoPublicId && oldLogoPublicId !== organization.logoPublicId) {
      await removeLogo(oldLogoPublicId);
    }
    res.json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const review = async (req, res) => {
  try {
    const { status, reviewReason } = req.body;
    if (!["Approved", "Rejected", "Removed"].includes(status)) {
      return res.status(400).json({ error: "Choose Approved, Rejected, or Removed" });
    }
    if (status !== "Approved" && !reviewReason?.trim()) {
      return res.status(400).json({ error: "A reason is required for rejection or removal" });
    }
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    organization.status = status;
    organization.reviewReason = reviewReason || "";
    await organization.save();
    res.json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    if (req.user.role !== "Organizer" || organization.ownerId.toString() !== req.user._id) {
      return res.status(403).json({ error: "You can only delete your own organization" });
    }
    const hasCampaigns = await Campaign.exists({ organizationId: organization._id });
    if (hasCampaigns) {
      return res.status(400).json({ error: "An organization with campaigns cannot be deleted" });
    }
    await organization.deleteOne();
    await removeLogo(organization.logoPublicId);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { create, index, showMine, show, reviewList, update, review, deleteOrganization };
