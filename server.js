import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ---------- POST endpoint to receive patient data ----------
app.post("/api/submit", async (req, res) => {
  try {
    const data = req.body;
    console.log("📥 Received patient data:", data);

    // ---------- Generate Medical Certificate PDF ----------
    const doc = new PDFDocument();
    const filename = `medical_certificate_${Date.now()}.pdf`;
    const filepath = `/tmp/${filename}`;
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    doc.fontSize(18).text("VividMedi Medical Certificate", { align: "center" });
    doc.moveDown();
    doc.fontSize(12);
    doc.text(`Patient: ${data.firstName} ${data.lastName}`);
    doc.text(`Date of Birth: ${data.dob}`);
    doc.text(`Email: ${data.email}`);
    doc.text(`Mobile: ${data.mobile}`);
    doc.moveDown();

    doc.text(`Certificate Type: ${data.certType}`);
    doc.text(`Leave From: ${data.leaveFrom}`);
    doc.text(`Reason: ${data.reason}`);
    doc.text(`Leave Dates: ${data.fromDate} to ${data.toDate}`);
    doc.moveDown();

    doc.text(`Symptoms: ${data.symptoms}`);
    doc.text(`Doctor Notes: ${data.doctorNote}`);
    doc.moveDown(2);

    doc.fontSize(10).text("This certificate was issued by an AHPRA-registered Australian medical doctor.");
    doc.end();

    // ---------- Wait until PDF is finished ----------
    stream.on("finish", async () => {
      // ---------- Email Certificate ----------
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });

      const mailOptions = {
        from: `"VividMedi" <${process.env.EMAIL_USER}>`,
        to: data.email, // Send to patient
        subject: "Your VividMedi Medical Certificate",
        text: `Dear ${data.firstName},\n\nAttached is your VividMedi medical certificate.\n\nRegards,\nVividMedi Team`,
        attachments: [
          {
            filename,
            path: filepath
          }
        ]
      };

      await transporter.sendMail(mailOptions);

      console.log("📤 Certificate sent successfully to", data.email);
      res.json({ success: true, message: "Certificate sent successfully" });
    });
  } catch (err) {
    console.error("❌ Error processing certificate:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ---------- Health Check ----------
app.get("/", (req, res) => res.send("✅ VividMedi Backend is running..."));

// ---------- Start Server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
