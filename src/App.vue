<template>
  <Notice ref="noticeRef" @call="onCall" />
  <div class="context">
    <UserList @callUser="onCallUser" />
    <div class="right show-box">
      <SvgIcon name="close" class="close" size="48" />
      <!-- 本地视频 -->
      <AppVideo class="local-video" ref="localVideoRef" />
      <!-- remote视频 -->
      <AppVideo class="remote-video" ref="remoteVideoRef" />
    </div>
  </div>
  <Login @login="onLogin" ref="loginRef" />
</template>
<script setup lang="ts">
/**
 * TODO: 必须是域名
 * WebRTC使用的信令服务器主要是用于建立和维护端到端通信的会话控制信息的传输。一旦会话建立成功，信令服务器就不再需要参与实时通信过程中的音视频数据传输。因此，在信令服务器关闭后，已经建立的通话仍然可以继续进行，但无法再开始新的通话或重新连接已关闭的通话。
 * 在建立WebRTC连接时，浏览器会自动处理STUN和TURN协议，以确保可靠的通信。因此，即使信令服务器关闭，已经建立的WebRTC连接仍然可以继续运行。这种设计使得WebRTC成为一种高效可靠的实时通讯技术。
 */
import { ref } from "vue";
import UserList from "./components/UserList.vue";
import SvgIcon from "./components/SvgIcon.vue";
import AppVideo from "./components/AppVideo.vue";
import Login from "./components/Login.vue";
import SocketControl from "./socket";
import { DIALOG_TYPE, SOCKET_ON_RTC } from "./enum";
import { showDiaLog } from "./utils";
import { useUserInfo } from "./pinia/userInfo";
import Notice from "./components/Notice.vue";
const localVideoRef = ref<InstanceType<typeof AppVideo>>();
const remoteVideoRef = ref<InstanceType<typeof AppVideo>>();
const loginRef = ref();
const noticeRef = ref<InstanceType<typeof Notice>>();
const userInfo = useUserInfo();
let sc: SocketControl;
const userMediaConfig = {
  // 音频
  // audio: true,
  // 视频
  video: true
};
const rtcConfig: RTCConfiguration = {
  iceServers: [
    {
      urls: ["stun:stun.l.google.com:19302"]
    },
    {
      urls: ["turn:120.77.253.101:3478"],
      username: "inter_user",
      credential: "power_turn"
    }
  ]
};
let localStream: MediaStream;
let localPc: RTCPeerConnection;
let remotePc = new RTCPeerConnection(rtcConfig);
function onLogin(username: string) {
  start(username);
}
function onCallUser(toUser: string) {
  sendOffer(toUser);
}
// 接收对方的offer并同意通话
async function onCall() {
  // if (!remoteRes) {
  //   showDiaLog({ type: DIALOG_TYPE.ERROR, msg: "对方已经挂断!" });
  //   return;
  // }
  if (remoteVideoRef.value) remoteVideoRef.value.$el.play();
}
async function start(username: string) {
  sc = new SocketControl(username);
  await sc.connect();
  loginRef.value.close();
  // 初始化本地video
  if (localVideoRef.value) initVideo(localVideoRef.value.$el);
  // 接收offer创建answer转发
  sc.rtc_offer(async res => {
    // 创建 answer
    const remoteDesc = res.data;
    await remotePc.setRemoteDescription(remoteDesc);
    let remoteAnswer = await remotePc.createAnswer();
    await remotePc.setLocalDescription(remoteAnswer);
    sc.socket.emit(SOCKET_ON_RTC.ANSWER, {
      data: remoteAnswer,
      nowUsername: res.nowUsername,
      toUsername: res.toUsername
    });
  });
  // 接收answer
  sc.rtc_answer(async res => {
    let remoteAnswer = res.data;
    // 完善本地remote描述
    await localPc.setRemoteDescription(remoteAnswer);
  });
  // candidate回调
  sc.rtc_candidate(async res => {
    // 回调显示
    if (!remoteVideoRef.value) return;
    let video: HTMLVideoElement = remoteVideoRef.value.$el;
    remotePc.ontrack = e => {
      video.srcObject = e.streams[0];
      video.addEventListener("loadedmetadata", () => {
        // 来电话了
        if (noticeRef.value) noticeRef.value.showNotice(res.toUsername);
        // video.play();
        // 同意的同时向对面发送
        // if (res.toUsername) sendOffer(res.toUsername);
      });
    };
    // 添加ice
    const candidate = res.data;
    await remotePc.addIceCandidate(candidate);
  });
}
async function initVideo(video: HTMLVideoElement) {
  if (!video) return;
  try {
    // userMediaConfig
    let stream = await navigator.mediaDevices.getUserMedia(userMediaConfig);
    video.srcObject = stream;
    localStream = stream;
    video.play();
  } catch (e) {
    console.log("getDisplayMedia() error: ", e);
  }
}
async function sendOffer(toUser: string) {
  if (!sc.socket) {
    showDiaLog({ type: DIALOG_TYPE.WARNING, msg: "请先连接!" });
    return;
  }
  // 初始化当前视频
  localPc = new RTCPeerConnection(rtcConfig);
  // 添加RTC流
  localStream.getTracks().forEach(track => {
    localPc.addTrack(track, localStream);
  });
  // 给当前RTC流设置监听事件(协议完成回调)
  localPc.onicecandidate = function (event) {
    console.log("localPc:", event.candidate, event);
    // 回调时，将自己candidate发给对方，对方可以直接addIceCandidate(candidate)添加可以获取流
    if (event.candidate)
      sc.socket.emit(SOCKET_ON_RTC.CANDIDATE, {
        data: event.candidate,
        toUsername: toUser,
        nowUsername: userInfo.userInfo.username
      });
  };
  // 发起方：创建offer(成功将offer的设置当前流，并发送给接收方)
  let offer = await localPc.createOffer();
  // 建立连接，此时就会触发onicecandidate，然后注册ontrack
  await localPc.setLocalDescription(offer);
  sc.socket.emit(SOCKET_ON_RTC.OFFER, { data: offer, toUsername: toUser, nowUsername: userInfo.userInfo.username });
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