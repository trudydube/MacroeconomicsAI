const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3002; 
const scriptPath1 = "./policyrec.py"; 
const scriptPath2 = "./getpolicy.py"; 
const scriptPath3 = "./forecast.py"; 
const scriptPath4 = "./scenarioanalysis.py"; 
const scriptPath5 = "./Economic_Indicators.txt"; 

app.use(cors());
app.use(bodyParser.json());

app.get("/get-script-training", (req, res) => {
  fs.readFile(scriptPath1, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading the script file" });
    }
    res.json({ content1: data });
  });
});

app.get("/get-script-invocation", (req, res) => {
    fs.readFile(scriptPath2, "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Error reading the script file" });
      }
      res.json({ content2: data });
    });
});

app.get("/get-forecast-script", (req, res) => {
  fs.readFile(scriptPath3, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading the script file" });
    }
    res.json({ content: data });
  });
});

app.get("/get-scenario-script", (req, res) => {
  fs.readFile(scriptPath4, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading the script file" });
    }
    res.json({ content: data });
  });
});

app.get("/get-dataset",(req, res) => {
  fs.readFile(scriptPath5, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Error reading the script file" });
    }
    res.json({ content: data });
  });
});

app.post("/save-forecast-script", (req, res) => {
  const updatedContent = req.body.content;

  fs.writeFile(scriptPath3, updatedContent, "utf8", (err) => {
    if (err) {
      return res.status(500).json({ error: "Error saving the script file" });
    }
    res.json({ message: "Script updated successfully" });
  });
});

  app.post("/save-script-training", (req, res) => {
    const updatedContent = req.body.content;
  
    fs.writeFile(scriptPath1, updatedContent, "utf8", (err) => {
      if (err) {
        return res.status(500).json({ error: "Error saving the script file" });
      }
      res.json({ message: "Script updated successfully" });
    });
  });

app.post("/save-script-invocation", (req, res) => {
  const updatedContent = req.body.content;

  fs.writeFile(scriptPath2, updatedContent, "utf8", (err) => {
    if (err) {
      return res.status(500).json({ error: "Error saving the script file" });
    }
    res.json({ message: "Script updated successfully" });
  });
});

app.post("/save-scenario-script", (req, res) => {
  const updatedContent = req.body.content;

  fs.writeFile(scriptPath4, updatedContent, "utf8", (err) => {
    if (err) {
      return res.status(500).json({ error: "Error saving the script file" });
    }
    res.json({ message: "Script updated successfully" });
  });
});

app.post("/save-dataset", (req, res) => {
  const updatedContent = req.body.content;

  fs.writeFile(scriptPath5, updatedContent, "utf8", (err) => {
    if (err) {
      return res.status(500).json({ error: "Error saving the script file" });
    }
    res.json({ message: "Script updated successfully" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
