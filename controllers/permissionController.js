const permission = require("../models/permissionModel");

const createPermision = async (req, res) => {
  try {
    const created = await permission.createPermission(req.body);
    console.log(created);
    if (!created) {
      return res.status(404).json({ message: "don't create permission" });
    }
    res.status(201).json(created);
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
    createPermision
};
