import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./useAuth";

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const socketUrl =
  import.meta.env.NODE_ENV === "production" ? "" : "http://localhost:3000";
interface SocketProviderProps {
  children: React.ReactNode;
}

interface Contact {
  id: string;
  fullname: string;
  avatar: string;
}

export type Message = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
  shouldShake?: boolean;
};

interface SocketContextType {
  socket: Socket | undefined;
  onlineUsers: string[];
  messages: Message[];
  conversation: Contact | null;
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setConversation: React.Dispatch<React.SetStateAction<Contact | null>>;
  conversations: Contact[];
  getMessages: (conversationId: string) => void;
  getConversations: () => void;
  sendMessage: (message: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const socketRef = useRef<Socket | undefined>(undefined);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Contact | null>(null);
  const [conversations, setConversations] = useState<Contact[]>([]);
  const { user } = useAuth();

  const sendMessage = async (message: string) => {
    if (!conversation || !user) return;
    try {
      const res = await fetch(`/api/message/${user.id}/${conversation.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data.newMessage]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMessages = useCallback(
    async (conversationId: string) => {
      if (!conversation || !user) return;
      try {
        const res = await fetch(`/api/message/${user.id}/${conversationId}`);
        const data = await res.json();

        if (res.ok) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.log(error);
      }
    },
    [conversation, user]
  );

  const getConversations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/message/conversations/${user.id}`);
      const data = await res.json();
      if (res.ok) {
        setConversations(data.users);
      }
    } catch (error) {
      console.log(error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      getConversations();
      const socket = io(socketUrl, {
        query: { userId: user.id },
      });
      socketRef.current = socket;

      socket.on("getOnlineUsers", (users: string[]) => {
        setOnlineUsers(users);
      });

      return () => {
        socket.off("getOnlineUsers");
        socketRef.current = undefined;
      };
    } else if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = undefined;
      }
    }
  }, [user, getConversations]);

  useEffect(() => {
    console.log(conversation);
    if (conversation) getMessages(conversation.id);
  }, [conversation, getMessages]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
        messages,
        conversation,
        setMessages,
        setConversation,
        conversations,
        getMessages,
        getConversations,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
