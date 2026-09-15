const mongoose = require("mongoose");
const Orgnaization = require("../models/organization");

const create = async (req, res) => {
  try {
    if (req.user.role !== "Organizer") {
      return res.status(403).json({ error: "Only own organizer can create" });
    }
    req.body.ownerId = req.user._id;
    const organization = await Orgnaization.create(req.body);
    res.status(201).json(organization);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

const index = async (req, res) => {
  try {
    const organizations = await Orgnaization.find();
    res.status(200).json(organizations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const showMine = async (req, res) => {
  try {
    const organization = await Orgnaization.findOne({ ownerId: req.user._id });
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    res.status(200).json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const show = async (req, res) => {
  try {
    const organization = await Orgnaization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }
    res.status(200).json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  if (req.user.role !== "Organizer" && req.user.role !== "Admin") {
    return res
      .status(403)
      .json({ error: "Only organizers or admins can update" });
  }

  try {
    if (req.user.role === "Admin") {
      const { status, reviewReason } = req.body || {};

      if (!["Approved", "Rejected", "Removed"].includes(status)) {
        return res.status(400).json({ error: "Invalid review status" });
      }

      const updated = await Orgnaization.findOneAndUpdate(
        { _id: req.params.id },
        { $set: { status, reviewReason } },
        { new: true },
      );

      return res.status(200).json(updated);
    }

    const organization = await Orgnaization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (organization.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only update your own organization" });
    }

    const updated = await Orgnaization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    if (req.user.role !== "Organizer") {
      return res.status(403).json({ error: "Only organizers can delete" });
    }

    const organization = await Orgnaization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (organization.ownerId.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "You can only delete your own organization" });
    }

    await Orgnaization.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  create,
  index,
  showMine,
  show,
  update,
  delete: deleteOrganization,
};
