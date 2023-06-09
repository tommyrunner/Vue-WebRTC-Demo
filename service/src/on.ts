import type { UserType } from "./main.d";
import { Socket } from "socket.io";
import { $log } from "./utils";
import { SOCKET_EMIT, SOCKET_ON_RTC, SOCKET_ON_SYS } from "./enum";
/**
 * socket 的全部监听
 * @param socket
 * @param username  当前进入用户
 * @param room  当前进入用户房间
 * @param clients  全部用户
 */
export default function SocketCall(socket: Socket, username: string, room: string, clients: UserType[]) {
  // 收到对等连接创建的消息
  socket.on(SOCKET_ON_RTC.CANDIDATE, (data) => {
    let user = clients.find((c) => c.username === data.username);
    if (!user) {
      console.log("用户已经失联");
      return;
    }
    console.log(data.username, "--测试candidate", user);
    socket.to(user.userId).emit("pc candidate", { user: user.username, data: data.data });
  });
  socket.on(SOCKET_ON_RTC.OFFER, (data) => {
    let user = clients.find((c) => c.username === data.username);
    console.log(data.username, "--测试offer", user);
    if (!user) {
      console.log("用户已经失联");
      return;
    }
    socket.to(user.userId).emit("pc offer", { user: username, data: data.data });
  });
  socket.on(SOCKET_ON_RTC.ANSWER, (data) => {
    let user = clients.find((c) => c.username === data.username);
    console.log(data.username, "--测试answer", user);
    if (!user) {
      console.log("用户已经失联");
      return;
    }
    socket.to(user.userId).emit("pc answer", { user: user.username, data: data.data });
  });
}
