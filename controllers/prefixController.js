const prefix = require("../models/prefixModel");

const createPrefix = async (req, res) => {
  const { prefix_name } = req.body;
  // console.log(req.body);
  try {
    const created = await prefix.createPrefix(prefix_name);
    if (!created) {
      return res.status(404).json({ message: "not create" });
    }
    res.status(201).json(created);
  } catch (error) {
    console.error({ message: error });
  }
};

const getPrefix = async (req, res) => {
  try {
    const response = await prefix.getPrefix();
    if (!response) {
      return res.status(404).json({ message: "form not found" });
    }
    res.status(201).json(response);
  } catch (error) {
    console.error({ message: error });
  }
};
const updatePrefix = async (req, res) => {
  try {
    const {prefix_id,prefix_name} = req.body;
    const updated = await prefix.updatePrefix(prefix_id,prefix_name);
    if (!updated) {
      return res.status(404).json({ message: "don't update prefix" });
    }
    res.status(201).json(updated);

  } catch (error) {
    console.error({ message: error });
  }
};
const deletePrefix = async (req, res) => {
    try {
      const prefix_id = req.params.prefix_id;
      const deleted = await prefix.deletePrefix(prefix_id);
      if (!deleted) {
        return res.status(404).json({ message: "don't delete prefix" });
      }
      res.status(201).json(deleted);
  
    } catch (error) {
      console.error({ message: error });
    }
  };

module.exports = {
  createPrefix,
  getPrefix,
  updatePrefix,
  deletePrefix
};
