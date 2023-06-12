"use strict";
import type { UserType } from "./main.d";
import express from "express";
import { SOCKET_EMIT, SOCKET_ON_SYS } from "./enum";
import SocketCall from "./on";
import initApp from "./config";
import { $log } from "./utils";
import { Socket } from "socket.io";
let app = express();
// 初始化应用
let io = initApp(app);
// 存储连接用户信息
let clients: UserType[] = [];

io.on(SOCKET_ON_SYS.CONNECTION, function (socket) {
  let query = socket.handshake.query;
  // 用户名
  let username = query.username as string;
  // 房间
  let room = query.room as string;
  if (!room || !username) {
    console.log("未找到用户或房间");
    return;
  }
  // 连接管理
  if (clients.some(v => v.username === username)) {
    console.log(`${username} 重新连接`);
    clients = clients.filter(c => username !== username);
  }
  clients.push({ userId: socket.id, username });
  $log(`---${username}---(连接)`);
  // 房间管理
  socket.join(room);
  // 每次连接向房间发送用户列表
  io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, clients);
  SocketCall(socket, username, room, clients);
  // 断开连接了
  socket.on(SOCKET_ON_SYS.DISCONNECT, () => {
    $log(`----${username}----(断开连接)`);
    // 每次连接发送用户列表
    clients = clients.filter(c => c.username !== username);
    io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, clients);
  });
});
