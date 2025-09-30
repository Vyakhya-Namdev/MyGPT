import "./Chat.css";
import { AuthContext, MyContext } from "./MyContext";
import { useContext, useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat({ isRecording }) {
  const { newChat, prevChats, reply } = useContext(MyContext);
  const [latestReply, setLatestReply] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (reply === null) {
      setLatestReply(null);
      return;
    }
    if (!prevChats?.length) return;

    const content = reply.split(" ");
    let idx = 0;
    const interval = setInterval(() => {
      setLatestReply(content.slice(0, idx + 1).join(" "));
      idx++;
      if (idx >= content.length) clearInterval(interval);
    }, 40);

    return () => clearInterval(interval);
  }, [prevChats, reply]);

  return (
    <>
      {newChat && (user ? <h2>Welcome, Start a New Chat!</h2> : <h2>Welcome, Start chatting with AI!</h2>)}
      <div className="chats">
        {prevChats.map((chat, idx) => (
          <div className={chat.role === "user" ? "userDiv" : "aiDiv"} key={idx}>
            {chat.role === "user" ? (
              <p className="userMessage">{chat.content}</p>
            ) : idx === prevChats.length - 1 && latestReply !== null ? (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{latestReply}</ReactMarkdown>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>{chat.content}</ReactMarkdown>
            )}
          </div>
        ))}

        {isRecording && (
          <div className="aiDiv listeningIndicator">
            <p>🎤 Listening...</p>
          </div>
        )}
      </div>
    </>
  );
}

export default Chat;
