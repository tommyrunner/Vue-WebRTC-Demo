import { Socket, io } from "socket.io-client";
import { DIALOG_TYPE, SOCKET_ON_SYS } from "./enum";
import { useUserInfo } from "./pinia/userInfo";
import { showDiaLog } from "./utils";

export default class SocketControl {
  socket: Socket | undefined;
  username: String;
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
        res({});
        this.sys();
      });
    });
  }
  //   系统消息监听
  sys() {
    if (!this.socket) {
      showDiaLog({ type: DIALOG_TYPE.WARNING, msg: "请先连接!" });
      return;
    }
    this.socket.on(SOCKET_ON_SYS.USER_LIST, (data) => {
      //   console.log(data);
      this.userInfo.userList = data;
    });
  }
}

// export default function SocketOn(socket: Socket) {
//   socket.on("connect", () => {
//     LoginRef.value.close();
//     showDiaLog({ type: DIALOG_TYPE.SUCCESS, msg: "连接成功" });
//     initVideo(localVideoRef.value);
//   });
//   socket.on("user_list", (data) => {
//     console.log(data);
//   });
//   socket.on("pc offer", async (res: { data: RTCSessionDescriptionInit }) => {
//     // 接收倒offer
//     console.log("接收倒offer", res);
//     let remoteDesc = res.data;
//     // 创建 answer
//     await remotePc.setRemoteDescription(remoteDesc);
//     let remoteAnswer = await remotePc.createAnswer();
//     await remotePc.setLocalDescription(remoteAnswer);
//     socket.emit("pc answer", { data: remoteAnswer, username: stateData.toUserName });
//   });
//   socket.on("pc answer", async (res: { data: RTCSessionDescription }) => {
//     console.log("local接收到 answer", res);
//     let remoteAnswer = res.data;
//     await localPc.setRemoteDescription(remoteAnswer);
//   });
//   socket.on("pc candidate", async (res: { data: RTCIceCandidateInit }) => {
//     let candidate = res.data;
//     console.log("local接收到 candidate：", candidate);
//     // 注意需要先注册监听事件，再添加ice
//     remotePc.ontrack = (e) => {
//       remoteVideoRef.value.srcObject = e.streams[0];
//       remoteVideoRef.value.addEventListener("loadedmetadata", () => {
//         remoteVideoRef.value.play();
//         // 同意的同时向对面发送
//         sendOffer();
//       });
//     };
//     await remotePc.addIceCandidate(candidate);
//   });
// }
