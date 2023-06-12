import type { UserType } from "./main.d";
import { Socket } from "socket.io";
import { $log } from "./utils";
import { SOCKET_EMIT, SOCKET_ON_RTC, SOCKET_ON_SYS } from "./enum";
import { ResRtcType, ResType, RtcSocketType } from "./type";
/**
 * socket 的全部监听
 * @param socket
 * @param username  当前进入用户
 * @param room  当前进入用户房间
 * @param clients  全部用户
 */
export default function SocketCall(socket: Socket, username: string, room: string, clients: UserType[]) {
  // 收到对等连接创建的消息
  socket.on(SOCKET_ON_RTC.CANDIDATE, (data: ResRtcType) => {
    let user = clients.find(c => c.username === data.toUsername);
    $log(`---转发candidate---(${data.toUsername})--${data.callType}`);
    if (!user) {
      let msg = `error:用户已经失联---(${data.toUsername})`;
      $log(msg);
      // 返回前端显示
      let nowUser = clients.find(c => c.username === data.nowUsername);
      if (nowUser) socket.to(nowUser.userId).emit(SOCKET_ON_SYS.SYS_ERROR, { msg });
      return;
    }
    let params: ResRtcType = {
      data: data.data,
      toUsername: data.nowUsername,
      nowUsername: data.toUsername,
      callType: data.callType
    };
    socket.to(user.userId).emit(SOCKET_ON_RTC.CANDIDATE, params);
  });
  socket.on(SOCKET_ON_RTC.OFFER, (data: ResRtcType) => {
    let user = clients.find(c => c.username === data.toUsername);
    $log(`---转发offer---(${data.toUsername})`);
    if (!user) {
      let msg = `error:用户已经失联---(${data.toUsername})`;
      $log(msg);
      // 返回前端显示
      let nowUser = clients.find(c => c.username === data.nowUsername);
      if (nowUser) socket.to(nowUser.userId).emit(SOCKET_ON_SYS.SYS_ERROR, { msg });
      return;
    }
    // toUsername:发起人,username:接收人
    let params: ResRtcType = {
      data: data.data,
      toUsername: data.nowUsername,
      nowUsername: data.toUsername,
      callType: data.callType
    };
    socket.to(user.userId).emit(SOCKET_ON_RTC.OFFER, params);
  });
  socket.on(SOCKET_ON_RTC.ANSWER, (data: ResRtcType) => {
    let user = clients.find(c => c.username === data.toUsername);
    $log(`---转发answer---(${data.toUsername})`);
    if (!user) {
      let msg = `error:用户已经失联---(${data.toUsername})`;
      $log(msg);
      // 返回前端显示
      let nowUser = clients.find(c => c.username === data.nowUsername);
      if (nowUser) socket.to(nowUser.userId).emit(SOCKET_ON_SYS.SYS_ERROR, { msg });
      return;
    }
    let params: ResRtcType = {
      data: data.data,
      nowUsername: user.username,
      toUsername: data.toUsername,
      callType: data.callType
    };
    socket.to(user.userId).emit(SOCKET_ON_RTC.ANSWER, params);
  });
}
