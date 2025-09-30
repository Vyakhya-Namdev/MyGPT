import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoute from "./routes/chat.js";
import cookieParser from "cookie-parser";
import authRoute from "./routes/auth.js";
import WebSocket, { WebSocketServer } from "ws";
import axios from "axios";
import speechRoute from "./routes/speech.js";

const app = express();
const PORT = process.env.PORT ;
const WSPORT = process.env.WSPORT ;    //WebSocket server port for audio streaming

app.use(express.json());
app.use(cors({
  origin: "http://localhost:5173",            
  credentials: true                           
}));
app.use(cookieParser()); 

app.use("/api", chatRoute);
app.use("/api/auth", authRoute);
app.use("/api/speech", speechRoute);

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    connectDB();
    startWebSocketServer();
})

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB!");
    }catch(err){
        console.log("Failed to connect to MongoDB", err);
    }
}

//WebSocket server for streaming audio to AssemblyAI
const startWebSocketServer = () => {
    const wss = new WebSocketServer({ port: WSPORT });
    console.log(`WebSocket Server listening on ws://localhost:${WSPORT}`);

    wss.on("connection", (ws) => {
        console.log("WebSocket server connected");
        ws.on("message", async (message) => {
            try{
                //Here you forward received audio chunk to AssemblyAI streaming endpoint
                const apiResponse = await axios({
                    method: "POST",
                    url: "https://api.assemblyai.com/v2/stream",
                    data: message,
                    headers: {
                        authorization: process.env.ASSEMBLY_AI_API_KEY,
                        "Content-type": "audio/web"
                    },
                        data: message,
                });

                // Adapt this to actual transcript from apiResponse
                const transcript = apiResponse.data.text || "Transcript not available";

                // Send back to client
                ws.send(JSON.stringify({ transcript }));
            } catch(error){
                console.log("Error in WebSocket server", error);
                ws.send(JSON.stringify({ error: "Transcription error" }));
            }
        });

        ws.on("close", () => {
            console.log("WebSocket server disconnected");
        });
    })           
            
}

// app.post("/test", async (req, res) => {
//     const options = {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json',
//             'X-goog-api-key': `${process.env.GEMINI_API_KEY}`
//         },
//         body: JSON.stringify({
//             contents: [
//                 {
//                     parts: [
//                         {
//                             text: req.body.text
//                         }
//                     ]
//                 }
//             ]
//         })
//     };

//     try{
//         const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent", options);
//         const data = await response.json();
//         // console.log(data.candidates[0].content.parts[0].text);    //Prints only output not the whole json object
//         res.send(data);  
//     }catch(err){
//         console.log(err);
//     }
// })

