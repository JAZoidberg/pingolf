const machineService = require("./machine.service");

const createMachine = async (req, res) => {
  try {
    const { name, manufacturer, year } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        error: "name is required",
      });
    }

    const machine = await machineService.createMachine({
      name,
      manufacturer,
      year,
    });

    res.status(201).json(machine);
  } catch (error) {
    console.error("Failed to create machine:", error);

    res.status(500).json({
      error: "Failed to create machine",
    });
  }
};

const getMachines = async (req, res) => {
  try {
    const machines = await machineService.getMachines();

    res.json(machines);
  } catch (error) {
    console.error("Failed to get machines:", error);

    res.status(500).json({
      error: "Failed to get machines",
    });
  }
};

const getMachineById = async (req, res) => {
  try {
    const machine = await machineService.getMachineById(
      req.params.machineId
    );

    if (!machine) {
      return res.status(404).json({
        error: "Machine not found",
      });
    }

    res.json(machine);
  } catch (error) {
    console.error("Failed to get machine:", error);

    res.status(500).json({
      error: "Failed to get machine",
    });
  }
};

module.exports = {
  createMachine,
  getMachines,
  getMachineById,
};
