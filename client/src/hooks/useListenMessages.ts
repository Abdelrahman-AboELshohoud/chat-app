import { useEffect } from "react";
import { useSocket } from "../lib/SocketContext";
import notificationSound from "../assets/notification.mp3";
export const useListenMessages = () => {
  const { socket, setMessages, messages } = useSocket();
  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      newMessage.shouldHandle = true;
      const sound = new Audio(notificationSound);
      sound.play();
      setMessages((prev) => [...prev, newMessage]);
    });
    return () => {
      socket?.off("newMessage");
    };
  }, [socket, messages, setMessages]);
};
