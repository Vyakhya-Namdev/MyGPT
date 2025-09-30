import "./Sidebar.css";
import { MyContext, AuthContext } from "./MyContext";
import { useContext, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";
import api from "./api/api";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user) {
      setAllThreads([]);
      return;
    }

    const getAllThreads = async () => {
      try {
        const response = await api.get("/thread");
        const data = response.data;

        if (Array.isArray(data)) {
          const filterData = data.map((thread) => ({
            threadId: thread.threadId,
            title: thread.title,
          }));
          setAllThreads(filterData);
        } else {
          setAllThreads([]);
        }
      } catch (err) {
        setAllThreads([]);
      }
    };

    getAllThreads();
  }, [currThreadId, user]);

  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    if (!user) return;

    try {
      const response = await api.get(`/thread/${newThreadId}`);
      const data = response.data;
      if (Array.isArray(data)) {
        setPrevChats(data);
      } else {
        setPrevChats([]);
      }
      setNewChat(false);
      setReply(null);
    } catch (err) {}
  };

  const deleteThread = async (threadId) => {
    if (!user) return;

    try {
      await api.delete(`/thread/${threadId}`);
      setAllThreads((prev) => prev.filter((thread) => thread.threadId !== threadId));
      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (err) {}
  };

  if (!user) {
    return (
      <section className="sidebar">
        <button onClick={createNewChat} className="newChatBtn">
          <img src="src/assets/logo.avif" alt="gpt logo" className="logo" />
          <span>
            <i className="fa-solid fa-pen-to-square"></i>
          </span>
        </button>
        <div className="sign">
          <p>By Vyakhya Namdev &hearts;</p>
        </div>
      </section>
    );
  }

  // logged in sidebar with threads:
  return (
    <section className="sidebar">
      <button onClick={createNewChat} className="newChatBtn">
        <img src="src/assets/logo.avif" alt="gpt logo" className="logo" />
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>
      <ul className="history">
        {allThreads?.map((thread, idx) => (
          <li
            key={idx}
            onClick={() => changeThread(thread.threadId)}
            className={thread.threadId === currThreadId ? "highlighted" : ""}
          >
            {thread.title}
            <i
              className="fa-solid fa-trash"
              onClick={e => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
            ></i>
          </li>
        ))}
      </ul>
      <div className="sign">
        <p>By Vyakhya Namdev &hearts;</p>
      </div>
    </section>
  );
}

export default Sidebar;
