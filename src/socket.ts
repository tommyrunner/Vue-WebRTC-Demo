import { Socket, io } from "socket.io-client";
import { DIALOG_TYPE, SOCKET_ON_RTC, SOCKET_ON_SYS } from "./enum";
import { useUserInfo } from "./pinia/userInfo";
import { ResRtcType, ResType, RtcFun } from "./type";
import { showDiaLog } from "./utils";

export default class SocketControl {
  socket: Socket = io();
  username: string;
  userInfo;
  constructor(username: string) {
    this.username = username;
    this.userInfo = useUserInfo();
  }
  async connect() {
    return new Promise((res) => {
      if (this.userInfo.userList.find((u) => u.username === this.username)) {
        showDiaLog({ type: DIALOG_TYPE.WARNING, msg: "连接失败,用户名也就存在!" });
        return;
      }
      this.socket = io("ws://localhost:3003/", {
        path: "/rtc",
        query: { username: this.username, room: "001" },
      });
      this.socket.on("connect", () => {
        showDiaLog({ type: DIALOG_TYPE.SUCCESS, msg: "连接成功" });
        this.userInfo.userInfo.username = this.username;
        res({});
        if (!this.socket) {
          showDiaLog({ type: DIALOG_TYPE.WARNING, msg: "请先连接!" });
        } else {
          this.sys(this.socket);
        }
      });
    });
  }
  getSocket() {
    return this.socket;
  }
  //   系统消息监听
  sys(socket: Socket) {
    socket.on(SOCKET_ON_SYS.USER_LIST, (data) => {
      this.userInfo.userList = data;
    });
    socket.on(SOCKET_ON_SYS.SYS_ERROR, (data: ResType) => {
      showDiaLog({ type: DIALOG_TYPE.ERROR, msg: String(data.msg) });
    });
  }
  rtc_offer(fun: RtcFun<RTCSessionDescription>) {
    this.socket.on(SOCKET_ON_RTC.OFFER, async (res: ResRtcType) => {
      // 接收倒offer
      console.log(`接收倒 ${res.toUsername} offer`);
      fun({
        ...res,
        data: res.data,
      });
    });
  }
  rtc_answer(fun: RtcFun<RTCSessionDescriptionInit>) {
    this.socket.on(SOCKET_ON_RTC.ANSWER, async (res: ResRtcType) => {
      // 接收倒answer
      console.log(`接收倒 ${res.toUsername} answer`);
      fun({
        ...res,
        data: res.data,
      });
    });
  }
  rtc_candidate(fun: RtcFun<RTCIceCandidateInit>) {
    this.socket.on(SOCKET_ON_RTC.CANDIDATE, async (res: ResRtcType) => {
      // 接收倒answer
      console.log(`建立连接 ${res.toUsername} candidate回调`);
      fun({
        ...res,
        data: res.data,
      });
    });
  }
}
