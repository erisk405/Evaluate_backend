const period = require("../models/periodModel");

const createPeriod = async (req, res) =>{
    
    try {
        const data = req.body
        // console.log("data",data);
        const created = await period.createPeriod(data)
        if (!created) {
            return res.status(404).json({ message: "not create period" });
        }
        res.status(201).json(created)
    } catch (error) {
        console.error({message: error});
    }
}

const updatePeriod = async(req,res)=>{
    try {
        const data = req.body
        // console.log("data",data);
        const updated = await period.updatePeriod(data)
        if (!updated) {
            return res.status(404).json({ message: "don't update period" });
        }
        res.status(201).json(updated)
    } catch (error) {
        console.error({message: error});
    }
}
const getAllPeriods = async(req,res)=>{
    try {
        const periods = await period.getPeriods();
        if (!periods) {
            return res.status(404).json({ message: "don't get period" });
        }
        res.status(201).json(periods)
    } catch (error) {
        console.error({message: error});
    }
}
const getPeriodById = async(req,res)=>{
    try {
        const period_id = req.params.period_id;
        const findPeriod = await period.getPeriodById(period_id);
        if (!findPeriod) {
            return res.status(404).json({ message: "don't get period" });
        }
        res.status(201).json(findPeriod)
    } catch (error) {
        console.error({message: error});
    }
}
const deletePeriod = async(req,res)=>{
    try {
        const period_id = req.params.period_id;
        const deleted = await period.deletePeriod(period_id);
        if (!deleted) {
            return res.status(404).json({ message: "don't delete period" });
        }
        res.status(201).json(deleted)
    } catch (error) {
        console.error({message: error});
    }
}

module.exports = {
    createPeriod,
    updatePeriod,
    getAllPeriods,
    getPeriodById,
    deletePeriod
};