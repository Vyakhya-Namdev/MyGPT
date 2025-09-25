import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { useContext, useState, useEffect } from "react";
import { MyContext, AuthContext } from "./MyContext.jsx";
import { RingLoader } from "react-spinners";
import api from "./api/api.js";
import { v1 as uuidv1 } from "uuid";

function ChatWindow({ darkMode, setDarkMode }) {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    setNewChat,
    setPrevChats,
    prevChats,
  } = useContext(MyContext);
  const { user, setUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [lastPrompt, setLastPrompt] = useState(""); // Capture prompt when sending

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
    setIsOpen(false);
  };

  const getReply = async () => {
    if (!prompt.trim()) return;
    setLastPrompt(prompt);
    setLoading(true);
    setNewChat(false);

    try {
      const res = await api.post("/chat", {
        threadId: currThreadId,
        message: prompt,
      });
      setReply(res.data.reply);
      setPrompt("");
    } catch (err) {
      console.log("Chat API error:", err.response?.status, err.message);
    }
    setLoading(false);
  };

  // Update prevChats when reply arrives using captured lastPrompt
  useEffect(() => {
    if (lastPrompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        { role: "user", content: lastPrompt },
        { role: "assistant", content: reply },
      ]);
    }
  }, [reply]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  const handleProfileClick = () => setIsOpen(!isOpen);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <div className={`chatWindow ${darkMode ? "dark" : "light"}`}>
      <div className="navbar">
        <span>
          MyMate <i className="fa-solid fa-chevron-down" style={{ color: "var(--text-muted-color)" }}></i>
        </span>
        <div className="userIconDiv">
          <button className="darkModeBtn" onClick={toggleDarkMode}>
            {darkMode ? <i className="fa-solid fa-moon"></i> : <i className="fa-solid fa-sun"></i>}
          </button>

          {!user ? (
            <>
              <button className="loginBtn" onClick={() => (window.location.href = "/login")}>
                Login <i class="fa-solid fa-right-to-bracket"></i>
              </button>
              <button className="registerBtn" onClick={() => (window.location.href = "/register")}>
                Signup<i class="fa-solid fa-user-plus"></i>
              </button>
            </>
          ) : (
            <span className="userIcon" onClick={handleProfileClick}>
              <i className="fa-solid fa-user"></i>
            </span>
          )}
        </div>
      </div>
      {isOpen && (
        <div className="dropDown">
          {user && (
            <div className="dropDownItem emailItem" style={{opacity: "0.5"}}>
              {user.email}
            </div>
          )}
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i>&nbsp;&nbsp;Settings
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-cloud-arrow-up"></i>&nbsp;&nbsp;Upgrade Plan
          </div>
          {user ? (
            <div className="dropDownItem" onClick={handleLogout}>
              <i className="fa-solid fa-right-from-bracket"></i>&nbsp;&nbsp;Log Out
            </div>
          ) : null}
        </div>
      )}

      <Chat />
      <RingLoader color={darkMode ? "#fff" : "#000"} loading={loading} size={32} className="loader" />
      <div className="chatInput">
        <div className="inputBox">
          <input placeholder="Ask anything" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
      </div>
      <div>
        <p className="info">MyMate can make mistakes. Check important info. See Cookie Preferences.</p>
      </div>
    </div>
  );
}

export default ChatWindow;
