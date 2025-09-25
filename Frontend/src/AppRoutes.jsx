import React, { useContext, useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import { MyContext, AuthContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";

import ChatWindow from "./ChatWindow";
import Sidebar from "./Sidebar";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

function AppRoutes() {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [prevChats, setPrevChats] = useState([]);
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);

  // Sync body class for dark mode should be handled in ThemeProvider, so no need here

  const providerValues = {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setCurrThreadId,
    prevChats,
    setPrevChats,
    newChat,
    setNewChat,
    allThreads,
    setAllThreads,
    darkMode,
    setDarkMode,
  };

  return (
    <MyContext.Provider value={providerValues}>
      <div className="app">
        <Routes>
          <Route path="/login" element={<Login darkMode={darkMode} />} />
          <Route path="/register" element={<Register darkMode={darkMode} />} />
          <Route
            path="*"
            element={
              <>
                <Sidebar />
                <ChatWindow darkMode={darkMode} setDarkMode={setDarkMode} />
              </>
            }
          />
        </Routes>
      </div>
    </MyContext.Provider>
  );
}

export default AppRoutes;
