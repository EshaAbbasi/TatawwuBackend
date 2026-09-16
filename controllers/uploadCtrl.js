const cloudinary = require("../config/cloudinary");

const upload = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Choose an image to upload" });
  }

  try {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "tatawwu", resource_type: "image" },
      (error, result) => {
        if (error) {
          return res.status(400).json({ error: error.message });
        }
        res.status(201).json({ url: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(req.file.buffer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { upload };
