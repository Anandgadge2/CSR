import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { getJwtSecret } from "../config/env";

interface SocketUser {
  id: string;
  email: string;
  roleId?: number;
}

export const registerChatSocket = (io: Server) => {
  io.use((socket: any, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers["authorization"]?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    jwt.verify(token, getJwtSecret(), (err: any, decoded: any) => {
      if (err) {
        return next(new Error("Authentication error: Invalid token"));
      }
      socket.user = decoded as SocketUser;
      next();
    });
  });

  io.on("connection", (socket: Socket & { user?: SocketUser }) => {
    console.log(`User connected to Chat Socket: ${socket.user?.email} (${socket.id})`);

    socket.on("join_room", ({ chatId }) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined room ${chatId}`);
    });

    socket.on("send_message", async ({ chatId, text }) => {
      try {
        if (!socket.user) return;

        const message = await prisma.message.create({
          data: {
            chatId,
            senderUserId: socket.user.id,
            senderId: socket.user.id,
            content: text || "",
            readBy: [socket.user.id]
          },
          include: {
            sender: {
              select: { id: true, email: true, roleId: true }
            }
          }
        });

        await prisma.chat.update({
          where: { id: chatId },
          data: { updatedAt: new Date() }
        });

        io.to(chatId).emit("receive_message", message);
      } catch (err) {
        console.error("Socket send_message error:", err);
      }
    });

    socket.on("typing", ({ chatId }) => {
      socket.to(chatId).emit("user_typing", { email: socket.user?.email });
    });

    socket.on("stop_typing", ({ chatId }) => {
      socket.to(chatId).emit("user_stop_typing", { email: socket.user?.email });
    });

    socket.on("message_read", async ({ chatId, messageId }) => {
      try {
        if (!socket.user) return;

        await prisma.message.update({
          where: { id: messageId },
          data: {
            readBy: {
              push: socket.user.id
            }
          }
        });

        socket.to(chatId).emit("message_read_receipt", { messageId, userId: socket.user.id });
      } catch (err) {
        console.error("Socket message_read error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected from Chat Socket: ${socket.id}`);
    });
  });
};
