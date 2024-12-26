const ExcelJS = require("exceljs");
const user = require("../models/userModel");

const exportResultOverview = async (req, res) => {
  try {
    const ExcelJS = require("exceljs"); // อย่าลืม require ExcelJS
    const workbook = new ExcelJS.Workbook();
    // const filterUsers = await user.filterUserForExecutive("f20c5222-9b94-49fa-acb3-77033b658750");
    // console.log(filterUsers);
    
    // สร้าง worksheet พร้อม header/footer
    const sheet = workbook.addWorksheet("My Sheet");

    // ตั้งค่าคอลัมน์และแถวสำหรับข้อมูล (ใช้แถวที่ 2 สำหรับคอลัมน์หัวข้อ)
    sheet.columns = [
      { header: "ลำดับ", key: "id", width: 10 },
      { header: "รายชื่อผู้รับการประเมิน", key: "name", width: 30 },
      { header: "สังกัดหน่วยงาน", key: "department", width: 20 },
      { header: "ผลการประเมินการปฏิบัติงาน", key: "result", width: 20 },
      // ค่าเฉลี่ย
      { header: "", key: "", width: 20 },
      { header: "ผลคะแนน", key: "score", width: 10 },
    ];
    sheet.mergeCells("A1:A2");
    sheet.mergeCells("B1:B2");
    sheet.mergeCells("C1:C2");
    sheet.mergeCells("D1:E1");
    sheet.mergeCells("F1:F2");

    sheet.getCell("D2").value = "ค่าเฉลี่ย";
    sheet.getCell("E2").value = "SD";

    // จัดข้อความให้กิ่งกลาง (Center Align)
    ["A1", "B1", "C1", "D1", "E1", "F1"].forEach((cellRef) => {
      const cell = sheet.getCell(cellRef);
      cell.alignment = { horizontal: "center", vertical: "middle" };
    });

    // ถ้าคุณต้องการจัดข้อความในเซลล์ D2 และ E2 ให้อยู่กิ่งกลาง
    sheet.getCell("D2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    sheet.getCell("E2").alignment = {
      horizontal: "center",
      vertical: "middle",
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=Books.xlsx");

    // เขียนข้อมูล workbook ไปที่ buffer และส่ง response
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "error in exportResultOverview",
      error: error.message,
    });
  }
};

module.exports = {
  exportResultOverview,
};
