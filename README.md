# 🎯 360-Degree Evaluation System
<div align="center">
  <img src="https://res.cloudinary.com/dmmpngwym/image/upload/v1739263695/dam3_sodznv.jpg">
</div>
<div align="center">

[![Open Source Love](https://firstcontributions.github.io/open-source-badges/badges/open-source-v1/open-source.svg)](https://github.com/kishanrajput23/Hacktoberfest-2022)
<img src="https://img.shields.io/badge/Evaluation-2024-blueviolet" alt="Eris"/>
<img src="https://img.shields.io/static/v1?label=%E2%AD%90&message=If%20Useful&style=style=flat&color=BC4E99" alt="Star Badge"/>
<a href="https://github.com/erisk405" ><img src="https://img.shields.io/badge/Contributions-welcome-green.svg?style=flat&logo=github" alt="Contributions" /></a>

</div>

## 📂 Project Structure
```
├── backend/   # Node.js (Express) with Prisma and PostgreSQL 
    └── database/  # PostgreSQL schema and migrations
├── frontend/  # Next.js with TailwindCSS and shadcn components
```

## 🚀 Entity Relationship Diagram (ERD) Evalations 360

<div align="center">
  <img src="https://res.cloudinary.com/dmmpngwym/image/upload/v1739293840/Blank_board_2_ekugdw.png">
</div>

<br>

<div >
<table>
  <tr>
    <th>ตาราง</th>
    <th>ความหมาย</th>
  </tr>
  <tr>
    <td>User</td>
    <td>ตารางผู้ใช้งานระบบ</td>
  </tr>
  <tr>
    <td>Department</td>
    <td>ตารางหน่วยงาน</td>
  </tr>
  <tr>
    <td>Role</td>
    <td>ตารางตำแหน่ง</td>
  </tr>
  <tr>
    <td>Permission</td>
    <td>ตารางสิทธิ์การประเมิน</td>
  </tr>
  <tr>
    <td>Form</td>
    <td>ตารางแบบฟอร์มด้านการประเมิน</td>
  </tr>
  <tr>
    <td>FormQuestion</td>
    <td>ตารางคำถามการประเมิน</td>
  </tr>
  <tr>
    <td>Evaluate</td>
    <td>ตารางการประเมิน</td>
  </tr>
  <tr>
    <td>EvaluateDetail</td>
    <td>ตารางรายละเอียดการประเมิน</td>
  </tr>
  <tr>
    <td>PrefixName</td>
    <td>ตารางคำนำหน้า</td>
  </tr>
  <tr>
    <td>Period</td>
    <td>ตารางรอบการประเมิน</td>
  </tr>
  <tr>
    <td>History</td>
    <td>ตารางผลการประเมินย้อนหลัง</td>
  </tr>
  <tr>
    <td>HistoryDetail</td>
    <td>ตารางรายละเอียดผลการประเมินย้อนหลัง</td>
  </tr>
  <tr>
    <td>HistoryQuestionScore</td>
    <td>ตารางคะแนนคำถามย้อนหลัง</td>
  </tr>
  <tr>
    <td>HistoryFormScore</td>
    <td>ตารางคะแนนฟอร์มย้อนหลัง</td>
  </tr>
  <tr>
    <td>RoleRequest</td>
    <td>ตารางการร้องขอตำแหน่ง</td>
  </tr>
  <tr>
    <td>Supervise</td>
    <td>ตารางผู้ดูแลหน่วยงาน</td>
  </tr>
  <tr>
    <td>Image</td>
    <td>ตารางรูปภาพ</td>
  </tr>
  <tr>
    <td>PermissionForm</td>
    <td>ตารางสิทธิ์กับฟอร์ม</td>
  </tr>
  <tr>
    <td>RoleFormVision</td>
    <td>ตารางการมองเห็นฟอร์ม</td>
  </tr>
</table>
</div>


## 🛢️ Data Flow Diagram

<div align="center">
  <img src="https://res.cloudinary.com/dmmpngwym/image/upload/v1739297773/Screenshot_2025-02-12_011535_ta2z1e.png">
</div>
<br>
<div align="center">
<table border="1">
  <tr>
    <th>ระดับผู้ใช้</th>
    <th>ความสามารถในการใช้งานระบบ</th>
  </tr>
  <tr>
    <td><strong>ผู้ดูแลระบบ</strong></td>
    <td>
      - จัดการข้อมูลพื้นฐาน (คำนำหน้า, ตำแหน่ง, หน่วยงาน, แบบฟอร์มการประเมิน, กำหนดวันประเมิน) <br>
      - จัดการข้อมูลสิทธิ์ (กำหนดสิทธิ์ของตำแหน่งต่าง ๆ) <br>
      - จัดการข้อมูลผู้ใช้ (ผู้บริหาร, บุคลากร) <br>
      - จัดการรายงานผลการประเมิน (ส่งออกรายงาน)
    </td>
  </tr>
  <tr>
    <td><strong>กลุ่มผู้บริหาร</strong></td>
    <td>
      - การประเมินบุคลากรในสังกัด <br>
      - การประเมินบุคลากรนอกสังกัด <br>
      - การประเมินกลุ่มผู้บริหาร <br>
      - ดูผลการประเมินของบุคลากรในสังกัด <br>
      - ดูผลการประเมินของตนเอง
    </td>
  </tr>
  <tr>
    <td><strong>กลุ่มบุคลากร</strong></td>
    <td>
      - การประเมินบุคลากรภายในหน่วยงาน <br>
      - การประเมินบุคลากรภายนอกหน่วยงาน <br>
      - การประเมินกลุ่มผู้บริหาร <br>
      - ดูผลการประเมินของตนเอง
    </td>
  </tr>
</table>

</div>


### 📦 Installation Guide
```
# Clone the repository
git clone https://github.com/erisk405/evaluate_backend.git

# Install dependencies
cd Evaluate
npm install

# Start the development server
npm start

```

# 🔗 Links
- **Frontend Repository:** <a href="https://github.com/erisk405/Evaluate_backend"><p>GitHub</p></a>
- **Backend Repository:** <a href="https://github.com/erisk405/Evaluate"><p>GitHub</p></a>

## Awesome contributors :star_struck:
<a href="https://github.com/erisk405">
  <img src="https://res.cloudinary.com/dmmpngwym/image/upload/v1739256689/2_yvkcpt.png" />
</a>
<a href="https://github.com/amphon11">
  <img src="https://res.cloudinary.com/dmmpngwym/image/upload/v1739256689/1_sxf0s1.png" />
</a>

:tada:  _**Happy Contributing**_  :tada:

## Author 🙋‍♂️ : [Find Me Here](https://www.facebook.com/hnuy.xa.phl.993652)
