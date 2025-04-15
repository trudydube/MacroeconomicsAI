const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require('cors');
const fs = require("fs");

const app = express();
const PORT = 3003;

app.use(cors({
    origin: "http://localhost:4200",
    methods: ["POST", "OPTIONS", "GET"],
    allowedHeaders: "*"
}));


const publicFolderPath = path.resolve(__dirname, "../../public");


if (!fs.existsSync(publicFolderPath)) {
    return res.status(400).json({ success: false, error: "No such directory exists" });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, publicFolderPath); 
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); 

    }
});

const upload = multer({ storage });

// Route to handle file uploads
app.post("/save-pdf", upload.single("pdfFile"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    res.json({ success: true, message: "File saved successfully", filePath: `/public/${req.file.filename}` });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
