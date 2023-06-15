import { Socket } from "socket.io";
import { $log } from "./utils";
import { SOCKET_ON_RTC } from "./enum";
import { ResRtcType } from "./type";
import Clients from "./clients";
/**
 * rtc 监听
 * @param socket 初始后的socket
 * @param clients  全部用户
 */
export default function SocketRtc(socket: Socket, clients: Clients) {
  // 接收到《接收者》发送candidate连接成功消息，转发给《接收者》
  socket.on(SOCKET_ON_RTC.CANDIDATE, (data: ResRtcType) => {
    $log(`---转发candidate---(${data.toUsername})`);
    let user = clients.get(data.toUsername);
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
  // 接收到《发起者》发送offer，转发给《接收者》
  socket.on(SOCKET_ON_RTC.OFFER, (data: ResRtcType) => {
    $log(`---转发offer---(${data.toUsername})`);
    let user = clients.get(data.toUsername);
    if (user) {
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
  // 接收到《接收者》发送answer，转发给《发起者》
  socket.on(SOCKET_ON_RTC.ANSWER, (data: ResRtcType) => {
    $log(`---转发answer---(${data.toUsername})`);
    let user = clients.get(data.toUsername);
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
  // 接收到《发起者》||《接收者》发起挂断电话，转发给《发起者》||《接收者》
  socket.on(SOCKET_ON_RTC.USER_OFF, (data: ResRtcType) => {
    let user = clients.get(data.toUsername);
    $log(`----${data.nowUsername}----(挂断通话)`);
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
  //  接收到《接收者》发起拒绝接听，转发给《发起者》
  socket.on(SOCKET_ON_RTC.USER_REFUST, (data: ResRtcType) => {
    let user = clients.get(data.toUsername);
    $log(`----${data.nowUsername}----(拒绝通话)`);
    if (user) {
      let params: ResRtcType = {
        data: null,
        nowUsername: user.username,
        toUsername: data.toUsername
      };
      socket.to(user.userId).emit(SOCKET_ON_RTC.USER_REFUST, params);
    } else {
      $log(`---拒绝通话:用户失联---(${data.toUsername})`);
    }
  });
}
