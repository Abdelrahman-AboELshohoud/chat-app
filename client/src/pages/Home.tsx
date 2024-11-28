import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "../lib/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useSocket } from "../lib/SocketContext";
import moment from "moment";
import { useListenMessages } from "../hooks/useListenMessages";

export default function Home() {
  const [message, setMessage] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    setConversation,
    conversation,
    conversations,
    messages,
    sendMessage,
    setMessages,
  } = useSocket();
 
  const { onlineUsers } = useSocket();
  const { setUser } = useAuth();

  useListenMessages();
  if (user && !onlineUsers.includes(user.id)) {
    setConversation(null);
  }

  const handleSend = () => {
    if (message.trim() === "") return;
    sendMessage(message);
    setMessage("");
  };

  useEffect(() => {
    ref.current?.scrollTo({
      top: ref.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  if (!user)
    return (
      <div className="flex flex-col justify-center items-center max-h-[80vh] min-h-[80vh] gap-6">
        <h2 className="text-3xl font-semibold text-gray-500">
          Login to connect with your care team!
        </h2>
        <Link to="/login">
          <button className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            Login
          </button>
        </Link>
      </div>
    );

  return (
    <section className="bg-gray-100  rounded-md bg-opacity-50 overflow-hidden flex flex-row ">
      <div
        className={`w-full relative md:w-[30%] ${
          conversation && "hidden md:block"
        }`}
      >
        <div
          className={`flex flex-col min-h-[85vh] max-h-[85vh] relative  z-[6] ${
            conversations.length > 0 ? "overflow-y-scroll " : ""
          }`}
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
          }}
        >
          <h2 className="text-lg font-semibold text-white bg-orange-600 bg-opacity-90 p-4">
            People you can chat with!
          </h2>

          {conversations.length > 0
            ? conversations.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => {
                    setConversation(contact);
                    // getMessages(contact.id);
                  }}
                  className={`flex items-center p-2 gap-3 hover:bg-gray-200 cursor-pointer ${
                    conversation === contact ? "bg-gray-300 bg-opacity-80" : ""
                  }`}
                >
                  <img
                    src={contact.avatar}
                    alt={contact.fullname}
                    className="w-12 h-12  rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-sm p-1 text-gray-200 leading-tight line-clamp-1 mb-1">
                      {contact.fullname}
                    </h3>
                    {/* <p className="text-gray-500 text-left text-sm line-clamp-1">
                  {contact.username}
                </p> */}
                  </div>
                </button>
              ))
            : ""}
        </div>
        <button
          onClick={async (e) => {
            e.preventDefault();
            await fetch("/api/auth/logout", {
              method: "POST",
            });
            setUser(null);
            navigate("/login");
          }}
          className="flex absolute hover:cursor-pointer p-3 bottom-0 items-center w-full justify-center text-white bg-red-500 hover:bg-red-600 transition-colors"
        >
          Logout
        </button>
      </div>
      <div
        className={`min-h-[90vh] max-h-[90vh] flex flex-col relative md:w-[70%] w-full bg-opacity-50 bg-white ${
          conversation ? "block" : "hidden md:block"
        }`}
      >
        <header
          className={`absolute top-0 left-0 w-full p-2.5 z-20 bg-indigo-950 md:bg-transparent ${
            conversation ? "block" : "hidden"
          }`}
        >
          <div
            className="cursor-pointer w-fit bg-white md:bg-indigo-950 rounded-full p-1.5 z-10"
            onClick={() => {
              setConversation(null);
              setMessages([]);
            }}
          >
            <ArrowLeft className=" text-indigo-950 md:text-white" size={15} />
          </div>
        </header>
        {/* Messages */}
        <div
          className={`flex flex-col h-full bg-opacity-80 bg-white px-6 py-4 ${
            messages.length > 0 ? "overflow-y-scroll" : ""
          }`}
          style={{
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
          }}
          ref={ref}
        >
          {messages.length > 0 ? (
            messages.map((msg, index: number) => (
              <div
                key={index}
                className={`mb-6 flex break-words ${
                  msg.senderId === user.id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative max-w-[70%] rounded-2xl px-4 shadow-sm py-2 ${
                    msg.senderId === user.id
                      ? "bg-orange-600 text-white shadow-gray-400"
                      : "bg-white text-gray-800 shadow-gray-400"
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{msg.body}</p>
                  <span className="mt-1 block text-[11px] opacity-75">
                    {moment(msg.createdAt).format("h:mm a")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center my-auto h-full">
              <h2 className="text-3xl px-6 font-semibold text-center text-gray-700">
                Start a chat with someone to see it here!
              </h2>
            </div>
          )}
        </div>

        {conversation && (
          <div className="border-t bg-white bg-opacity-80 p-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-gray-200 bg-gray-50 px-6 py-3 text-gray-700 focus:border-orange-600 focus:outline-none focus:ring-1 focus:ring-orange-600"
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="flex h-10 p-3 w-10 items-center justify-center bg-opacity-90 bg-indigo-950 rounded-full text-white transition-colors hover:bg-indigo-900"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
