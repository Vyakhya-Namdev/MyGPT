import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/googlegemini.js";

const router = express.Router();

//test
router.post("/test", async(req, res) => {      //test database will be created and all these thread info will be stored there as request is going to "/test"
    try{
        const thread = new Thread({
            threadId: "abc",
            title: "Testing the routes"
        })

        const response = await thread.save();
        res.send(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Failed to save in database!"});
    }
})


//Get all threads
router.get("/thread", async(req, res) => {
    try{
        const threads = await Thread.find({}).sort({updatedAt: -1});
        //descending order of updatedAt...most recent data on top
        res.json(threads);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Failed to fetch threads"});
    }
})

//Get thread through threadId
router.get("thread/:threadId", async(req, res) => {
    const {threadId} = req.params;

    try{
        const thread = await Thread.findOne({threadId});
        
        if(!thread){
            res.status(404).json({error: "Thread not found"});
        }

        res.json(thread.messages);
    }catch(err){
        console.log(err);
        req.status(500).json({error: "Failed to fetch this particular thread"});
    }
})

//to delete the particular thread
router.delete("/thread/:threadId", async(req, res) => {
    const {threadId} = req.params;

    try{
        const deletedThread = await Thread.findOneAndDelete({threadId});  
        
        if(!deletedThread){
            res.status(404).json({error: "Thread not deleted"});
        }
        
        res.status(200).json({message: "Thread deleted successfully"});

    }catch(err){
        console.log(err);
        res.status(500).json({error: "Failed to delete this thread"});
    }
})

//to post the message in thread
router.post("/chat", async(req, res) => {
    const {threadId, message} = req.body;

    if(!threadId || !message){
        return res.status(400).json({error: "Please provide all the missing fields"});
    }

    try{
        const thread = await Thread.findOneAndUpdate({threadId});
        if(!thread){
            //create a new thread in DB
            thread = new Thread({
                threadId,
                title: message,
                messages: [{role: "user", content: message}]
            });
        }else{
            thread.messages.push({role: "user", content: message});
        }

        const assistantReply = await getGeminiAPIResponse(message);
        thread.messages.push({role: "assistant", content: assistantReply});
        thread.updatedAt = new Date();

        await thread.save();
        res.json({reply: assistantReply});
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Failed to post message"});
    }
})


export default router;