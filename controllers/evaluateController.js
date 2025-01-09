const evaluate = require("../models/evaluateModel");
const evaluateDetail = require("../models/evaluateDetailModel");
const department = require("../models/departmentModel");
const superviseModel = require("../models/superviseModel");
const form = require("../models/formModel");
const user = require("../models/userModel");
const permission = require("../models/permissionModel");
const period = require("../models/periodModel");
const history = require("../models/historyModel");
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
    const assessor_id = req.userId;
    const period_id = req.params.period_id;
    // --- หาว่าประเมินใครไปแล้วบ้าง -----
    const founded = await evaluate.findUserEvaluate(assessor_id, period_id);
    if (!founded || founded.length == 0) {
      return res.status(404).json({ message: "Not found evaluate" });
    }
    return res.status(200).json(founded);
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
    const assessor_id = req.userId;
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
            const founded = await evaluate.findUserEvaluateForDepartment(
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
              evaluated: founded.length,
              userEvaluated: founded,
              supervise: supervise,
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

    return res.status(200).json(report);
  } catch (error) {
    console.error("Error in find:", error);
    return res.status(500).json({
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
    // console.log("formUse",formUse);

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
    const evaluator_id = req.userId;
    const period_id = req.params.period_id;
    let roleLevel = "";
    const headData = {
      totalEvaluated: 0,
      totalAssessorsHasPermiss: 0,
      totalAVG: 0,
      totalSD: 0,
      department: {
        departmentID: null,
      },
    };

    // ดึงข้อมูลฟอร์มทั้งหมด
    const forms = await form.getAllform();
    if (!forms || forms.length === 0) {
      return res.status(404).json({ message: "not found form" });
    }

    // สร้างแผนที่ของ AssessorsPerForm เพื่อการค้นหาที่รวดเร็ว
    const AssessorsPerForm = await getAssessorsPerFormByEvaluator(evaluator_id);

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
      headData.department.departmentID = result[0].evaluator.department.id;
      roleLevel = result[0].evaluator.role.role_level;
      headData.totalEvaluated = result.length;
      headData.success = true;
      headData.evaluatorName =
        result[0].evaluator.prefix.prefix_name + result[0].evaluator.name;
      headData.periodName = result[0].period.title;
    }
    const departments = await department.getDepartments();
    const allScores = [];
    const formResults = await Promise.all(
      forms.map(async (form) => {
        const scorePerForm = [];
        await Promise.all(
          form.questions.map(async (question) => {
            const scorePerQuestions = [];
            if (roleLevel) {
              if (roleLevel === "LEVEL_1" || roleLevel === "LEVEL_4") {
                const details = await evaluateDetail.getScoreByQuestion(
                  evaluator_id,
                  question.id,
                  period_id
                );
                const scores = details.map((item) => item.score);
                scorePerQuestions.push(scores);
              } else if (roleLevel === "LEVEL_3" || roleLevel === "LEVEL_2") {
                if (departments.length > 0) {
                  for (const depart of departments) {
                    const scoreDepart = await getScoreForDepartment(
                      evaluator_id,
                      question.id,
                      period_id,
                      depart.id
                    );
                    if (scoreDepart.average > 0) {
                      // console.log("scoreDepart", scoreDepart);
                      scorePerQuestions.push(scoreDepart.scores);
                    }
                  }
                }
              }
              if (roleLevel === "LEVEL_2" || roleLevel === "LEVEL_3") {
                const details =
                  await evaluateDetail.getScoreByQuestionForExecutive(
                    evaluator_id,
                    question.id,
                    period_id
                  );
                const scores = details.map((item) => item.score);
                scorePerQuestions.push(scores);
              }
            }

            const flattenedScores = scorePerQuestions.flat();

            scorePerForm.push(flattenedScores);
          })
        );

        const flattenedScoresPerForm = scorePerForm.flat();
        const assessEvaluatePerForm = scorePerForm[0].length;
        allScores.push(flattenedScoresPerForm);
        const { mean, standardDeviation } = calculateStatistics(
          flattenedScoresPerForm
        );

        return {
          formId: form.id,
          formName: form.name,
          totalAVGPerForm: mean || 0,
          totalSDPerForm: standardDeviation || 0,
          totalAsserPerForm: assessorsMap.get(form.id) || 0,
          evaluatedPerForm: assessEvaluatePerForm,
        };
      })
    );
    const flattenedScore = allScores.flat();
    const { mean, standardDeviation } = calculateStatistics(flattenedScore);

    headData.totalAVG = mean || 0;
    headData.totalSD = standardDeviation || 0;

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
        const unfinishUsers = [];
        const countUser = await Promise.all(
          department.user.map(async (userfind) => {
            const userId = userfind.id;
            const users = await user.findPermissionByUserId(userId, period_id);
            // console.log(users);

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
            if (finishCk == false) {
              unfinishUsers.push({
                id: users.id,
                name: users.prefix.prefix_name + users.name,
                image: users.image,
                role: {
                  id: users.role.id,
                  role_name: users.role.role_name,
                },
              });
            }
            const userData = {
              id: users.id,
              name: users.prefix.prefix_name + " " + users.name,
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
          supervise: department.supervise,
          totalUsers: countUser.length,
          totalFinished: countFinish,
          totalUnfinished: countUser.length - countFinish,
          unfinishUsers: unfinishUsers,
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
  if (!scores.length) return { mean: 0, standardDeviation: 0 };

  const sum = scores.reduce((a, b) => a + b, 0);
  const mean = sum / scores.length;

  const variance =
    scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
  const standardDeviation = Math.sqrt(variance);

  return { mean, standardDeviation };
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

  const { mean, standardDeviation } = calculateStatistics(scores);
  return {
    type: departmentName.department_name,
    average: mean,
    sd: standardDeviation,
    scores: scores,
  };
};

const findResultEvaluateDetailByUserId = async (userId, periodId) => {
  try {
    const evaluateData = await evaluate.findResultEvaluate(userId, periodId);
    const forms = await form.getAllform();
    const userDetail = await user.findUserById(userId);
    const superviseDepart = userDetail.supervise?.map(
      (supervise) => supervise.department_id
    );

    const historyData = {
      evaluatorName: userDetail.prefix.prefix_name + userDetail.name,
      user_id: userId,
      period_id: periodId,
      role_name: userDetail.role.role_name,
      department_name: userDetail.department.department_name,
      total_SD: 3,
      total_mean: 0,
    };

    if (!evaluateData) {
      throw new Error("not found evaluate for this evaluator");
    }
    const allScores = [];
    const formResults = await Promise.all(
      forms.map(async (formData) => {
        const scorePerForm = [];
        const total = [];
        const visionForm = await form.findVisionFormLevel(
          formData.id,
          userDetail.role.id
        );
        const visionLevel = visionForm?.level;
        if (!visionLevel || visionLevel === "UNSET") {
          throw new Error(
            "Not set yet visionFormLevel : for " + userDetail.role.role_name
          );
        }

        const questions = await Promise.all(
          formData.questions.map(async (question) => {
            const score = [];
            const scorePerQuestions = [];
            if (visionLevel === "VISION_1") {
              const scoreDetail = await evaluateDetail.getScoreByQuestion(
                userId,
                question.id,
                periodId
              );
              const scores = scoreDetail.map((item) => item.score);
              scorePerQuestions.push(scores);
              const flattenedScores = scorePerQuestions.flat();
              scorePerForm.push(flattenedScores);
              const { mean, standardDeviation } = calculateStatistics(scores);
              return {
                level: visionLevel,
                questionId: question.id,
                questionName: question.content,
                sumScore: {
                  average: mean,
                  standardDeviation: standardDeviation,
                },
              };
            } else if (visionLevel === "VISION_2") {
              if (userDetail.role.role_level === "LEVEL_3") {
                if (superviseDepart) {
                  for (const depart_id of superviseDepart) {
                    const scoreDepart = await getScoreForDepartment(
                      userId,
                      question.id,
                      periodId,
                      depart_id
                    );
                    scorePerQuestions.push(scoreDepart.scores);
                    total.push({
                      type: scoreDepart.type,
                      scores: scoreDepart.scores,
                    });
                    score.push({
                      type: scoreDepart.type,
                      average: scoreDepart.average,
                      sd: scoreDepart.sd,
                    });
                  }
                }
              } else if (userDetail.role.role_level === "LEVEL_2") {
                const scoreDepart = await getScoreForDepartment(
                  userId,
                  question.id,
                  periodId,
                  userDetail.department?.id
                );
                scorePerQuestions.push(scoreDepart.scores);
                total.push({
                  type: scoreDepart.type,
                  scores: scoreDepart.scores,
                });
                score.push({
                  type: scoreDepart.type,
                  average: scoreDepart.average,
                  sd: scoreDepart.sd,
                });
              }

              //---------get result for Executive----------------
              const scoreForExecutive =
                await evaluateDetail.getScoreByQuestionForExecutive(
                  userId,
                  question.id,
                  periodId
                );
              const scores = scoreForExecutive.map((item) => item.score);
              if (scoreForExecutive.length > 0) {
                scorePerQuestions.push(scores);
                const { mean, standardDeviation } = calculateStatistics(scores);
                total.push({
                  type: "Executive",
                  scores: scores,
                });
                score.push({
                  type: "Executive",
                  average: mean,
                  sd: standardDeviation,
                });
              }
              //---------get result for Executive----------------

              const flattenedScores = scorePerQuestions.flat();
              scorePerForm.push(flattenedScores);

              const { mean, standardDeviation } =
                calculateStatistics(flattenedScores);
              return {
                level: visionLevel,
                questionId: question.id,
                questionName: question.content,
                scores: score,
                sumScore: {
                  average: mean,
                  standardDeviation: standardDeviation,
                },
              };
            }
          })
        );
        // กลุ่มข้อมูลตาม type
        const groupedData = total.reduce((acc, item) => {
          if (!acc[item.type]) acc[item.type] = [];
          acc[item.type].push(...item.scores); // รวมคะแนนในอาร์เรย์เดียว
          return acc;
        }, {});
        // console.log(groupedData);

        const results = Object.keys(groupedData).map((type) => {
          const scores = groupedData[type];
          const { mean, standardDeviation } = calculateStatistics(scores);
          return {
            total: type,
            average: mean,
            sd: standardDeviation,
          };
        });
        const flateScorePerForm = scorePerForm.flat();
        allScores.push(flateScorePerForm);

        const { mean, standardDeviation } =
          calculateStatistics(flateScorePerForm);
        if (visionLevel === "VISION_1") {
          return {
            formId: formData.id,
            formName: formData.name,
            totalAvgPerForm: mean,
            totalSDPerForm: standardDeviation,
            questions: questions,
          };
        } else {
          return {
            formId: formData.id,
            formName: formData.name,
            total: results,
            totalAvgPerForm: mean,
            totalSDPerForm: standardDeviation,
            questions: questions,
          };
        }
      })
    );
    const flateScoreAll = allScores.flat();
    const { mean, standardDeviation } = calculateStatistics(flateScoreAll);
    historyData.total_mean = mean;
    historyData.total_SD = standardDeviation;

    return { historyData, formResults };
  } catch (error) {
    console.log(error);
  }
};

const getResultEvaluateDetail = async (req, res) => {
  try {
    const userId = req.userId;
    const periodId = req.params.period_id;
    const evaluateData = await evaluate.findResultEvaluate(userId, periodId);
    const forms = await form.getAllform();
    const userDetail = await user.findUserById(userId);
    const superviseDepart = userDetail.supervise?.map(
      (supervise) => supervise.department_id
    );

    const headData = {
      evaluatorName: userDetail.prefix.prefix_name + userDetail.name,
      periodName: evaluateData.period.title,
      roleName: userDetail.role.role_name,
      department: userDetail.department.department_name,
      totalAvg: 3,
      totalSD: 0,
    };

    if (!evaluateData) {
      return res
        .status(404)
        .json({ message: "not found evaluate for this evaluator" });
    }
    const allScores = [];
    const formResults = await Promise.all(
      forms.map(async (formData) => {
        const scorePerForm = [];
        const total = [];
        const visionForm = await form.findVisionFormLevel(
          formData.id,
          userDetail.role.id
        );
        const visionLevel = visionForm?.level;
        if (!visionLevel || visionLevel === "UNSET") {
          return res.status(400).json({
            message:
              "Not set yet visionFormLevel : for " + userDetail.role.role_name,
          });
        }

        const questions = await Promise.all(
          formData.questions.map(async (question) => {
            const score = [];
            const scorePerQuestions = [];
            if (visionLevel === "VISION_1") {
              const scoreDetail = await evaluateDetail.getScoreByQuestion(
                userId,
                question.id,
                periodId
              );
              const scores = scoreDetail.map((item) => item.score);
              scorePerQuestions.push(scores);
              const flattenedScores = scorePerQuestions.flat();
              scorePerForm.push(flattenedScores);
              const { mean, standardDeviation } = calculateStatistics(scores);
              return {
                level: visionLevel,
                questionId: question.id,
                questionName: question.content,
                sumScore: {
                  average: mean,
                  standardDeviation: standardDeviation,
                },
              };
            } else if (visionLevel === "VISION_2") {
              if (userDetail.role.role_level === "LEVEL_3") {
                if (superviseDepart) {
                  for (const depart_id of superviseDepart) {
                    const scoreDepart = await getScoreForDepartment(
                      userId,
                      question.id,
                      periodId,
                      depart_id
                    );
                    scorePerQuestions.push(scoreDepart.scores);
                    total.push({
                      type: scoreDepart.type,
                      scores: scoreDepart.scores,
                    });
                    score.push({
                      type: scoreDepart.type,
                      average: scoreDepart.average,
                      sd: scoreDepart.sd,
                    });
                  }
                }
              } else if (userDetail.role.role_level === "LEVEL_2") {
                const scoreDepart = await getScoreForDepartment(
                  userId,
                  question.id,
                  periodId,
                  userDetail.department?.id
                );
                scorePerQuestions.push(scoreDepart.scores);
                total.push({
                  type: scoreDepart.type,
                  scores: scoreDepart.scores,
                });
                score.push({
                  type: scoreDepart.type,
                  average: scoreDepart.average,
                  sd: scoreDepart.sd,
                });
              }

              //---------get result for Executive----------------
              const scoreForExecutive =
                await evaluateDetail.getScoreByQuestionForExecutive(
                  userId,
                  question.id,
                  periodId
                );
              const scores = scoreForExecutive.map((item) => item.score);
              if (scoreForExecutive.length > 0) {
                scorePerQuestions.push(scores);
                const { mean, standardDeviation } = calculateStatistics(scores);
                total.push({
                  type: "Executive",
                  scores: scores,
                });
                score.push({
                  type: "Executive",
                  average: mean,
                  sd: standardDeviation,
                });
              }
              //---------get result for Executive----------------

              const flattenedScores = scorePerQuestions.flat(); // รวมอาเรยเข้าเป็น 1 มิติ
              scorePerForm.push(flattenedScores);

              const { mean, standardDeviation } =
                calculateStatistics(flattenedScores);
              return {
                level: visionLevel,
                questionId: question.id,
                questionName: question.content,
                scores: score,
                sumScore: {
                  average: mean,
                  standardDeviation: standardDeviation,
                },
              };
            }
          })
        );
        // กลุ่มข้อมูลตาม type
        const groupedData = total.reduce((acc, item) => {
          if (!acc[item.type]) acc[item.type] = [];
          acc[item.type].push(...item.scores); // รวมคะแนนในอาร์เรย์เดียว
          return acc;
        }, {});
        // console.log(groupedData);

        const results = Object.keys(groupedData).map((type) => {
          const scores = groupedData[type];
          const { mean, standardDeviation } = calculateStatistics(scores);
          return {
            total: type,
            average: mean,
            sd: standardDeviation,
          };
        });
        const flateScorePerForm = scorePerForm.flat();
        allScores.push(flateScorePerForm);

        const { mean, standardDeviation } =
          calculateStatistics(flateScorePerForm);
        if (visionLevel === "VISION_1") {
          return {
            formId: formData.id,
            formName: formData.name,
            totalAvgPerForm: mean,
            totalSDPerForm: standardDeviation,
            questions: questions,
          };
        } else {
          return {
            formId: formData.id,
            formName: formData.name,
            total: results,
            totalAvgPerForm: mean,
            totalSDPerForm: standardDeviation,
            questions: questions,
          };
        }
      })
    );
    const flateScoreAll = allScores.flat();
    const { mean, standardDeviation } = calculateStatistics(flateScoreAll);
    headData.totalAvg = mean;
    headData.totalSD = standardDeviation;

    return res.status(200).json({ headData, formResults });

    // return res.status(200).json({ headData, formResults });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};
const getResultEvaluateDetailByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const periodId = req.params.periodId;
    const evaluateData = await evaluate.findResultEvaluate(userId, periodId);
    const forms = await form.getAllform();
    const userDetail = await user.findUserById(userId);
    const superviseDepart = userDetail.supervise?.map(
      (supervise) => supervise.department_id
    );

    const headData = {
      evaluatorName: userDetail.prefix.prefix_name + userDetail.name,
      periodName: evaluateData.period.title,
      roleName: userDetail.role.role_name,
      department: userDetail.department.department_name,
      totalAvg: 3,
      totalSD: 0,
    };

    if (!evaluateData) {
      return res
        .status(404)
        .json({ message: "not found evaluate for this evaluator" });
    }
    const allScores = [];
    const formResults = await Promise.all(
      forms.map(async (formData) => {
        const scorePerForm = [];
        const total = [];
        const visionForm = await form.findVisionFormLevel(
          formData.id,
          userDetail.role.id
        );
        const visionLevel = visionForm?.level;
        if (!visionLevel || visionLevel === "UNSET") {
          return res.status(400).json({
            message:
              "Not set yet visionFormLevel : for " + userDetail.role.role_name,
          });
        }

        const questions = await Promise.all(
          formData.questions.map(async (question) => {
            const score = [];
            const scorePerQuestions = [];
            if (visionLevel === "VISION_1") {
              const scoreDetail = await evaluateDetail.getScoreByQuestion(
                userId,
                question.id,
                periodId
              );
              const scores = scoreDetail.map((item) => item.score);
              scorePerQuestions.push(scores);
              const flattenedScores = scorePerQuestions.flat();
              scorePerForm.push(flattenedScores);
              const { mean, standardDeviation } = calculateStatistics(scores);
              return {
                level: visionLevel,
                questionId: question.id,
                questionName: question.content,
                sumScore: {
                  average: mean,
                  standardDeviation: standardDeviation,
                },
              };
            } else if (visionLevel === "VISION_2") {
              if (userDetail.role.role_level === "LEVEL_3") {
                if (superviseDepart) {
                  for (const depart_id of superviseDepart) {
                    const scoreDepart = await getScoreForDepartment(
                      userId,
                      question.id,
                      periodId,
                      depart_id
                    );
                    scorePerQuestions.push(scoreDepart.scores);
                    total.push({
                      type: scoreDepart.type,
                      scores: scoreDepart.scores,
                    });
                    score.push({
                      type: scoreDepart.type,
                      average: scoreDepart.average,
                      sd: scoreDepart.sd,
                    });
                  }
                }
              } else if (userDetail.role.role_level === "LEVEL_2") {
                const scoreDepart = await getScoreForDepartment(
                  userId,
                  question.id,
                  periodId,
                  userDetail.department?.id
                );
                scorePerQuestions.push(scoreDepart.scores);
                total.push({
                  type: scoreDepart.type,
                  scores: scoreDepart.scores,
                });
                score.push({
                  type: scoreDepart.type,
                  average: scoreDepart.average,
                  sd: scoreDepart.sd,
                });
              }

              //---------get result for Executive----------------
              const scoreForExecutive =
                await evaluateDetail.getScoreByQuestionForExecutive(
                  userId,
                  question.id,
                  periodId
                );
              const scores = scoreForExecutive.map((item) => item.score);
              if (scoreForExecutive.length > 0) {
                scorePerQuestions.push(scores);
                const { mean, standardDeviation } = calculateStatistics(scores);
                total.push({
                  type: "Executive",
                  scores: scores,
                });
                score.push({
                  type: "Executive",
                  average: mean,
                  sd: standardDeviation,
                });
              }
              //---------get result for Executive----------------

              const flattenedScores = scorePerQuestions.flat();
              scorePerForm.push(flattenedScores);

              const { mean, standardDeviation } =
                calculateStatistics(flattenedScores);
              return {
                level: visionLevel,
                questionId: question.id,
                questionName: question.content,
                scores: score,
                sumScore: {
                  average: mean,
                  standardDeviation: standardDeviation,
                },
              };
            }
          })
        );
        // กลุ่มข้อมูลตาม type
        const groupedData = total.reduce((acc, item) => {
          if (!acc[item.type]) acc[item.type] = [];
          acc[item.type].push(...item.scores); // รวมคะแนนในอาร์เรย์เดียว
          return acc;
        }, {});
        // console.log(groupedData);

        const results = Object.keys(groupedData).map((type) => {
          const scores = groupedData[type];
          const { mean, standardDeviation } = calculateStatistics(scores);
          return {
            total: type,
            average: mean,
            sd: standardDeviation,
          };
        });
        const flateScorePerForm = scorePerForm.flat();
        allScores.push(flateScorePerForm);

        const { mean, standardDeviation } =
          calculateStatistics(flateScorePerForm);
        if (visionLevel === "VISION_1") {
          return {
            formId: formData.id,
            formName: formData.name,
            totalAvgPerForm: mean,
            totalSDPerForm: standardDeviation,
            questions: questions,
          };
        } else {
          return {
            formId: formData.id,
            formName: formData.name,
            total: results,
            totalAvgPerForm: mean,
            totalSDPerForm: standardDeviation,
            questions: questions,
          };
        }
      })
    );
    const flateScoreAll = allScores.flat();
    const { mean, standardDeviation } = calculateStatistics(flateScoreAll);
    headData.totalAvg = mean;
    headData.totalSD = standardDeviation;

    return res.status(200).json({ headData, formResults });

    // return res.status(200).json({ headData, formResults });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const getAllResultEvaluateOverviewByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const userDetail = await user.findUserById(userId);
    if (!userDetail) {
      return res.status(404).json({ message: "not found detail" });
    }
    const period_id = req.params.period_id;
    const filterUsers = await user.filterUserForExecutive(userId);
    if (!filterUsers || filterUsers.length == 0) {
      return res.status(404).json({ message: "ไม่มีผลการประเมิน" });
    }
    const role_level = userDetail.role.role_level;
    let headData = {};
    if (userDetail.role.role_name === "admin") {
      headData = {
        name: userDetail.prefix.prefix_name + userDetail.name,
        roleName: userDetail.role.role_name,
        numberOFUser: filterUsers.length,
      };
    } else {
      headData = {
        name: userDetail.prefix.prefix_name + userDetail.name,
        roleLevel: role_level,
        roleName: userDetail.role.role_name,
        department: userDetail.department.department_name,
        numberOFUser: filterUsers.length,
      };
    }

    if (filterUsers) {
      const resultUser = await Promise.all(
        filterUsers.map(async (user) => {
          // ดึงผลเฉลี่ย และ ส่วนเบี่ยงเบน ภาพรวม ของแต่ละคน
          const data = await history.getTotalMeanAndSDByUserId(
            period_id,
            user.id
          );
          const total_mean = data ? data.total_mean : 0;
          const total_SD = data ? data.total_SD : 0;
          return {
            user: user,
            mean: total_mean,
            standardDeviation: total_SD,
            score: evaluate.calculateScoreByMean(total_mean),
          };
        })
      );

      return res.status(200).json({ headData, resultUser });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const getAllResultEvaluateOverview = async (req, res) => {
  try {
    const userId = req.userId;
    const userDetail = await user.findUserById(userId);
    if (!userDetail) {
      return res.status(404).json({ message: "not found detail" });
    }
    const period_id = req.params.period_id;
    const filterUsers = await user.filterUserForExecutive(userId);
    if (!filterUsers || filterUsers.length == 0) {
      return res.status(404).json({ message: "ไม่มีผลการประเมิน" });
    }
    const role_level = userDetail.role.role_level;
    let headData = {};
    if (userDetail.role.role_name === "admin") {
      headData = {
        name: userDetail.prefix.prefix_name + userDetail.name,
        roleName: userDetail.role.role_name,
        numberOFUser: filterUsers.length,
      };
    } else {
      headData = {
        name: userDetail.prefix.prefix_name + userDetail.name,
        roleLevel: role_level,
        roleName: userDetail.role.role_name,
        department: userDetail.department.department_name,
        numberOFUser: filterUsers.length,
      };
    }

    if (filterUsers) {
      const resultUser = await Promise.all(
        filterUsers.map(async (user) => {
          // ดึงผลเฉลี่ย และ ส่วนเบี่ยงเบน ภาพรวม ของแต่ละคน
          const data = await history.getTotalMeanAndSDByUserId(
            period_id,
            user.id
          );
          const total_mean = data ? data.total_mean : 0;
          const total_SD = data ? data.total_SD : 0;
          return {
            user: user,
            mean: total_mean,
            standardDeviation: total_SD,
            score: evaluate.calculateScoreByMean(total_mean),
          };
        })
      );

      return res.status(200).json({ headData, resultUser });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const upDateEvaluate = async (req, res) => {
  try {
    const evalData = req.body;
    const evaluate_id = evalData.evaluate_id;
    const details = evalData.details;
    // console.log(evalData);
    const result = await prisma.$transaction(async (tx) => {
      const updateDetail = await evaluateDetail.updateDetailEval(details, tx);
      if (!updateDetail) {
        throw new error("Failed update evaluate score");
      }
      const updateDateEval = await evaluate.upDateDateEval(evaluate_id, tx);
      if (!updateDateEval) {
        throw new error("Failed update evaluate date");
      }
      return { updateDetail, updateDetail };
    });

    return res.status(200).json({ message: "update successfully", result });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};
const deleteEvaluate = async (req, res) => {
  try {
    const { allUserId, periodId } = req.body;

    if (allUserId.length > 0) {
      const allResults = []; // เก็บผลลัพธ์ทั้งหมด
      for (const user of allUserId) {
        //find all evaluate id of user
        const find = await evaluate.getResultEvaluateById(
          user.userId,
          periodId
        );
        const allEvaluateId = find.map((user) => user.id);

        console.log(`User: ${user.userId}, Evaluate IDs:`, allEvaluateId);

        if (allEvaluateId.length > 0) {
          const userDelete = await prisma.$transaction(async (tx) => {
            const results = [];
            for (const evaluateId of allEvaluateId) {
              const deleteEvaluateScore =
                await evaluateDetail.deleteDetailEvalByEvaluteId(
                  evaluateId,
                  tx
                );

              if (!deleteEvaluateScore) {
                throw new Error("cannot delete evaluate score");
              }

              const deleted = await evaluate.deleteEvaluate(evaluateId, tx);
              if (!deleted) {
                throw new Error("cannot delete evaluate");
              }

              results.push({ evaluateId, deleteEvaluateScore, deleted });
            }
            return results;
          });

          allResults.push({ userId: user.userId, userDelete });
        }
      }

      return res.status(200).json({
        message: "ลบข้อมูลสำเร็จ",
        details: allResults,
      });
    }

    return res.status(400).json({ message: "No data to delete" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};
const saveToHistory = async (req, res) => {
  try {
    const { period_id } = req.body;
    let status = false;
    // ดึงข้อมูลผู้ใช้ทั้งหมด
    const allUsers = await user.getAllUsers();

    // คัดกรองเฉพาะผู้ใช้ที่ไม่ใช่ admin และ member
    const filterUserIds = allUsers
      .filter(
        (user) =>
          user.role?.role_name !== "admin" && user.role?.role_name !== "member"
      )
      .map((user) => user.id);

    // สร้าง history และ detail สำหรับผู้ใช้แต่ละคน
    const resultsCreate = await Promise.all(
      filterUserIds.map(async (userId) => {
        const result = await findResultEvaluateDetailByUserId(
          userId,
          period_id
        );
        if (result) {
          status = true
          return await prisma.$transaction(async (tx) => {
            // สร้าง history
            const createHistory = await history.createHistory(
              result.historyData,
              tx
            );
            if (!createHistory) {
              throw new Error("Failed to create history");
            }

            // วนลูปสร้าง history detail, form score, และ question score
            const historyCreateAll = await Promise.all(
              result.formResults.map(async (form) => {
                const formScore = [];
                const historyDetailData = {
                  history_id: createHistory.history_id, // ใช้ id จาก history ที่สร้าง
                  questionHead: form.formName,
                  level: form.questions[0].level,
                };

                const createHistoryDetail = await history.createHistoryDetail(
                  historyDetailData,
                  tx
                );
                if (!createHistoryDetail) {
                  throw new Error("Failed to create historyDetail");
                }

                // สร้าง form score
                if (form?.total) {
                  form?.total.map((item) => {
                    formScore.push({
                      history_detail_id: createHistoryDetail.id,
                      type_name: item.total,
                      total_SD_per_type: item.sd,
                      total_mean_per_type: item.average,
                    });
                  });
                  formScore.push({
                    history_detail_id: createHistoryDetail.id,
                    type_name: "sumScore",
                    total_SD_per_type: form.totalSDPerForm,
                    total_mean_per_type: form.totalAvgPerForm,
                  });
                } else {
                  formScore.push({
                    history_detail_id: createHistoryDetail.id,
                    type_name: "sumScore",
                    total_SD_per_type: form.totalSDPerForm,
                    total_mean_per_type: form.totalAvgPerForm,
                  });
                }

                const createFormScore = await history.createHistoryFormScore(
                  formScore,
                  tx
                );
                if (!createFormScore) {
                  throw new Error("Failed to create FormScore");
                }

                // สร้าง question score
                let questionScoreData = form.questions.map((question) => {
                  if (question?.scores) {
                    const scores = [];
                    question?.scores.map((score) => {
                      scores.push({
                        history_detail_id: createHistoryDetail.id,
                        question: question.questionName,
                        type_name: score.type,
                        SD: score.sd,
                        mean: score.average,
                      });
                    });
                    scores.push({
                      history_detail_id: createHistoryDetail.id,
                      question: question.questionName,
                      type_name: "sumScore",
                      SD: question.sumScore.standardDeviation,
                      mean: question.sumScore.average,
                    });
                    return scores;
                  } else {
                    return {
                      history_detail_id: createHistoryDetail.id,
                      question: question.questionName,
                      type_name: "sumScore",
                      SD: question.sumScore.standardDeviation,
                      mean: question.sumScore.average,
                    };
                  }
                });

                if (form?.total) {
                  questionScoreData = questionScoreData.flat();
                }

                const createQuestionScore =
                  await history.createHistoryQuestionScore(
                    questionScoreData,
                    tx
                  );
                if (!createQuestionScore) {
                  throw new Error("Failed to create QuestionScore");
                }

                return {
                  createHistoryDetail,
                  createFormScore,
                  createQuestionScore,
                };
              })
            );

            return { createHistory, historyCreateAll };
          });
        }
      })
    );

    if(status){
      const updateBackup = await period.setBackupTrue(period_id);
  
      if (!updateBackup) {
        return res.status(400).json({ message: "Can not set back Up true" });
      }
    }else{
      return res.status(404).json({message:"Not found Evluate result !!"})
    }

    return res.status(200).json({ resultsCreate });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "เกิดข้อผิดพลาดภายในระบบ",
      error: error.message,
    });
  }
};

const getResultEvaluateFormHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const periodId = req.params.periodId;
    // console.log(userId, periodId);

    const result = await history.findResultEvaluateFormHistoryByUserId(
      periodId,
      userId
    );
    if (!result || result.length == 0) {
      return res
        .status(404)
        .json({ message: "not found result evaluate form this User" });
    }
    const headData = {
      periodName: result.period.title,
      userName: result.user.prefix.prefix_name + result.user.name,
      roleName: result.role_name,
      department: result.department_name,
      total_mean: result.total_mean,
      total_SD: result.total_SD,
    };
    const formResults = result.history_detail.map((form) => {
      const total = form.historyFormScore
        .filter((total) => total.type_name !== "sumScore")
        .map((total) => {
          return {
            type: total.type_name,
            average_per_type: total.total_mean_per_type,
            sd_per_type: total.total_SD_per_type,
          };
        });
      const sumTotal = form.historyFormScore
        .filter((total) => total.type_name === "sumScore")
        .map((total) => {
          return {
            // type: total.type_name,
            average_per_form: total.total_mean_per_type,
            sd_per_form: total.total_SD_per_type,
          };
        });

      let questions = form.historyQuestionScore.reduce((acc, item) => {
        if (!acc[item.question]) {
          acc[item.question] = {
            id: item.id,
            questionName: item.question,
            scores: [],
            sumScore: {
              average: 0,
              sd: 0,
            },
          };
        }
        if (item.type_name === "sumScore") {
          acc[item.question].sumScore.average = item.mean;
          acc[item.question].sumScore.sd = item.SD;
        } else {
          acc[item.question].scores.push({
            type: item.type_name,
            average: item.mean,
            sd: item.SD,
          });
        }
        return acc;
      }, {});

      questions = Object.values(questions); // แปลง ออบเจ็ก ไป อาเรย์ ผ่านคีย์

      return {
        detailId: form.id,
        level: form.level,
        formName: form.questionHead,
        total: total,
        sumTotal: sumTotal[0],
        questions: questions,
      };
    });

    return res.status(200).json({ headData, formResults });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error !!",
      error: error.message,
    });
  }
};

const getResultEvaluateFormHistoryByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const periodId = req.params.periodId;
    // console.log(userId, periodId);

    const result = await history.findResultEvaluateFormHistoryByUserId(
      periodId,
      userId
    );
    if (!result || result.length == 0) {
      return res
        .status(404)
        .json({ message: "not found result evaluate form this User" });
    }
    const headData = {
      periodName: result.period.title,
      userName: result.user.prefix.prefix_name + result.user.name,
      roleName: result.role_name,
      department: result.department_name,
      total_mean: result.total_mean,
      total_SD: result.total_SD,
    };
    const formResults = result.history_detail.map((form) => {
      const total = form.historyFormScore
        .filter((total) => total.type_name !== "sumScore")
        .map((total) => {
          return {
            type: total.type_name,
            average_per_type: total.total_mean_per_type,
            sd_per_type: total.total_SD_per_type,
          };
        });
      const sumTotal = form.historyFormScore
        .filter((total) => total.type_name === "sumScore")
        .map((total) => {
          return {
            // type: total.type_name,
            average_per_form: total.total_mean_per_type,
            sd_per_form: total.total_SD_per_type,
          };
        });

      let questions = form.historyQuestionScore.reduce((acc, item) => {
        if (!acc[item.question]) {
          acc[item.question] = {
            id: item.id,
            questionName: item.question,
            scores: [],
            sumScore: {
              average: 0,
              sd: 0,
            },
          };
        }
        if (item.type_name === "sumScore") {
          acc[item.question].sumScore.average = item.mean;
          acc[item.question].sumScore.sd = item.SD;
        } else {
          acc[item.question].scores.push({
            type: item.type_name,
            average: item.mean,
            sd: item.SD,
          });
        }
        return acc;
      }, {});

      questions = Object.values(questions); // แปลง ออบเจ็ก ไป อาเรย์ ผ่านคีย์

      return {
        detailId: form.id,
        level: form.level,
        formName: form.questionHead,
        total: total,
        sumTotal: sumTotal[0],
        questions: questions,
      };
    });

    return res.status(200).json({ headData, formResults });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Internal server error !!",
      error: error.message,
    });
  }
};

const deleteHistoryByPeriod = async (req, res) => {
  try {
    const periodId = req.params.periodId;
    console.log("p1",periodId);

    await prisma.$transaction(async (tx) => {
      // Find history data
      const historyData = await history.findHistoryByPeriod(periodId); // Fetch history with details
      if (!historyData.length) {
        throw new Error(`No history found for period ID: ${periodId}`);
      }

      for (const subHistory of historyData) {
        for (const detail of subHistory.history_detail) {
          console.log(`Deleting detail: ${detail.id}`);

          // Delete related question scores
          await history.deleteHistoryQuestionScore(detail.id, tx);

          // Delete related form scores
          await history.deleteHistoryFormScore(detail.id, tx);

          // Delete the history detail
          await history.deleteHistoryDetailByID(detail.id,tx)
          console.log(`Deleted history detail with ID: ${detail.id}`);
        }

        // Delete the main history record
        await history.deleteHistoryById(subHistory.history_id,tx)
        console.log(`Deleted history record with ID: ${subHistory.history_id}`);
      }
    });
    console.log("p2",periodId);
    
    await period.setBackupFalse(periodId);

    res.status(200).json({ message: "History deleted successfully" });
  } catch (error) {
    console.error("Error deleting history:", error.message);
    res.status(500).json({
      message: "Internal server error !!",
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
  getAllResultEvaluateOverview,
  getResultEvaluateDetail,
  getResultEvaluateDetailByUserId,
  upDateEvaluate,
  deleteEvaluate,
  saveToHistory,
  getResultEvaluateFormHistory,
  getResultEvaluateFormHistoryByUserId,
  getAllResultEvaluateOverviewByUserId,
  deleteHistoryByPeriod,
};
