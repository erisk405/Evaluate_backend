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
    // console.log(evaluatorOfDepart);

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
              assessor_id,
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
    const period_id = req.params.period_id;
    const headData = {
      totalEvaluated: 0,
      totalAssessorsHasPermiss: 0,
      totalAVG: 0,
      totalSD: 0,
    };

    // ดึงข้อมูลฟอร์มทั้งหมด
    const forms = await form.getAllform();
    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: "not found form" });
    }

    // สร้างแผนที่ของ AssessorsPerForm เพื่อการค้นหาที่รวดเร็ว
    const AssessorsPerForm = await getAssessorsPerFormByEvaluator(evaluator_id);
    // console.log(AssessorsPerForm);

    const assessorsMap = new Map(
      AssessorsPerForm?.map((item) => [item.formId, item.totalAssesPerForm])
    );
    // console.log(assessorsMap);
    headData.totalAssessorsHasPermiss =
      AssessorsPerForm.length > 0 ? AssessorsPerForm[0].totalAssessors : 0;

    // ดึงผลการประเมิน
    const result = await evaluate.getResultEvaluateById(
      evaluator_id,
      period_id
    );

    if (!result || result.length === 0) {
      headData.success = {
        success: false,
        message: "ยังไม่มีการประเมิน",
      };
    } else {
      headData.totalEvaluated = result.length;
      headData.success = true;
      headData.evaluatorName = result[0].evaluator.name;
      headData.periodName = result[0].period.title;
    }

    const formResults = await Promise.all(
      forms.map(async (form) => {
        const dataAVG = [];
        const dataSD = [];

        // รวบรวม Promise ทั้งหมดใน questions
        const amountOFAssessorsPromises = form.questions.map((question) =>
          evaluateDetail
            .getScoreByQuestion(evaluator_id, question.id, period_id)
            .then((detail) => {
              const totalScore = detail.reduce(
                (sum, item) => sum + item.score,
                0
              );
              const average =
                detail.length > 0 ? totalScore / detail.length : 0;
              const variance =
                detail.length > 0
                  ? detail.reduce(
                      (sum, item) => sum + Math.pow(item.score - average, 2),
                      0
                    ) / detail.length
                  : 0;
              const sd = Math.sqrt(variance);

              dataAVG.push(average);
              dataSD.push(sd);

              return detail.length; // จำนวนคนที่ประเมินในคำถามนี้
            })
        );

        // รอให้ Promise ทั้งหมดเสร็จสิ้นและรวมจำนวนประเมิน
        const amountOFAssessors = await Promise.all(amountOFAssessorsPromises);

        const totalAvgPerForm =
          dataAVG.length > 0
            ? dataAVG.reduce((sum, item) => sum + item, 0) / dataAVG.length
            : 0;
        const totalSDPerForm =
          dataSD.length > 0
            ? dataSD.reduce((sum, item) => sum + item, 0) / dataSD.length
            : 0;

        return {
          formId: form.id,
          formName: form.name,
          totalAVGPerForm: totalAvgPerForm,
          totalSDPerForm: totalSDPerForm,
          totalAsserPerForm: assessorsMap.get(form.id) || 0,
          evaluatedPerForm: amountOFAssessors[0],
        };
      })
    );

    // ดึงค่า AVG , SD เฉลี่ยแต่ละด้านมาบวกกัน
    const totalStats =
      formResults && formResults.length > 0
        ? formResults.reduce(
            (stats, data) => {
              const avg = data.totalAVGPerForm || 0;
              const sd = data.totalSDPerForm || 0;
              return {
                sumAvg: stats.sumAvg + avg,
                sumSD: stats.sumSD + sd,
              };
            },
            { sumAvg: 0, sumSD: 0 } // ค่าเริ่มต้น
          )
        : { sumAvg: 0, sumSD: 0 };

    const average =
      formResults && formResults.length > 0
        ? totalStats.sumAvg / formResults.length
        : 0;

    const sd =
      formResults && formResults.length > 0
        ? totalStats.sumSD / formResults.length
        : 0;
    headData.totalAVG = average;
    headData.totalSD = sd;

    return res.status(200).json({ headData, formResults });
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
        console.log(department.supervise);

        return {
          id: department.id,
          image: department.image,
          department: department.department_name,
          supervise: department.supervise,
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

const calculateStatistics = (scores) => {
  if (!scores.length) return { average: 0, sd: 0 };

  const sum = scores.reduce((a, b) => a + b, 0);
  const average = sum / scores.length;

  const variance =
    scores.reduce((a, b) => a + Math.pow(b - average, 2), 0) / scores.length;
  const sd = Math.sqrt(variance);

  return { average, sd };
};

const getScoreForDepartment = async (
  userId,
  questionId,
  periodId,
  departId
) => {
  const details = await evaluateDetail.getScoreByQuestionForDepartment(
    userId,
    questionId,
    periodId,
    departId
  );
  const departmentName = await department.getDepartmentNameById(departId);
  const scores = details.map((item) => item.score);
  const { average, sd } = calculateStatistics(scores);
  return {
    type: departmentName.department_name,
    average: average,
    sd: sd,
  };
};

const getResultEvaluateDetail = async (req, res) => {
  try {
    const userId = req.params.userId;
    const periodId = req.params.periodId;
    const evaluateData = await evaluate.getResultEvaluateById(userId, periodId);

    if (!evaluateData || evaluateData.length === 0) {
      return res.status(404).json({
        message: "error not found evaluate for this evaluator",
      });
    }
    const departmentId = evaluateData[0].evaluator.department.id;
    const departmentName = evaluateData[0].evaluator.department.department_name;
    let supervise = [];

    const headData = {
      evaluatorName: evaluateData[0].evaluator.name,
      periodName: evaluateData[0].period.title,
      roleName: evaluateData[0].evaluator.role.role_name,
      roleLevel: evaluateData[0].evaluator.role.role_level,
      department: departmentName,
      totalAvg: 0,
      totalSD: 0,
      success: {
        success: true,
        message: "มีผลการประเมิน",
      },
    };
    if (headData.roleLevel === "LEVEL_3") {
      supervise = await superviseModel.getSuperviseByUserId(userId);
      // console.log("supervise",supervise);
    }

    const forms = await form.getAllform();
    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: "not found form" });
    }

    const allScores = [];
    const formResults = await Promise.all(
      forms.map(async (form) => {
        const questions = await Promise.all(
          form.questions.map(async (question) => {
            const score = [];
            if (
              headData.roleLevel === "LEVEL_1" ||
              headData.roleLevel === "LEVEL_4"
            ) {
              const details = await evaluateDetail.getScoreByQuestion(
                userId,
                question.id,
                periodId
              );
              // console.log(details);
              const scores = details.map((item) => item.score);
              const { average, sd } = calculateStatistics(scores);
              score.push({
                type: "normal",
                average: average,
                sd: sd,
              });
            } else if (headData.roleLevel === "LEVEL_2") {
              const scoreDepart = await getScoreForDepartment(
                userId,
                question.id,
                periodId,
                departmentId
              );
              if (scoreDepart) {
                // console.log("scoreDepart",scoreDepart);
                score.push(scoreDepart);
              }
            } else if (headData.roleLevel === "LEVEL_3") {
              if (supervise.length > 0) {
                for (const data of supervise) {
                  const scoreDepart = await getScoreForDepartment(
                    userId,
                    question.id,
                    periodId,
                    data.department.id
                  );
                  if (scoreDepart) {
                    // console.log("scoreDepart", scoreDepart);
                    score.push(scoreDepart);
                  }
                }
              }
            }

            if (
              headData.roleLevel === "LEVEL_2" ||
              headData.roleLevel === "LEVEL_3"
            ) {
              const details =
                await evaluateDetail.getScoreByQuestionForExecutive(
                  userId,
                  question.id,
                  periodId
                );
              const scores = details.map((item) => item.score);
              const { average, sd } = calculateStatistics(scores);
              console.log("Executive", details);
              score.push({
                type: "Executive",
                average: average,
                sd: sd,
              });
            }

            const { totalAverage, totalSd } = score.reduce(
              (acc, item) => {
                acc.totalAverage += item.average;
                acc.totalSd += item.sd;
                return acc;
              },
              { totalAverage: 0, totalSd: 0 }
            );
            const resultAverage = totalAverage / score.length;
            const resultSd = totalSd / score.length;

            return {
              questionId: question.id,
              questionName: question.content,
              scores: score,
              sumScore: {
                average: resultAverage,
                standardDeviation: resultSd,
              },
            };
          })
        );

        const formScores = questions.map((q) => q.sumScore.average);
        const { average: totalAvgPerForm, sd: totalSDPerForm } =
          calculateStatistics(formScores);

        allScores.push(totalAvgPerForm);

        return {
          formId: form.id,
          formName: form.name,
          totalAvgPerForm,
          totalSDPerForm,
          questions,
        };
      })
    );

    const { average: totalAvg, sd: totalSD } = calculateStatistics(allScores);
    headData.totalAvg = totalAvg;
    headData.totalSD = totalSD;

    return res.status(200).json({ headData, formResults });
  } catch (error) {
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
  getResultEvaluateDetail,
};
