
const express = require("express");
const multer = require("multer");
const { PDFDocument } = require("pdf-lib");

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }
});

app.use(express.static("public"));
app.use(express.json());

app.get("/api/status", (req, res) => {
  res.json({
    name: "PDF Smart Solutions",
    status: "online",
    tools: ["Merge PDF", "Split PDF"]
  });
});

app.post("/api/merge", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length < 2) {
      return res.status(400).json({ error: "Upload at least two PDF files." });
    }

    const merged = await PDFDocument.create();

    for (const file of req.files) {
      const pdf = await PDFDocument.load(file.buffer);
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach(page => merged.addPage(page));
    }

    const bytes = await merged.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=merged.pdf");
    res.send(Buffer.from(bytes));
  } catch (error) {
    res.status(400).json({ error: "Could not merge these PDF files." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`PDF Smart Solutions running on ${PORT}`));
