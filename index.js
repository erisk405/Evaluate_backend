const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');

const prisma = new PrismaClient();
const app = express();

//json
app.use(express.json());

// CORS configuration
app.use(cors({
    origin: 'http://localhost:3000', // Allow only this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type'], // Allowed headers
}));

//test api
app.get('/test',(req,res)=>{
    try {
        res.status(200).json({ message: 'API is working' })
    } catch (error) {
        console.log(error);
    }
})

//start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
