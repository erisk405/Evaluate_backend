const form = require("../models/formModel");
const question = require("../models/questionModel");

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

const updateForm = async (req,res) =>{
    const {id,name} = req.body.data
    console.log("req.body",req.body);
    
    try {
        const update = await form.updateFormById(id,name);
        if (!update) {
            return res.status(404).json({ message: "not update" });
        }
        res.status(201).json(update)
    } catch (error) {
        console.error({message: error});
    }
}
const deleteForm = async (req,res) =>{
    const {id} = req.body
    try {
        const response = await form.deleteFormById(id);
        if (!response) {
            return res.status(404).json({ message: "not delete" });
        }
        res.status(201).json(response)
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

const createQuestion = async(req,res)=>{
    try {
        const {formId,content} = req.body
        const added = await question.createQuestion(content,formId);
        if(!added){
            return res.status(404).json({ message: "question not add" });
        }
        res.status(201).json(added)
    } catch (error) {
        console.error({message: error});
    }
}
const updateQuestion = async(req,res)=>{
    try {
        const {questionId,content} = req.body
        const added = await question.updateQuestion(content,questionId);
        if(!added){
            return res.status(404).json({ message: "question not update" });
        }
        res.status(201).json(added)
    } catch (error) {
        console.error({message: error});
    }
}

const deleteQuestion = async(req,res)=>{
    try {
        const id = req.params.questionId
        console.log("id",id);
        
        const deleted = await question.deleteQuestion(id);
        if(!deleted){
            return res.status(404).json({ message: "question not delete" });
        }
        res.status(201).json(deleted)
    } catch (error) {
        console.error({message: error});
    }
}

module.exports = {
    createForm,
    getAllform,
    createQuestion,
    updateForm,
    deleteForm,
    updateQuestion,
    deleteQuestion
}