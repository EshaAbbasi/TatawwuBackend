const Campaign = require("../models/Campaign");
const CampaignUpdate = require("../models/campaignUpdate");

const findOwnCampaign = async (id, user) => {
  const campaign = await Campaign.findById(id).populate("organizationId");
  if (!campaign) {
    const error = new Error("Campaign not found");
    error.status = 404;
    throw error;
  }
  if (
    user.role !== "Organizer" ||
    !campaign.organizationId ||
    campaign.organizationId.ownerId.toString() !== user._id
  ) {
    const error = new Error("You can only manage your own campaigns");
    error.status = 403;
    throw error;
  }
  return campaign;
};

const index = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate("organizationId");
    if (
      !campaign || campaign.status !== "Approved" ||
      !campaign.organizationId || campaign.organizationId.status !== "Approved"
    ) {
      return res.status(404).json({ error: "Campaign is not available" });
    }
    const updates = await CampaignUpdate.find({ campaignId: campaign._id }).sort({ createdAt: -1, _id: -1 });
    res.json(updates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const mine = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    const updates = await CampaignUpdate.find({ campaignId: campaign._id }).sort({ createdAt: -1, _id: -1 });
    res.json(updates);
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const campaign = await findOwnCampaign(req.params.id, req.user);
    if (typeof req.body.text !== "string" || !req.body.text.trim()) {
      return res.status(400).json({ error: "Write a campaign update" });
    }
    const update = await CampaignUpdate.create({
      campaignId: campaign._id,
      authorId: req.user._id,
      text: req.body.text,
    });
    res.status(201).json(update);
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    await findOwnCampaign(req.params.id, req.user);
    const campaignUpdate = await CampaignUpdate.findOne({
      _id: req.params.updateId,
      campaignId: req.params.id,
      authorId: req.user._id,
    });
    if (!campaignUpdate) {
      return res.status(404).json({ error: "Campaign update not found" });
    }
    if (typeof req.body.text !== "string" || !req.body.text.trim()) {
      return res.status(400).json({ error: "Write a campaign update" });
    }
    campaignUpdate.text = req.body.text;
    await campaignUpdate.save();
    res.json(campaignUpdate);
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  try {
    await findOwnCampaign(req.params.id, req.user);
    const campaignUpdate = await CampaignUpdate.findOne({
      _id: req.params.updateId,
      campaignId: req.params.id,
      authorId: req.user._id,
    });
    if (!campaignUpdate) {
      return res.status(404).json({ error: "Campaign update not found" });
    }
    await campaignUpdate.deleteOne();
    res.status(204).end();
  } catch (error) {
    res.status(error.status || 400).json({ error: error.message });
  }
};

module.exports = { index, mine, create, update, remove };
