const Machine = require("./machine.model");

const createMachine = async (machineData) => {
  return await Machine.create(machineData);
};

const getMachines = async () => {
  return await Machine.find().sort({ name: 1 });
};

const getMachineById = async (machineId) => {
  return await Machine.findById(machineId);
};

module.exports = {
  createMachine,
  getMachines,
  getMachineById,
};
