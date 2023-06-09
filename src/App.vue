<template>
  <div class="context">
    <UserList />
    <div class="right show-box">
      <SvgIcon name="close" class="close" size="48" />
      <!-- 本地视频 -->
      <!-- <AppVideo class="local-video" /> -->
      <!-- remote视频 -->
      <!-- <AppVideo class="remote-video" /> -->
    </div>
  </div>
  <Login @login="onLogin" ref="LoginRef" />

  <!-- 账号
  <input type="text" v-model="stateData.username" />
  <br />
  密码
  <input type="text" v-model="stateData.room" />
  <br />
  拨打用户
  <input type="text" v-model="stateData.toUserName" />
  <video autoplay playsinline controls ref="localVideoRef" style="width: 100px; height: 100px"></video>
  <video autoplay playsinline controls ref="remoteVideoRef" style="width: 200px; height: 200px"></video>
  <button @click="sendOffer">发送</button>
  <button @click="login">进入房间</button> -->
</template>
<script setup lang="ts">
/**
 * TODO: 必须是域名
 * WebRTC使用的信令服务器主要是用于建立和维护端到端通信的会话控制信息的传输。一旦会话建立成功，信令服务器就不再需要参与实时通信过程中的音视频数据传输。因此，在信令服务器关闭后，已经建立的通话仍然可以继续进行，但无法再开始新的通话或重新连接已关闭的通话。
 * 在建立WebRTC连接时，浏览器会自动处理STUN和TURN协议，以确保可靠的通信。因此，即使信令服务器关闭，已经建立的WebRTC连接仍然可以继续运行。这种设计使得WebRTC成为一种高效可靠的实时通讯技术。
 */
import type { StateDataType } from "./app";
import { io, Socket } from "socket.io-client";
import { ref, reactive } from "vue";
import UserList from "./components/UserList.vue";
import SvgIcon from "./components/SvgIcon.vue";
// import AppVideo from "./components/AppVideo.vue";
import Login from "./components/Login.vue";
import { showDiaLog } from "./utils";
import { DIALOG_TYPE } from "./enum";
import SocketControl from "./socket";
const localVideoRef = ref();
const remoteVideoRef = ref();
const LoginRef = ref();
let stateData = reactive<StateDataType>({
  username: "user01",
  toUserName: "user02",
  room: "001",
});
let socket: Socket;

function onLogin(username: string) {
  start(username);
}

const userMediaConfig = {
  // 音频
  // audio: true,
  // 视频
  video: true,
};
const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"],
    },
    {
      urls: ["turn:120.77.253.101:3478"],
      username: "inter_user",
      credential: "power_turn",
    },
  ],
};
let localStream: MediaStream;
let localPc: RTCPeerConnection;
let remotePc = new RTCPeerConnection(rtcConfig);
// function login() {
//   start();
// }
async function start(username: string) {
  let sc = new SocketControl(username);
  await sc.connect();
  LoginRef.value.close();

  // socket.on("connect", () => {
  //   LoginRef.value.close();
  //   showDiaLog({ type: DIALOG_TYPE.SUCCESS, msg: "连接成功" });
  //   initVideo(localVideoRef.value);
  // });
  // socket.on("user_list", (data) => {
  //   console.log(data);
  // });
  // socket.on("pc offer", async (res: { data: RTCSessionDescriptionInit }) => {
  //   // 接收倒offer
  //   console.log("接收倒offer", res);
  //   let remoteDesc = res.data;
  //   // 创建 answer
  //   await remotePc.setRemoteDescription(remoteDesc);
  //   let remoteAnswer = await remotePc.createAnswer();
  //   await remotePc.setLocalDescription(remoteAnswer);
  //   socket.emit("pc answer", { data: remoteAnswer, username: stateData.toUserName });
  // });
  // socket.on("pc answer", async (res: { data: RTCSessionDescription }) => {
  //   console.log("local接收到 answer", res);
  //   let remoteAnswer = res.data;
  //   await localPc.setRemoteDescription(remoteAnswer);
  // });
  // socket.on("pc candidate", async (res: { data: RTCIceCandidateInit }) => {
  //   let candidate = res.data;
  //   console.log("local接收到 candidate：", candidate);
  //   // 注意需要先注册监听事件，再添加ice
  //   remotePc.ontrack = (e) => {
  //     remoteVideoRef.value.srcObject = e.streams[0];
  //     remoteVideoRef.value.addEventListener("loadedmetadata", () => {
  //       remoteVideoRef.value.play();
  //       // 同意的同时向对面发送
  //       sendOffer();
  //     });
  //   };
  //   await remotePc.addIceCandidate(candidate);
  // });
}
async function initVideo(video: HTMLVideoElement) {
  try {
    // userMediaConfig
    let stream = await navigator.mediaDevices.getUserMedia(userMediaConfig);
    video.srcObject = stream;
    localStream = stream;
  } catch (e) {
    console.log("getDisplayMedia() error: ", e);
  }
}
async function sendOffer() {
  // 初始化当前视频
  localPc = new RTCPeerConnection(rtcConfig);
  // 添加RTC流
  localStream.getTracks().forEach((track) => {
    localPc.addTrack(track, localStream);
  });
  // 给当前RTC流设置监听事件(协议完成回调)
  localPc.onicecandidate = function (event) {
    console.log("localPc：", event.candidate, event);
    // 回调时，将自己candidate发给对方，对方可以直接addIceCandidate(candidate)添加可以获取流
    if (event.candidate) socket.emit("pc candidate", { data: event.candidate, username: stateData.toUserName });
  };
  // 发起方：创建offer(成功将offer的设置当前流，并发送给接收方)
  let offer = await localPc.createOffer();
  // 建立连接，此时就会触发onicecandidate，然后注册ontrack
  await localPc.setLocalDescription(offer);
  socket.emit("pc offer", { data: offer, username: stateData.toUserName });
}
</script>
<style lang="less" scoped>
.context {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 12px;
  display: flex;

  .right {
    padding: 12px;
    flex: 1;
    position: relative;
    .local-video {
    }
    .remote-video {
      position: absolute;
      z-index: 2;
      right: 3%;
      top: 3%;
      width: 30% !important;
      height: 30% !important;
      box-shadow: 0px 0px 5px black;
    }
    .close {
      position: absolute;
      z-index: 2;
      bottom: 5%;
      left: 50%;
      transform: translateX(-50%);
      transition: 0.22s;
      cursor: pointer;
      filter: drop-shadow(1px 1px 5px rgba(240, 87, 87, 0.485));
      &:active {
        transform: translateX(-50%) scale(0.9);
      }
    }
  }
}
</style>
