const period = require("../models/periodModel");

const createPeriod = async (req, res) => {
    try {
      const data = req.body;
  
      // แปลง ISO datetime string เป็น Date object และ validate
      const startDate = period.validateDateTime(data.start);
      const endDate = period.validateDateTime(data.end);
    
      // ตรวจสอบว่า start datetime ต้องมาก่อน end datetime
      if (startDate >= endDate) {
        return res.status(400).json({
          success: false,
          message: "Start datetime must be before end datetime"
        });
      }
  
      // ตรวจสอบช่วงเวลาที่ซ้ำกัน
      const overlappingPeriod = await period.checkPeriodOverlap(startDate, endDate);
  
      if (overlappingPeriod) {
        const overlappingTitle = overlappingPeriod.title;
        return res.status(400).json({
          success: false,
          message: `Period overlaps with existing period: ${overlappingTitle}`
        });
      }
  
      // สร้าง period ใหม่
      const created = await period.createPeriod(data);
      
      if (!created) {
        return res.status(500).json({
          success: false,
          message: "Failed to create period"
        });
      }
  
      return res.status(201).json({
        success: true,
        message: "Period created successfully",
        data: created
      });
  
    } catch (error) {
      // จัดการ validation errors
      if (error.message.includes("Invalid datetime format")) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
  
      // จัดการ Prisma errors
      if (error.code) {
        return res.status(500).json({
          success: false,
          message: "Database error",
          error: error.message
        });
      }
  
      // จัดการ unexpected errors
      console.error("Error creating period:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message
      });
    }
  };

const updatePeriod = async (req, res) => {
  try {
    const data = req.body;
    // console.log("data",data);
    const updated = await period.updatePeriod(data);
    if (!updated) {
      return res.status(404).json({ message: "don't update period" });
    }
    res.status(201).json(updated);
  } catch (error) {
    console.error({ message: error });
  }
};
const getAllPeriods = async (req, res) => {
  try {
    const periods = await period.getPeriods();
    if (!periods) {
      return res.status(404).json({ message: "don't get period" });
    }
    res.status(201).json(periods);
  } catch (error) {
    console.error({ message: error });
  }
};
const getPeriodById = async (req, res) => {
  try {
    const period_id = req.params.period_id;
    const findPeriod = await period.getPeriodById(period_id);
    if (!findPeriod) {
      return res.status(404).json({ message: "don't get period" });
    }
    res.status(201).json(findPeriod);
  } catch (error) {
    console.error({ message: error });
  }
};
const deletePeriod = async (req, res) => {
  try {
    const period_id = req.params.period_id;
    const deleted = await period.deletePeriod(period_id);
    if (!deleted) {
      return res.status(404).json({ message: "don't delete period" });
    }
    res.status(201).json(deleted);
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createPeriod,
  updatePeriod,
  getAllPeriods,
  getPeriodById,
  deletePeriod,
};
