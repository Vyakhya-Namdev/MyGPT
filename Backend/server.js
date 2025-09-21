import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import chatRoute from "./routes/chat.js";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use("/api", chatRoute);

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
    connectDB();
})

const connectDB = async() => {
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB!");
    }catch(err){
        console.log("Failed to connect to MongoDB", err);
    }
}

// app.post("/test", async (req, res) => {
//     const options = {
//         method: "POST",
//         headers: {
//             'Content-Type': 'application/json',
//             'X-goog-api-key': `${process.env.GRMINI_API_KEY}`
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

