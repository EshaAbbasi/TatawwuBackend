const Organization = require("../models/organization");
const Campaign = require("../models/Campaign");

const getOwnOrganization = (userId) =>
  Organization.findOne({ ownerId: userId });

const create = async (req, res) => {
  try {
    if (req.user.role !== "Organizer") {
      return res
        .status(403)
        .json({ error: "Only organizers can create campaigns" });
    }

    const organization = await getOwnOrganization(req.user._id);
    if (!organization) {
      return res
        .status(400)
        .json({ error: "Create an organization before adding campaigns" });
    }

    req.body.organizationId = organization._id;
    const campaign = await Campaign.create(req.body);
    res.status(201).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const index = async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const mine = async (req, res) => {
  try {
    const organization = await getOwnOrganization(req.user._id);
    if (!organization) {
      return res.status(200).json([]);
    }
    const campaigns = await Campaign.find({ organizationId: organization._id });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.status(200).json(campaign);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    if (req.user.role !== "Organizer") {
      return res
        .status(403)
        .json({ error: "Only organizers can update campaigns" });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const organization = await getOwnOrganization(req.user._id);
    if (
      !organization ||
      campaign.organizationId.toString() !== organization._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You can only update your own campaigns" });
    }

    const updated = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteCampaign = async (req, res) => {
  try {
    if (req.user.role !== "Organizer") {
      return res
        .status(403)
        .json({ error: "Only organizers can delete campaigns" });
    }

    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    const organization = await getOwnOrganization(req.user._id);
    if (
      !organization ||
      campaign.organizationId.toString() !== organization._id.toString()
    ) {
      return res
        .status(403)
        .json({ error: "You can only delete your own campaigns" });
    }

    await Campaign.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  create,
  index,
  mine,
  show,
  update,
  delete: deleteCampaign,
};
