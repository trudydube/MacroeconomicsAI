const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require('cors');
const fs = require("fs");
const http = require('http');

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

app.post("/save-pdf", upload.single("pdfFile"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const { username } = req.body;
    const filePath = `../../public/${req.file.filename}`

    uploadReport(username, req.file.filename, filePath)
    .then(response => {
      res.json({ success: true, message: "File saved and database updated successfully", filePath });
    })
    .catch(error => {
      res.status(500).json({ success: false, error: "Error updating the database" });
    });
});

async function uploadReport(username, fileName, filePath) {
    const postData = new URLSearchParams({
        username: username,
        fileName: fileName,
        filePath: filePath
    }).toString();

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/src/app/upload_report.php',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length
        }
    };

    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log('Upload Report Response:', data);
                    resolve(data);
                } else {
                    console.error('Error uploading report. Status:', res.statusCode);
                    reject(new Error('Failed to upload report'));
                }
            });
        });

        req.on('error', (error) => {
            console.error('Request error:', error);
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
