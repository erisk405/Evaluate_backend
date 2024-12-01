const evaluate = require("../models/evaluateModel");
const evaluateDetail = require("../models/evaluateDetailModel");
const department = require("../models/departmentModel");
const superviseModel = require("../models/superviseModel");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const createEvaluate = async (req, res) => {
  try {
    const evalData = req.body;
    //Transaction ($transaction):
    // Prisma มีเมธอด $transaction สำหรับรวมหลายคำสั่ง SQL ให้อยู่ใน transaction เดียวกัน
    // หากคำสั่งใดล้มเหลว (throw error) ระบบจะทำการ rollback ทุกคำสั่งที่อยู่ใน transaction นั้น
    // ใช้ transaction เพื่อรวม createEvaluate และ createDetailEval

    // และ จากนั้น ก็ใช้ ใช้ try-catch เพื่อจัดการข้อผิดพลาด เช่น การ validate รูปแบบของ evalData.questions
    // หากเกิดข้อผิดพลาด ระบบจะ rollback และส่ง response พร้อมข้อความแสดงข้อผิดพลาด
    // console.log("evalData", evalData);

    const result = await prisma.$transaction(async (tx) => {
      // เรียกใช้ฟังก์ชันใน Model พร้อมส่ง transaction object
      const created = await evaluate.createEvaluate(evalData, tx);
      if (!created) throw new Error("Failed to create evaluate");
      console.log("created", created.id);

      const createDetail = await evaluateDetail.createDetailEval(
        created.id,
        evalData.questions,
        tx
      );
      if (!createDetail) throw new Error("Failed to create evaluate details");

      return created;
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("Error in createEvaluate:", error);

    // ตรวจสอบและแยกข้อผิดพลาดเพื่อส่งข้อความ
    if (error.message === "Failed to create evaluate") {
      return res.status(400).json({
        message: "ไม่สามารถสร้างการประเมินได้",
        error: error.message,
      });
    }
    if (error.message === "Failed to create evaluate details") {
      return res.status(400).json({
        message: "ไม่สามารถสร้างรายละเอียดการประเมินได้",
        error: error.message,
      });
    }
    // ส่ง error ทั่วไปสำหรับกรณีที่ไม่เจาะจง
    res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};
const findEvaluateUserContr = async (req,res)=>{
  try {
    const {assessor_id,eval_depart_id,period_id} = req.body;
    const founded = await evaluate.findUserEvaluate(assessor_id,eval_depart_id,period_id);

    res.status(201).json(founded);
  } catch (error) {
    console.error("Error in find:", error);
    // ส่ง error ทั่วไปสำหรับกรณีที่ไม่เจาะจง
    res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
}

const findAllEluatedUserContr = async (req, res) => {
  try {
    const { assessor_id, period_id } = req.body;
    const evaluatorOfDepart = await department.countEvaluatorOfDepartment(assessor_id);
    const report = [];

    if (evaluatorOfDepart && evaluatorOfDepart.length > 0) {
      // Use Promise.all to handle async operations
      await Promise.all(evaluatorOfDepart.map(async (department) => {
        try { 
          const founded = await evaluate.findUserEvaluate(assessor_id,department.id,period_id);
          const supervise = await superviseModel.countSuperviseByDepartmentId(department.id);
         
          
          const data = {
            department_id: department.id,
            department_name: department.department_name,
            evaluator: department.user.length+supervise.length,
            evaluatorData: department.user, // Use _count instead of user.length
            evaluated:founded.length,
            evaluatedData:founded

          }
          
          report.push(data);
          
        } catch (error) {
          console.error(`Error fetching department ${department.department_name}:`, error);
        }
      }));
    }
    
    res.status(201).json(report);
    
  } catch (error) {
    console.error("Error in find:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
}
module.exports = {
  createEvaluate,
  findEvaluateUserContr,
  findAllEluatedUserContr
};
