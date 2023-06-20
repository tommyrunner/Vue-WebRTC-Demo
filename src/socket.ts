import { Socket, io } from "socket.io-client";
import { CALL_TYPE, DIALOG_TYPE, SOCKET_ON_RTC, SOCKET_ON_SYS } from "./enum";
import { useUserInfo } from "./pinia/userInfo";
import { ResRtcType, RtcEmitParams, RtcFun } from "./type";
import { showDiaLog } from "./utils";
import { baseUrl } from "@/config";
console.log(baseUrl);

// socket 控制类
export default class SocketControl {
  socket: Socket = io();
  username: string;
  userInfo;
  constructor(username: string) {
    this.username = username;
    this.userInfo = useUserInfo();
    // 连接socket
    this.connect();
  }
  async connect() {
    return new Promise(res => {
      if (this.userInfo.userList.find(u => u.username === this.username)) {
        showDiaLog({ type: DIALOG_TYPE.WARNING, msg: "连接失败,用户名也就存在!" });
        return;
      }
      this.socket = io(baseUrl, {
        path: "/rtc",
        query: { username: this.username, room: "001" }
      });
      res({});
      if (!this.socket) {
        showDiaLog({ type: DIALOG_TYPE.WARNING, msg: "请先连接!" });
      } else {
        this.sys(this.socket);
      }
    });
  }
  getSocket() {
    return this.socket;
  }
  //   系统消息监听
  sys(socket: Socket) {
    socket.on(SOCKET_ON_SYS.USER_LIST, data => {
      this.userInfo.userList = data;
    });
    this.socket.on(SOCKET_ON_SYS.CONNECTION, () => {
      showDiaLog({ type: DIALOG_TYPE.SUCCESS, msg: "连接成功" });
      // 储存当前用户
      this.userInfo.userInfo.username = this.username;
    });
    this.socket.on(SOCKET_ON_SYS.CONNECTION_ERROR, () => {
      showDiaLog({ type: DIALOG_TYPE.ERROR, msg: "连接失败:可能用户名已经被使用!" });
    });
  }
  emit<T>(key: SOCKET_ON_RTC, data: T, callType?: CALL_TYPE) {
    let params: RtcEmitParams<T> = {
      toUsername: this.userInfo.userInfo.toUserName,
      nowUsername: this.userInfo.userInfo.username,
      data,
      callType
    };
    this.socket.emit(key, params);
  }
  user_off(fun: RtcFun) {
    this.socket.on(SOCKET_ON_RTC.USER_OFF, async (res: Required<ResRtcType>) => {
      // 挂断通话
      console.log(`挂断通话 ${res.toUsername}`);
      fun({
        ...res
      });
    });
  }
  user_refus(fun: RtcFun) {
    this.socket.on(SOCKET_ON_RTC.USER_REFUST, async (res: Required<ResRtcType>) => {
      // 挂断通话
      console.log(`拒绝 ${res.toUsername} 通话`);
      fun({
        ...res
      });
    });
  }
  rtc_offer(fun: RtcFun<RTCSessionDescription>) {
    this.socket.on(SOCKET_ON_RTC.OFFER, async (res: Required<ResRtcType>) => {
      // 接收倒offer
      console.log(`接收倒 ${res.toUsername} offer`);
      fun({
        ...res
      });
    });
  }
  rtc_answer(fun: RtcFun<RTCSessionDescriptionInit>) {
    this.socket.on(SOCKET_ON_RTC.ANSWER, async (res: Required<ResRtcType>) => {
      // 接收倒answer
      console.log(`接收倒 ${res.toUsername} answer`);
      fun({
        ...res
      });
    });
  }
  rtc_candidate(fun: RtcFun<RTCIceCandidateInit>) {
    this.socket.on(SOCKET_ON_RTC.CANDIDATE, async (res: Required<ResRtcType>) => {
      // 接收倒answer
      console.log(`建立连接 ${res.toUsername} candidate回调`);
      fun({
        ...res
      });
    });
  }
}
