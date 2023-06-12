import type { UserType } from "./main.d";
import { Socket } from "socket.io";
import { $log } from "./utils";
import { SOCKET_ON_RTC } from "./enum";
import { ResRtcType } from "./type";
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
    $log(`---转发candidate---(${data.toUsername})`);
    if (user) {
      let params: ResRtcType = {
        data: data.data,
        toUsername: data.nowUsername,
        nowUsername: data.toUsername,
        callType: data.callType
      };
      socket.to(user.userId).emit(SOCKET_ON_RTC.CANDIDATE, params);
    } else {
      $log(`---candidate:用户失联---(${data.toUsername})`);
    }
  });
  socket.on(SOCKET_ON_RTC.OFFER, (data: ResRtcType) => {
    let user = clients.find(c => c.username === data.toUsername);
    $log(`---转发offer---(${data.toUsername})`);
    if (user) {
      // toUsername:发起人,username:接收人
      let params: ResRtcType = {
        data: data.data,
        toUsername: data.nowUsername,
        nowUsername: data.toUsername,
        callType: data.callType
      };
      socket.to(user.userId).emit(SOCKET_ON_RTC.OFFER, params);
    } else {
      $log(`---offer:用户失联---(${data.toUsername})`);
    }
  });
  socket.on(SOCKET_ON_RTC.ANSWER, (data: ResRtcType) => {
    let user = clients.find(c => c.username === data.toUsername);
    $log(`---转发answer---(${data.toUsername})`);
    if (user) {
      let params: ResRtcType = {
        data: data.data,
        nowUsername: user.username,
        toUsername: data.toUsername,
        callType: data.callType
      };
      socket.to(user.userId).emit(SOCKET_ON_RTC.ANSWER, params);
    } else {
      $log(`---answer:用户失联---(${data.toUsername})`);
    }
  });
  // 用法发起挂断电话
  socket.on(SOCKET_ON_RTC.USER_OFF, (data: ResRtcType) => {
    $log(`----${data.nowUsername}----(挂断通话)`);
    let user = clients.find(c => c.username === data.toUsername);
    if (user) {
      let params: ResRtcType = {
        data: null,
        nowUsername: user.username,
        toUsername: data.toUsername
      };
      socket.to(user.userId).emit(SOCKET_ON_RTC.USER_OFF, params);
    } else {
      $log(`---挂断通话:用户失联---(${data.toUsername})`);
    }
  });
}
