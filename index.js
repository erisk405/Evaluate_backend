const express = require("express");
const { PrismaClient } = require("@prisma/client");
require("dotenv").config();
const cors = require("cors");
const {upload , deleteImage} = require("./controllers/routeUpload");
const routes = require("./routes");
const cookieParser = require("cookie-parser");
const prisma = new PrismaClient();
const app = express();


//json
app.use(express.json());

app.use(cookieParser());
// CORS configuration
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000", // Allow only this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Allowed headers
  })
);

app.use("/api", routes);

// PUT----------------------------------------------------------------
app.put('/usersImage/:id', upload.single('image'), async (req, res) => {
  try {
      // URL ของรูปที่ถูกอัพโหลด
      const userId = req.params.id;
      // บันทึก URL ลงฐานข้อมูลโดยใช้ Prisma
      const user = await prisma.user.findUnique({
        where: {
            id: userId
          }
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found!' });
      }
      if (user.image_id) {
        const oldImage = await prisma.image.findUnique({
          where: { id: user.image_id },
        });
  
        if (oldImage) {
          console.log(`Deleting old image with public_id: ${oldImage.public_id}`);
          // Delete the old image
          await deleteImage(oldImage.public_id);
  
          // ลบ old image จาก database
          await prisma.image.delete({
            where: { id: oldImage.id },
          });
        }
      }


      // บันทึก Image ลงในตาราง Image
      const newImage = await prisma.image.create({
        data: {
          url: req.file.path,
          public_id: req.file.filename, // Assuming req.file.filename is the public_id
        },
      });
  
      // อัพเดต image_id ในตาราง User
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { image_id: newImage.id },
      });
  
      res.status(201).json(updatedUser);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong!' ,message:error});
  }
});


app.put("/usersRole/:id", async(req, res)=>{
  try {
    const users = await prisma.user.update({
      where:{
        id:req.params.id
      },
      data:{
        role_id:req.body.role_id
      }
    })
    res.status(200).json(users)
  } catch (error) {
    console.log(error);
  }
})

app.put("/usersDepartment/:id", async(req, res)=>{
  try {
    const users = await prisma.user.update({
      where:{
        id:req.params.id
      },
      data:{
        department_id:req.body.department_id
      }
    })
    res.status(200).json(users)
  } catch (error) {
    console.log(error);
  }
})


// POST ----------------------------------------------------------

app.post('/departments', async (req, res) => {
  try {
    console.log("im coming:",req.body);
    const department = await prisma.department.create({
      data: {
        id: req.body.id,
        department_name: req.body.department_name,
        headOfDepartment_id: req.body.headOfDepartment_id,
        deputyDirector_id: req.body.deputyDirector_id
      }
    });
    res.status(201).json(department);
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


// GET

app.get('/departments', async (req , res)=>{
  try {
    const allDepart = await prisma.department.findMany({
      select: {
        id: true,
        department_name: true,
        image:true
      },
    })
    res.status(200).json(allDepart)
  } catch (error) {
    console.log(error);
  }
})

app.get("/users", async (req, res) => {
  try {
    const user = await prisma.user.findMany({
      include: { 
        role: true,
        department:true
       }

    });
    console.log(user);
    res.status(200).json(user);
  } catch (error) {}
});


// app.get("/users/:id", async (req, res) => {
//     try {
//       const user = await prisma.user.findUnique({
//         where:{
//             uid:req.params.id
//         }
//       });
//       console.log(user);
//       res.status(200).json(user);
//     } catch (error) {}
//   });
app.get("/roles",async(req,res)=>{
  try {
    const roles = await prisma.role.findMany()
    res.status(200).json(roles);
    
  } catch (error) {
    
    console.error(error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
})

app.get('/workon/:id',async(req,res)=>{
  try {
    const workon = await prisma.user.findMany({
      where:{
        department_id:req.params.id
      },
      include: { 
        role: true,
        department:true
       }
    })
    res.status(201).json(workon)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong!' });
    
  }
})

//start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));