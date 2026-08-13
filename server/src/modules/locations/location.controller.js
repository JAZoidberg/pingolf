const locationService = require("./location.service");

const createLocation = async (req, res) => {
  try {
    const { name, city, state } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "name is required",
      });
    }

    const location = await locationService.createLocation({
      name,
      city,
      state,
    });

    res.status(201).json(location);
  } catch (error) {
    console.error("Failed to create location:", error);

    res.status(500).json({
      error: "Failed to create location",
    });
  }
};

const getLocations = async (req, res) => {
  try {
    const locations = await locationService.getLocations();

    res.json(locations);
  } catch (error) {
    console.error("Failed to get locations:", error);

    res.status(500).json({
      error: "Failed to get locations",
    });
  }
};

const getLocationById = async (req, res) => {
  try {
    const location = await locationService.getLocationById(
      req.params.locationId
    );

    if (!location) {
      return res.status(404).json({
        error: "Location not found",
      });
    }

    res.json(location);
  } catch (error) {
    console.error("Failed to get location:", error);

    res.status(500).json({
      error: "Failed to get location",
    });
  }
};

module.exports = {
  createLocation,
  getLocations,
  getLocationById,
};

