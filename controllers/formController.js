const form = require("../models/formModel");

const createForm = async (req, res) =>{
    const {name} = req.body
    try {
        const created = await form.createForm(name);
        if (!created) {
            return res.status(404).json({ message: "not create" });
        }
        res.status(201).json(created)
    } catch (error) {
        console.error({message: error});
    }
}

const getAllform = async(req,res)=>{
    try {
        const response = await form.getAllform()
        if (!response) {
            return res.status(404).json({ message: "form not found" });
        }
        res.status(201).json(response)
        
    } catch (error) {
        console.error({message: error});
    }
}
const getQuestionType = async(req,res)=>{
    try {
        const response = await form.getQuestionType()
        if (!response) {
            return res.status(404).json({ message: "type not found" });
        }
        res.status(201).json(response)
        
    } catch (error) {
        console.error({message: error});
    }
}
const createQuestionType = async(req,res)=>{
    try {
        const {type} = req.body
        const added = await form.createQuestionType(type)
        if(!added){
            return res.status(404).json({ message: "questionType not add" });
        }
        res.status(201).json(added)
    } catch (error) {
        console.error({message: error});
    }
}
const createQuestion = async(req,res)=>{
    try {
        const {formId,typeId,name} = req.body
        const added = await form.createQuestion(formId,typeId,name)
        if(!added){
            return res.status(404).json({ message: "question not add" });
        }
        res.status(201).json(added)
    } catch (error) {
        console.error({message: error});
    }
}

module.exports = {
    createForm,
    getAllform,
    createQuestionType,
    getQuestionType,
    createQuestion
}