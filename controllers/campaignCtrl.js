const Campaign = require("../models/Campaign");

const create = async (req, res) => {
  try {
    if (req.user.role !== "Organizer") {
      return res
        .status(403)
        .json({ error: "Only organizers can create campaigns" });
    }

    req.body.organizationId = req.user._id;
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
  if (req.user.role !== "Organizer" && req.user.role !== "Admin") {
    return res
      .status(403)
      .json({ error: "Only organizers and admins can update campaigns" });
  }

  try {
    if (req.user.role === "Admin") {
      const { status, reviewReason } = req.body || {};

      if (!["Approved", "Rejected", "Removed"].includes(status)) {
        return res.status(400).json({ error: "Invalid review status" });
      }

      const updated = await Campaign.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status, reviewReason } },
        { new: true },
      );

      return res.status(200).json(updated);
    }

    const campaign = await Campaign.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.status(200).json(campaign);
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
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  create,
  index,
  show,
  update,
  delete: deleteCampaign,
};
