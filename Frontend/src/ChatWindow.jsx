import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { useContext, useState, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import {RingLoader} from "react-spinners";


function ChatWindow(){
    const {prompt, setPrompt, reply, setReply, currThreadId, setNewChat, setPrevChats} = useContext(MyContext);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);   //set default false value

    const getReply = async() => {
        setLoading(true);
        setNewChat(false);
        
        console.log("message: ", prompt, "threadId: ", currThreadId);
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                threadId: currThreadId,
                message: prompt,
            })
        };

        try{
            const response = await fetch("http://localhost:8080/api/chat", options);
            const res = await response.json();
            setReply(res.reply);
            console.log(res);
        }catch(err){
            console.log(err);

        }
        setLoading(false);
    }

    //Append new chats to prev chats
    useEffect(() => {
        if(prompt && reply){
            setPrevChats(prevChats => (
                [...prevChats,{
                    role: "user",
                    content: prompt,
                },
                {
                    role: "assistant",
                    content: reply,
                }]
            ))
        }
        setPrompt("");
    }, [reply]);

    const handleProfileClick = () => {
        setIsOpen(!isOpen);
    }

    return(
        <div className="chatWindow">
            <div className="navbar">
                <span>MyMate <i className="fa-solid fa-chevron-down"></i></span>
                <div className="userIconDiv">
                    <span className="userIcon" onClick={handleProfileClick}><i className="fa-solid fa-user"></i></span>
                </div>
            </div>
            {
                isOpen &&
                <div className="dropDown">
                    <div className="dropDownItem"><i class="fa-solid fa-gear"></i>Settings</div>
                    <div className="dropDownItem"><i class="fa-solid fa-cloud-arrow-up"></i>Upgrade Plan</div>
                    <div className="dropDownItem"><i class="fa-solid fa-right-from-bracket"></i>LogOut</div>
                </div>
            }
            <Chat></Chat>
            <RingLoader color="#fff" loading={loading} className="loader"></RingLoader>
            <div className="chatInput">
                <div className="inputBox">
                    <input placeholder="Ask anything"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}>
                    </input>
                    <div id="submit" onClick={getReply}><i className="fa-solid fa-paper-plane"></i></div>
                </div>
            </div>
            <div>
                <p className="info">
                    MyMate can make mistakes. Check important info. See Cookie Prefernces.
                </p>
            </div>
        </div>
    )
}

export default ChatWindow;