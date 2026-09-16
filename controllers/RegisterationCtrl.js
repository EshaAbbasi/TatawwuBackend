const Registration = require("../models/Registeration");
const Campaign = require("../models/Campaign");

const index = async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }
    res.status(200).json(registration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const byCampaign = async (req, res) => {
  try {
    const registrations = await Registration.find({
      CampaignId: req.params.campaignId,
    }).populate("volunteerId", "name email");
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.body.CampaignId);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    if (campaign.registeredCount >= campaign.capacity) {
      return res.status(400).json({ error: "This campaign is full" });
    }

    const registration = await Registration.create(req.body);

    campaign.registeredCount += 1;
    await campaign.save();

    res.status(201).json(registration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const update = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }
    res.status(200).json(registration);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRegistration = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndDelete(req.params.id);
    if (!registration) {
      return res.status(404).json({ error: "Registration not found" });
    }

    const campaign = await Campaign.findById(registration.CampaignId);
    if (campaign && campaign.registeredCount > 0) {
      campaign.registeredCount -= 1;
      await campaign.save();
    }

    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  index,
  show,
  byCampaign,
  create,
  update,
  delete: deleteRegistration,
};