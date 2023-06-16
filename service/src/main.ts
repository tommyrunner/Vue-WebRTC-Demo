"use strict";
import { SOCKET_EMIT, SOCKET_ON_SYS } from "./enum";
import SocketRtc from "./on";
import initApp from "./config";
import { $log } from "./utils";
import Clients from "./clients";
// 初始化应用
let io = initApp();
// 内存存储连接用户信息
let clients = new Clients();
// 连接之前判断是否名字重复
io.use((socket, next) => {
  let query = socket.handshake.query;
  if (query.username) {
    if (clients.data.some(c => c.username === query.username)) {
      next(new Error("用户名已经被使用"));
    } else next();
  } else {
    next(new Error("参数错误"));
  }
});
// 监听连接
io.on(SOCKET_ON_SYS.CONNECTION, function (socket) {
  // 获取连接参数(用户名,房间号(备用))
  const query = socket.handshake.query;
  const username = query.username as string;
  const room = query.room as string;
  if (!room || !username) {
    console.log("未找到用户或房间");
    return;
  }
  // 连接管理
  let nowUser = { userId: socket.id, username };
  clients.add(nowUser);
  // 房间管理
  socket.join(room);
  // 每次连接向房间发送用户列表
  io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, clients.data);
  // 管理rtc的监听事件
  SocketRtc(socket, clients);
  // 断开连接了
  socket.on(SOCKET_ON_SYS.DISCONNECT, () => {
    $log(`----${username}----(断开连接)`);
    clients.remove(nowUser.username);
    // 每次连接发送用户列表
    io.to(room).emit(SOCKET_EMIT.SYS_USER_LIST, clients.data);
  });
});
