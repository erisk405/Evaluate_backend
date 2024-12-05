const evaluate = require("../models/evaluateModel");
const evaluateDetail = require("../models/evaluateDetailModel");
const department = require("../models/departmentModel");
const superviseModel = require("../models/superviseModel");
const form = require("../models/formModel");
const user = require("../models/userModel");
const permission = require("../models/permissionModel");
const period = require("../models/periodModel");
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
const findEvaluateUserContr = async (req, res) => {
  try {
    const assessor_id = req.params.assessor_id;
    const eval_depart_id = req.params.eval_depart_id;
    const period_id = req.params.period_id;
    const founded = await evaluate.findUserEvaluate(
      assessor_id,
      eval_depart_id,
      period_id
    );

    res.status(201).json(founded);
  } catch (error) {
    console.error("Error in find:", error);
    // ส่ง error ทั่วไปสำหรับกรณีที่ไม่เจาะจง
    res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const findAllEluatedUserContr = async (req, res) => {
  try {
    const assessor_id = req.params.assessor_id;
    const period_id = req.params.period_id;
    const evaluatorOfDepart = await department.countEvaluatorOfDepartment(
      assessor_id
    );
    const report = [];

    if (evaluatorOfDepart && evaluatorOfDepart.length > 0) {
      // Use Promise.all to handle async operations
      await Promise.all(
        evaluatorOfDepart.map(async (department) => {
          try {
            const founded = await evaluate.findUserEvaluate(
              assessor_id,
              department.id,
              period_id
            );
            const supervise = await superviseModel.countSuperviseByDepartmentId(
              department.id
            );

            const data = {
              department_id: department.id,
              department_name: department.department_name,
              evaluator: department.user.length + supervise.length,
              // evaluatorData: department.user, // Use _count instead of user.length
              evaluated: founded.length,
              // evaluatedData: founded,
            };

            report.push(data);
          } catch (error) {
            console.error(
              `Error fetching department ${department.department_name}:`,
              error
            );
          }
        })
      );
    }

    res.status(200).json(report);
  } catch (error) {
    console.error("Error in find:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const getAssessorsPerFormByEvaluator = async (userId) => {
  try {
    const evaluatorPermissions = await permission.findEvaluatorPermissions(
      userId
    );
    let totalAssessors = 0;

    const formUse = await Promise.all(
      evaluatorPermissions.map(async (permission) => {
        const assessorIngroup = await user.countAssessors(
          permission.assessorRole.id,
          userId
        ); // เฉพาะ ingroup
        const assessorOutgroup = await user.countAssessorsOutgroup(
          permission.assessorRole.id,
          userId
        ); // เฉพาะ outgroup

        totalAssessors += assessorIngroup + assessorOutgroup;
        // console.log(totalAssessors);
        return permission.permissionForm.map((form) => ({
          ingroup: form.ingroup,
          formId: form.form.id,
          formName: form.form.name,
          usedPermissIngroup: assessorIngroup,
          usedPermissOutgroup: assessorOutgroup,
        }));
      })
    );

    const flattenedFormUse = formUse.flat();
    const combinedForms = Object.values(
      flattenedFormUse.reduce((acc, item) => {
        if (!acc[item.formId]) {
          acc[item.formId] = {
            formId: item.formId,
            formName: item.formName,
            totalAssesPerForm: item.ingroup
              ? item.usedPermissIngroup
              : item.usedPermissOutgroup,
            totalAssessors: totalAssessors,
          };
        } else if (item.ingroup) {
          acc[item.formId].totalAssesPerForm += item.usedPermissIngroup;
        } else {
          acc[item.formId].totalAssesPerForm += item.usedPermissOutgroup;
        }
        return acc;
      }, {})
    );
    // console.log(combinedForms);

    return combinedForms;
  } catch (error) {
    console.error("Error fetching assessors per form by evaluator:", error);
    throw error;
  }
};

const getResultEvaluate = async (req, res) => {
  try {
    const evaluator_id = req.params.evaluator_id;
    const headData = {
      evaluatorName: null,
      periodName: null,
      allAssessorEvaluated: 0,
      success: null,
    };
    const resultData = {
      evaluateScore: null,
      assessorsHasPermiss: null,
    };
    const period_id = req.params.period_id;
    let amountAssessor;
    const forms = await form.getAllform();
    // กรณีที่ไม่มีฟอร์ม
    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: "not found form" });
    }

    const AssessorsPerForm = await getAssessorsPerFormByEvaluator(evaluator_id);
    // console.log(AssessorsPerForm);
    if (AssessorsPerForm && AssessorsPerForm.length !== 0) {
      resultData.assessorsHasPermiss = AssessorsPerForm;
    }

    //ดึงผลที่ถุกประเมิน
    const result = await evaluate.getResultEvaluateById(
      evaluator_id,
      period_id
    );
    // กรณีที่ไม่มีผลการประเมิน
    if (!result || result.length === 0) {
      headData.success = {
        success: false,
        message: "ยังไม่มีการประเมิน",
      };
    } else {
      headData.evaluatorName = result[0].evaluator.name;
      headData.periodName = result[0].period.title;
      headData.allAssessorEvaluated = result.length;

      const formResults = forms.map((form) => {
        amountAssessor = 0;
        const scores = [];

        result.forEach((data) => {
          let sw = true;
          data.evaluateDetail.forEach((questions) => {
            if (form.id == questions.formQuestion.form.id) {
              if (sw) {
                sw = false;
                amountAssessor++;
              }
              scores.push(questions.score);
            }
          });
          //end loop question
        });
        //end loop result
        // คำนวณค่าเฉลี่ย
        const totalScore = scores.reduce((sum, score) => sum + score, 0);
        const average = scores.length > 0 ? totalScore / scores.length : 0;

        // คำนวณ SD
        const variance =
          scores.length > 0
            ? scores.reduce(
                (sum, score) => sum + Math.pow(score - average, 2),
                0
              ) / scores.length
            : 0;
        const sd = Math.sqrt(variance);
        return {
          formId: form.id,
          formName: form.name,
          average: average.toFixed(3),
          SD: sd.toFixed(3),
          amountAssessor: amountAssessor,
        };
      });

      if (formResults) {
        resultData.evaluateScore = formResults;
        headData.success = {
          success: true,
          message: "มีผลการประเมิน",
        };
      }
    }
    return res.status(200).json({ headData, resultData });
    //end

    // console.log(formResults);
  } catch (error) {
    console.error("Error in find:", error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const getEvaluatePerDepart = async (req, res) => {
  try {
    const departments = await department.checkEvaluationCompletion();
    const period_id = req.params.period_id;

    const periodCk = await period.getPeriodById(period_id);

    if (!periodCk) {
      return res.status(404).json({ message: "not found period" });
    }

    const departmentResults = await Promise.all(
      departments.map(async (department) => {
        const countUser = await Promise.all(
          department.user.map(async (userfind) => {
            const userId = userfind.id;
            const users = await user.findPermissionByUserId(userId, period_id);
            const totalCount = users.role.permissionsAsAssessor.reduce(
              (total, item) => {
                return total + item.evaluatorRole._count.user;
              },
              0
            );
            const countReceived = users.evaluationsReceived.length;
            let finishCk = true;
            if (totalCount == 0) {
              finishCk = false;
            } else if (countReceived < totalCount) {
              finishCk = false;
            }
            const userData = {
              id: users.id,
              name: users.name,
              finished: finishCk,
              countReceived: countReceived,
              totalCount: totalCount,
            };
            // console.log(userData);

            return {
              userData,
            };
          })
        );

        const countFinish = countUser.reduce((total, item) => {
          if (item.userData.finished) {
            total++;
          }
          return total;
        }, 0);

        return {
          id: department.id,
          image: department.image,
          department: department.department_name,
          totalUsers: countUser.length,
          totalFinished: countFinish,
          totalUnfinished: countUser.length - countFinish,
        };
      })
    );

    // console.log(departmentResults);

    return res.status(200).json(departmentResults);
  } catch (error) {
    console.error("Error in find:", error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

module.exports = {
  createEvaluate,
  findEvaluateUserContr,
  findAllEluatedUserContr,
  getResultEvaluate,
  getAssessorsPerFormByEvaluator,
  getEvaluatePerDepart,
};
