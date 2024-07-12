const express = require("express");
const { PrismaClient } = require("@prisma/client");
const cors = require("cors");
const upload = require("./controller/routeUpload");

const prisma = new PrismaClient();
const app = express();


//json
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:3000", // Allow only this origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Allowed headers
  })
);


//test api
app.get("/test", (req, res) => {
  try {
    res.status(200).json({ message: "API is working" });
  } catch (error) {
    console.log(error);
  }
});

// PUT ---------------------------------------

app.put('/upload/:id', upload.single('image'), async (req, res) => {
  try {
      // URL ของรูปที่ถูกอัพโหลด
      const imageUrl = req.file.path;

      // บันทึก URL ลงฐานข้อมูลโดยใช้ Prisma
      const newImage = await prisma.user.update({
          where:{
            uid:req.params.id
          },
          data: {
              image: imageUrl,
              // อื่น ๆ ที่ต้องการบันทึก
          }
      });

      res.status(201).json(newImage);
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Something went wrong!' });
  }
});

// POST ----------------------------------------------------------


app.post('/department', async (req, res) => {
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

app.post("/role",async(req,res)=>{
  try {
    const role = await prisma.role.create({
      data:{
        id:req.body.id,
        role_name:req.body.role_name
      }
    })
    res.status(201).json(role)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong!' });
    
  }
})


app.post("/users", async (req, res) => {
  console.log(req.body);
  try {
    const user = await prisma.user.create({
      data: {
        uid: req.body.uid,
        email: req.body.email,
        name: req.body.name,
        password: req.body.password,
        role_id: req.body.role_id,
        department_id: req.body.department_id,
        dateofbirth:new Date(req.body.dateofbirth)
      }
    });
    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

// GET --------------------------------------------------------
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

app.get("/user/:id", async (req, res) => {
    try {
      const user = await prisma.user.findUnique({
        where:{
            uid:req.params.id
        }
      });
      console.log(user);
      res.status(200).json(user);
    } catch (error) {}
  });
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
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
