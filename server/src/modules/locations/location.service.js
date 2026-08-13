const Location = require("./location.model");

const createLocation = async (locationData) => {
  return await Location.create(locationData);
};

const getLocations = async () => {
  return await Location.find().sort({ name: 1 });
};

const getLocationById = async (locationId) => {
  return await Location.findById(locationId);
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
};
