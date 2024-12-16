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
    const assessor_id = req.userId;
    const period_id = req.params.period_id;
    const founded = await evaluate.findUserEvaluate(assessor_id, period_id);

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

            // const allUserPermiss = users.map((user) => user.)

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

const getResultEvaluateDetail = async (req, res) => {
  try {
    const userId = req.userId;
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
        if(!visionLevel){
          return res.status(400).json({message:"Not set yet visionFormLevel : for "+userDetail.role.role_name});
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
                const { mean, standardDeviation } =
                  calculateStatistics(scores);
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
        if(visionLevel === "VISION_1"){
          return {
            formId: formData.id,
            formName: formData.name,
            totalAvgPerForm: mean,
            totalSDPerForm: standardDeviation,
            questions: questions,
          };
        }else{
          return {
            formId: formData.id,
            formName: formData.name,
            total:results,
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

const findTotalResultEvaluateByUserId = async (userId, periodId) => {
  try {
    const score = await evaluate.getResultEvaluateById(userId, periodId);
    const resultScore = score
      .reduce((acc, item) => {
        return acc.concat(item.evaluateDetail); // รวม evaluateDetail ของแต่ละ การประเมิน แล้ว map เอาแค่ score
      }, [])
      .map((item) => item.score);
    const { mean, standardDeviation } = calculateStatistics(resultScore);
    return { mean, standardDeviation };
  } catch (error) {
    console.log(error);
  }
};

const calculateScoreByMean = (mean) => {
  let score = 0;
  if (mean >= 4.5) {
    score = 10;
  } else if (mean >= 3.5 && mean <= 4.49) {
    score = 9;
  } else if (mean >= 2.5 && mean <= 3.49) {
    score = 8;
  } else if (mean >= 1.5 && mean <= 2.49) {
    score = 7;
  } else {
    score = 6;
  }
  return score;
};

const getAllResultEvaluateOverview = async (req, res) => {
  try {
    const userId = req.userId;
    const userDetail = await user.findUserById(userId);
    const period_id = req.params.periodId;
    const allUsers = await user.getAllUsers();
    let filterUsers = [];
    const role_level = userDetail.role.role_level;

    if (role_level) {
      if (role_level === "LEVEL_2") {
        filterUsers = allUsers.filter(
          (user) =>
            user.department?.id === userDetail.department_id &&
            user.role?.role_level === "LEVEL_1"
        );
      } else if (role_level === "LEVEL_3") {
        const supervises = userDetail.supervise;
        if (supervises) {
          supervises.forEach((data) => {
            allUsers.map((user) => {
              if (
                (user.department?.id === data.department_id &&
                  user.role?.role_level === "LEVEL_1") ||
                user.role?.role_level === "LEVEL_2"
              )
                filterUsers.push(user);
            });
          });
        }
      } else {
        filterUsers = allUsers.filter(
          (user) => user.role?.role_name !== "admin" && user.department?.id
        );
      }
    }
    console.log(userDetail.name);
    console.log(role_level);
    console.log("show :", filterUsers.length, " lists");

    filterUsers = filterUsers.map((user) => ({
      id: user.id,
      name: user.prefix.prefix_name + user.name,
      departmentId: user.department.id,
      departmentName: user.department.department_name,
      roleName: user.role.role_name,
    }));

    if (filterUsers) {
      const resultUser = await Promise.all(
        filterUsers.map(async (user) => {
          // ดึงผลเฉลี่ย และ ส่วนเบี่ยงเบน ภาพรวม ของแต่ละคน
          const { mean, standardDeviation } =
            await findTotalResultEvaluateByUserId(user.id, period_id);
          return {
            user: user,
            mean,
            standardDeviation,
            score: calculateScoreByMean(mean),
          };
        })
      );

      return res.status(200).json(resultUser);
    }
  } catch (error) {
    console.log(error);
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
  getAllResultEvaluateOverview,
  calculateScoreByMean,
  getResultEvaluateDetail,
};
