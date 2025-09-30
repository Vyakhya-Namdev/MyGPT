import express from "express";
import multer from "multer";
import axios from "axios";

const router = express.Router();
const upload = multer(); // memory storage for single file upload

const ASSEMBLYAI_API = "https://api.assemblyai.com/v2/upload";
const ASSEMBLYAI_TRANSCRIPT = "https://api.assemblyai.com/v2/transcript";

router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    // Log audio file info for debugging
    console.log("Received audio file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    // Upload raw audio buffer to AssemblyAI's upload endpoint
    const uploadResponse = await axios.post(ASSEMBLYAI_API, req.file.buffer, {
      headers: {
        authorization: process.env.ASSEMBLY_AI_API_KEY,
        "Content-Type": "application/octet-stream",
      },
    });

    const audioUrl = uploadResponse.data.upload_url;

    // Request transcription
    const transcriptResponse = await axios.post(
      ASSEMBLYAI_TRANSCRIPT,
      {
        audio_url: audioUrl,
        language_code: "en", // Match your use case language
      },
      {
        headers: {
          authorization: process.env.ASSEMBLY_AI_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    const transcriptId = transcriptResponse.data.id;

    // Poll transcription result until complete
    let transcriptResult;
    while (true) {
      transcriptResult = await axios.get(`${ASSEMBLYAI_TRANSCRIPT}/${transcriptId}`, {
        headers: { authorization: process.env.ASSEMBLY_AI_API_KEY },
      });
      if (transcriptResult.data.status === "completed") {
        break;
      }
      if (transcriptResult.data.status === "error") {
        throw new Error(`Transcription failed: ${transcriptResult.data.error}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 3000)); // wait 3 seconds
    }

    // Send the transcript text back to frontend
    res.json({ transcript: transcriptResult.data.text });
  } catch (error) {
    console.error("Speech transcription error:", error.response?.data || error.message);
    res.status(500).json({ error: "Transcription failed" });
  }
});

export default router;
