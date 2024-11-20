const evaluate = require("../models/evaluateModel");
const evaluateDetail = require("../models/evaluateDetailModel");
const createEvaluate = async (req,res)=>{
    try {
        const evalData = req.body;
        const created = await evaluate.createEvaluate(evalData);
        if(!created){
            return res.status(404).json({ message: "not create" });
        }
        const createDetail = await evaluateDetail.createDetailEval(created.id,evalData.questions);
        console.log("createDetail",createDetail);
        

        res.status(201).json(created);

    } catch (error) {
        console.error({ message: error });
    }
}

module.exports ={
    createEvaluate
}