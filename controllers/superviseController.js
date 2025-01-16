// import { Request, Response } from "express";
const supervise = require("../models/superviseModel");

const createSuperviseCon = async (req, res) => {
  try {
    const {userId,departmentId} = req.body;
    const created = await supervise.createSupervise(userId,departmentId);
    return res.status(201).json({
      message:"createSupervise Success",
      data:created
    });

  } catch (error) {
    console.error({ message: error });
    return res.status(501).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};
const updateSuperviseCon = async (req, res) => {
  try {
    const {superviseId,userId,departmentId} = req.body;
    const updated = await supervise.updateSupervise(superviseId,userId,departmentId);
    return res.status(201).json({
      message:"updateSupervise Success",
      data:updated
    });

  } catch (error) {
    console.error({ message: error });
    return res.status(501).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

const deleteSuperviseCon = async (req, res) => {
  try {
    const superviseId = req.params.superviseId;
    const deleted = await supervise.deleteSupervise(superviseId);
    return res.status(201).json({
      message:"delete Supervise Success",
      data:deleted
    });

  } catch (error) {
    console.error({ message: error });
    return res.status(501).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

const getSuperviseByUserIdCon = async (req, res) => {
  try {
    const userId = req.params.userId;
    const supervises = await supervise.getSuperviseByUserId(userId);
    return res.status(201).json({
      message:"Success",
      data:supervises
    });

  } catch (error) {
    console.error({ message: error });
    return res.status(501).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};
const getSupervisesCon = async (req, res) => {
  try {
    const supervises = await supervise.getSupervises();
    // console.log("supervises",supervises);
    
    return res.status(200).json({
      message:"Success",
      data:supervises
    });

  } catch (error) {
    console.error({ message: error });
    return res.status(501).json({
      success: false,
      message: "Database error",
      error: error.message,
    });
  }
};

module.exports = {
    createSuperviseCon,
    updateSuperviseCon,
    deleteSuperviseCon,
    getSuperviseByUserIdCon,
    getSupervisesCon
};
