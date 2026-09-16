const setCoordinates = (document, data) => {
  if (data.latitude === undefined && data.longitude === undefined) return;

  if (data.latitude === null && data.longitude === null) {
    document.latitude = null;
    document.longitude = null;
    return;
  }

  if (
    !Number.isFinite(data.latitude) ||
    !Number.isFinite(data.longitude) ||
    data.latitude < -90 || data.latitude > 90 ||
    data.longitude < -180 || data.longitude > 180
  ) {
    throw new Error("Choose a valid map location with both latitude and longitude");
  }

  document.latitude = data.latitude;
  document.longitude = data.longitude;
};

module.exports = setCoordinates;
