import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { getRecieverId, io } from "../socket/socket.js";

export const sendMessage = async (req: Request, res: Response) => {
  const { message } = req.body;
  const userId = req.user.id;
  const { id, receiverId } = req.params;
  if (!id) {
    return res.status(400).json({ message: "Unauthorized" });
  }
  if (userId !== id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    let conversation = await prisma.conversation.findFirst({
      where: {
        usersIds: {
          hasEvery: [id, receiverId],
        },
      },
    });
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { usersIds: { set: [id, receiverId] } },
      });
    }
    const newMessage = await prisma.message.create({
      data: { body: message, conversationId: conversation.id, senderId: id },
    });
    if (newMessage) {
      conversation = await prisma.conversation.update({
        where: { id: conversation.id },
        data: { messagesIds: { set: [newMessage.id] } },
      });
    }
    const recieverSocketId = getRecieverId(receiverId);
    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json({ message: "Message sent successfully", newMessage });
  } catch (error) {
    console.log(error, "error in sendMessage");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { id, receiverId } = req.params;
  console.log(id, receiverId);
  if (!id) {
    return res.status(400).json({ message: "Unauthorized" });
  }
  if (userId !== id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const conversation = await prisma.conversation.findFirst({
      where: {
        usersIds: {
          hasEvery: [id, receiverId],
        },
      },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });

    console.log(conversation);
    if (!conversation) {
      return res.status(200).json({ messages: [] });
    }

    // const messages =
    //   (await prisma.message.findMany({
    //     where: {
    //       AND: [{ conversationId: conversation?.id }],
    //     },
    //     orderBy: { createdAt: "asc" },
    //   })) || [];

    res.status(200).json({ messages: conversation.messages || [] });
  } catch (error) {
    console.log(error, "error in getConversations");
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Unauthorized" });
  }
  if (userId !== id) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: id } },
      select: { id: true, fullname: true, avatar: true },
    });
    res.status(200).json({ users: users || [] });
  } catch (error) {
    console.log(error, "error in getConversations");
    res.status(500).json({ message: "Internal server error" });
  }
};
