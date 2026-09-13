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
  try {
    if (req.user.role !== "Organizer") {
      return res.status(403).json({ error: "Only organizers can update" });
    }
    const organization = await Orgnaization.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );
    if (!organization) {
      return res.status(404).json({ error: "Organization  not found" });
    }
    res.status(200).json(organization);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteOrganization = async (req, res) => {
  try {
    if (req.user.role !== "Organizer") {
      return res.status(403).json({ error: "Only own organizers can delete " });
    }
    const organization = await Orgnaization.findByIdAndDelete(req.params.id);
    if (!organization) {
      return res.status(404).json({ error: "Organization not found" });
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
  delete: deleteOrganization,
};
