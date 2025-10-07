import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import SoundWave from "./SoundWave.jsx"; // your existing soundwave component (canvas wave)
import { useContext, useState, useEffect, useRef } from "react";
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
  const [lastPrompt, setLastPrompt] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  // Start recording and show popup
  const startRecording = async () => {
    setIsRecording(true);
    audioChunks.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: "audio/webm" });

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
        console.log("Audio Blob size in bytes:", audioBlob.size);
        if (audioBlob.size === 0) {
          alert("No audio recorded. Please try again.");
          setIsRecording(false);
          return;
        }

        try {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.webm");

          const response = await fetch("http://localhost:8080/api/speech/transcribe", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();
          if (data.transcript) {
            setPrompt(data.transcript);
          } else {
            console.error("Transcription error:", data.error);
            alert("Error in transcription. Please try again.");
          }
        } catch (error) {
          console.error("Upload error:", error);
          alert("Failed to upload audio. Check console for more info.");
        }
        setIsRecording(false);
      };

      mediaRecorder.current.start();
    } catch (err) {
      alert("Microphone permission denied or unavailable.");
      setIsRecording(false);
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
    }
    // actual UI update after upload happens on onstop
    // but can also immediately set false here if you want instant feedback
  };

  // Mic button click toggler
  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

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
      console.error("Chat API error:", err.response?.status, err.message);
    }
    setLoading(false);
  };

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
                Login <i className="fa-solid fa-right-to-bracket"></i>
              </button>
              <button className="registerBtn" onClick={() => (window.location.href = "/register")}>
                Signup <i className="fa-solid fa-user-plus"></i>
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
            <div className="dropDownItem emailItem" style={{ opacity: "0.5" }}>
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

      <Chat isRecording={isRecording} />
      <RingLoader color={darkMode ? "#fff" : "#000"} loading={loading} size={32} className="loader" />

      {/* Listening popup shown when recording */}
      {isRecording && (
        <div className={`listeningModal ${darkMode ? "dark" : "light"}`}>
          <div className="backdrop"></div>
          <div className="modalContent">
            <h2>
              <i className="fa-solid fa-microphone"></i>&nbsp;&nbsp;Listening...
            </h2>
            <SoundWave isRecording={isRecording} />
            <button
              className="circleStopBtn"
              onClick={() => {
                if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
                  mediaRecorder.current.stop();
                }
                setIsRecording(false);
              }}
              title="Stop Recording"
            >
              <i className="fa-solid fa-stop"></i>
            </button>
          </div>
        </div>
      )}

      <div className="chatInput">
        <div className="inputBox" style={{ width: "100%", position: "relative" }}>
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            style={{ width: "100%" }}
          />
          <button
            className={`micBtn ${isRecording ? "listening" : ""}`}
            onClick={handleMicClick}
            title={isRecording ? "Stop Recording" : "Start Recording"}
            tabIndex={0}
          >
            <i className="fa-solid fa-microphone"></i>
          </button>
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
