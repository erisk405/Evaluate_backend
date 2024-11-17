const form = require("../models/formModel");
const question = require("../models/questionModel");

const createForm = async (req, res) => {
  const { name } = req.body;
  try {
    const created = await form.createForm(name);
    if (!created) {
      return res.status(404).json({ message: "not create" });
    }
    res.status(201).json(created);
  } catch (error) {
    console.error({ message: error });
  }
};

const updateForm = async (req, res) => {
  const { id, name } = req.body.data;
  console.log("req.body", req.body);

  try {
    const update = await form.updateFormById(id, name);
    if (!update) {
      return res.status(404).json({ message: "not update" });
    }
    res.status(201).json(update);
  } catch (error) {
    console.error({ message: error });
  }
};
const deleteForm = async (req, res) => {
  const { id } = req.body;
  try {
    const response = await form.deleteFormById(id);
    if (!response) {
      return res.status(404).json({ message: "not delete" });
    }
    res.status(201).json(response);
  } catch (error) {
    console.error({ message: error });
  }
};

const getAllform = async (req, res) => {
  try {
    const response = await form.getAllform();
    if (!response) {
      return res.status(404).json({ message: "form not found" });
    }
    res.status(201).json(response);
  } catch (error) {
    console.error({ message: error });
  }
};

const createQuestion = async (req, res) => {
  try {
    const { formId, content } = req.body;
    const added = await question.createQuestion(content, formId);
    if (!added) {
      return res.status(404).json({ message: "question not add" });
    }
    res.status(201).json(added);
  } catch (error) {
    console.error({ message: error });
  }
};
const updateQuestion = async (req, res) => {
  try {
    const { questionId, content } = req.body;
    console.log("req.body",req.body);
    
    const updated = await question.updateQuestion(content, questionId);
    if (!updated) {
      return res.status(404).json({ message: "question not update" });
    }
    res.status(201).json({datail:updated});
  } catch (error) {
    console.error({ message: error });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const questionToDelete = req.body;

    // console.log("questionToDelete", questionToDelete);
    // เอามาแค่ question ID 
    const questionIds = questionToDelete.map((question) => question.id);

    console.log("questionIds", questionIds);
    const deleted = await question.deleteQuestions(questionIds);
    if (!deleted) {
      return res.status(404).json({ message: "Failed to delete questions" });
    }
    res.status(200).json({
      message: "Questions deleted successfully",
      count: deleted.count,
    });
  } catch (error) {
    console.error("Error deleting questions:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
const getQuestions = async (req, res) => {
  try {
    const formId = req.params.formId;
    console.log("formId", formId);

    const questions = await question.getQuestions(formId);
    if (!questions) {
      return res.status(404).json({ message: "don't get questions" });
    }
    res.status(201).json(questions);
  } catch (error) {
    console.error({ message: error });
  }
};

module.exports = {
  createForm,
  getAllform,
  createQuestion,
  updateForm,
  deleteForm,
  updateQuestion,
  deleteQuestion,
  getQuestions,
};
