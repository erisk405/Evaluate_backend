const ExcelJS = require("exceljs");
const user = require("../models/userModel");
const history = require("../models/historyModel");
const evaluate = require("../models/evaluateModel");
const period = require("../models/periodModel");
const form = require("../models/formModel");


const exportResultOverviewByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const periodId = req.params.periodId;
    const workbook = new ExcelJS.Workbook();
    const userDetail = await user.findUserById(userId);
    if (!userDetail) {
      return res.status(404).json("Not found User for id :" + userId);
    }

    if (!userDetail.role.role_level || userDetail.role.role_name === "admin") {
      return res
        .status(404)
        .json("Not found report for role :" + userDetail.role.role_name);
    }

    let reportName =
      "รายงานสรุปผลการประเมินสำหรับ " +
      userDetail.prefix?.prefix_name +
      userDetail.name;
    const filterUsers = await user.filterUserForExecutive(userId);
    if (!filterUsers) {
      return res
        .status(404)
        .json("Not found report for role :" + userDetail.role.role_name);
    }
    const periodDetail = await period.getPeriodById(periodId);
    const formData = await form.getAllform();
    let allFormName = "";
    formData.forEach((form, index) => {
      if (index + 1 === formData.length) {
        allFormName += `และ${form.name}`;
      } else {
        allFormName += `${form.name} `;
      }
    });

    const resultUser = await Promise.all(
      filterUsers.map(async (user) => {
        // ดึงผลเฉลี่ย และ ส่วนเบี่ยงเบน ภาพรวม ของแต่ละคน
        const data = await history.getTotalMeanAndSDByUserId(periodId, user.id);
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

    // สร้าง worksheet
    const sheet = workbook.addWorksheet("My Sheet", {
      properties: { defaultColWidth: 10, defaultRowHeight: 25 }, // ความกว้างเริ่มต้นสำหรับทุกคอลัมน์
    });

    // ตั้งค่าขนาด A4
    sheet.pageSetup = {
      paperSize: 9, // 9 คือ A4
      orientation: "portrait", // แนวตั้ง (ตั้ง)
      fitToPage: true, // ทำให้ข้อมูลพอดีกับขนาดหน้า
      fitToWidth: 1, // ปรับให้พอดีกับ 1 คอลัมน์
      fitToHeight: 1000, // ปรับให้พอดีกับความสูง
    };

    // ตั้งค่า Header
    sheet.mergeCells("A3:A4");
    sheet.mergeCells("B3:B4");
    sheet.mergeCells("C3:C4");
    sheet.mergeCells("D3:E3");
    sheet.mergeCells("F3:F4");

    sheet.getCell("A3").value = "ลำดับ";
    sheet.getCell("B3").value = "รายชื่อผู้รับการประเมิน";
    sheet.getCell("C3").value = "สังกัดหน่วยงาน";
    sheet.getCell("D3").value = "ผลการประเมินการปฏิบัติงาน";
    sheet.getCell("D4").value = "ค่าเฉลี่ย";
    sheet.getCell("E4").value = "S.D.";
    sheet.getCell("F3").value = "ผลคะแนน";
    // ตั้งค่าความกว้างของคอลัมน์ B และ C
    sheet.getColumn("A").width = 7;
    sheet.getColumn("B").width = 40;
    sheet.getColumn("C").width = 40;
    sheet.getColumn("D").width = 15;
    sheet.getColumn("E").width = 15;
    // จัดการตัวหนา สีพื้นหลัง และข้อความให้อยู่กลาง
    ["A3", "B3", "C3", "D3", "E3", "F3", "D4", "E4", "F4"].forEach(
      (cellRef) => {
        const cell = sheet.getCell(cellRef);
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFD3D3D3" }, // สีเทาอ่อน
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }
    );
    // หัวข้อพิเศษบนสุด
    sheet.mergeCells("A1:F2"); // รวมเซลล์ตั้งแต่ A1 ถึง F2
    sheet.getCell("A1").value =
      "สรุปผลการประเมินผลการปฏิบัติงาน\n" +
      "สำหรับบุคลากรสายสนันสนุน หน่วยงาน สำนักส่งเสริมวิชาการและงานทะเบียน\n" +
      periodDetail.title +
      "\n" +
      "(ผลการประเมิน" +
      allFormName +
      ")";

    sheet.getRow(1).height = 75;
    sheet.getCell("A1").font = { bold: true, size: 14 }; // ทำตัวหนา และตั้งขนาดตัวอักษร
    sheet.getCell("A1").alignment = {
      horizontal: "center", // จัดให้อยู่ตรงกลางแนวนอน
      vertical: "middle", // จัดให้อยู่ตรงกลางแนวตั้ง
      wrapText: true, // เปิดใช้การตัดบรรทัดอัตโนมัติ
    };

    resultUser.sort((a, b) => {
      // เปรียบเทียบ score ก่อน
      if (b.score !== a.score) {
        return b.score - a.score; // ถ้า score ไม่เท่ากันให้เรียงจากมากไปน้อย
      }
      // ถ้า score เท่ากันให้เปรียบเทียบ mean
      return b.mean - a.mean; // เรียงจากมากไปน้อยของ mean
    });

    resultUser.forEach((result, index) => {
      const rowIndex = index + 5; // เริ่มเติมข้อมูลที่แถว 5
      const row = sheet.getRow(rowIndex);
      row.height = 25; // ตั้งความสูงของแถว

      sheet.getCell(`A${rowIndex}`).value = index + 1; // ลำดับ
      sheet.getCell(`B${rowIndex}`).value = result.user.name; // ชื่อผู้รับการประเมิน
      sheet.getCell(`C${rowIndex}`).value = result.user.departmentName; // สังกัด
      sheet.getCell(`D${rowIndex}`).value = parseFloat(result.mean.toFixed(2)); // ค่าเฉลี่ย
      sheet.getCell(`E${rowIndex}`).value = parseFloat(
        result.standardDeviation.toFixed(2)
      ); // SD
      sheet.getCell(`F${rowIndex}`).value = result.score; // คะแนน

      // จัดข้อความให้อยู่กึ่งกลาง และใส่ขอบ
      ["A", "B", "C", "D", "E", "F"].forEach((col) => {
        const cell = sheet.getCell(`${col}${rowIndex}`);
        cell.alignment = { horizontal: "center", vertical: "middle" };
        if (col === "B") {
          cell.alignment = { horizontal: "left", vertical: "middle" }; // รายชื่อชิดซ้าย
        }
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    const encodedReportName = encodeURIComponent(reportName).replace(
      /%20/g,
      "_"
    ); //วาง _ ทับช่องว่าง
    console.log(encodedReportName);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodedReportName}.xlsx"`
    );

    // เขียนข้อมูล workbook ไปที่ buffer และส่ง response
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "error in exportResultOverview",
      error: error.message,
    });
  }
};

module.exports = {
  exportResultOverviewByUserId,
};
