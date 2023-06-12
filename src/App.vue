<template>
  <Notice ref="noticeRef" @call="onCall" />
  <div class="context">
    <UserList @callUser="onCallUser" :callState="callState" />
    <div class="right show-box">
      <div class="close">
        <span class="toast">{{ toast }}</span>
        <SvgIcon name="close" size="48" color="#fe6c6f" @click="onOffCall" />
      </div>
      <!-- 本地视频 -->
      <AppVideo class="local-video" ref="localVideoRef" style="opacity: 0.03" />
      <!-- remote视频 -->
      <AppVideo class="remote-video" ref="remoteVideoRef" style="opacity: 0.03" />
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
import { DIALOG_TYPE, SOCKET_ON_RTC, CALL_TYPE, CALL_STATE } from "./enum";
import { showDiaLog } from "./utils";
import { useUserInfo } from "./pinia/userInfo";
import { useToast } from "@/hooks/useToast";
import Notice from "./components/Notice.vue";
const localVideoRef = ref<InstanceType<typeof AppVideo>>();
const remoteVideoRef = ref<InstanceType<typeof AppVideo>>();
const loginRef = ref();
const noticeRef = ref<InstanceType<typeof Notice>>();
const userInfo = useUserInfo();
let sc: SocketControl;
let callState = ref<CALL_STATE>(CALL_STATE.WAIT);
let [toast] = useToast(callState);
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
let remotePc: RTCPeerConnection;
function onLogin(username: string) {
  // 刚进入刷新remote，准备对方的pc连接
  remotePc = new RTCPeerConnection(rtcConfig);
  start(username);
}
function onCallUser(toUser: string) {
  callState.value = CALL_STATE.SEND; // 记录当前用户是拨打用户
  sendOffer(toUser, CALL_TYPE.SENDER);
}
// 接收对方的offer并同意通话
async function onCall() {
  if (remoteVideoRef.value) {
    let video = remoteVideoRef.value.$el;
    if (remoteVideoRef.value) video.play();
    // 同意方，无需提醒重新接听
    if (userInfo.userInfo.toUserName && callState.value !== CALL_STATE.SEND) {
      callState.value = CALL_STATE.CONNECT; // 同意通话，并设置自己状态为通话中
      sendOffer(userInfo.userInfo.toUserName, CALL_TYPE.RECIVER);
    }
  }
}
async function start(username: string) {
  sc = new SocketControl(username);
  await sc.connect();
  loginRef.value.close();
  // 初始化本地video
  if (localVideoRef.value) initVideo(localVideoRef.value.$el);
  // 监听到对面挂断了电话
  sc.user_refus(async () => {
    // 设置接听方状态
    callState.value = CALL_STATE.OFF;
    setTimeout(() => {
      callState.value = CALL_STATE.WAIT;
    }, 1000);
  });
  // 接收offer创建answer转发
  sc.rtc_offer(async res => {
    // 创建 answer
    const remoteDesc = res.data;
    remotePc = new RTCPeerConnection(rtcConfig);
    await remotePc.setRemoteDescription(remoteDesc);
    let remoteAnswer = await remotePc.createAnswer();
    await remotePc.setLocalDescription(remoteAnswer);
    sc.emit(SOCKET_ON_RTC.ANSWER, remoteAnswer, res.callType);
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
    // 记录来电人
    userInfo.userInfo.toUserName = res.toUsername;
    let video: HTMLVideoElement = remoteVideoRef.value.$el;
    remotePc.ontrack = e => {
      video.srcObject = e.streams[0];
      video.addEventListener("loadedmetadata", () => {
        // 来电话了
        // 如果是发起者需要对方同意，如果是接收者直接播放
        if (noticeRef.value && res.callType === CALL_TYPE.SENDER) noticeRef.value.showNotice(res.toUsername);
        else if (noticeRef.value) {
          video.play();
          callState.value = CALL_STATE.CONNECT; // 接收者设置状态通话中
        }
      });
    };
    // 添加ice
    const candidate = res.data;
    await remotePc.addIceCandidate(candidate);
  });
}
function onOffCall() {
  // 设置接听方状态
  callState.value = CALL_STATE.OFF;
  setTimeout(() => {
    callState.value = CALL_STATE.WAIT;
  }, 1000);
  sc.emit(SOCKET_ON_RTC.USER_OFF, {});
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
async function sendOffer(toUser: string, callType: CALL_TYPE) {
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
    if (event.candidate) sc.emit(SOCKET_ON_RTC.CANDIDATE, event.candidate, callType);
  };
  // 记录给谁打电话
  userInfo.userInfo.toUserName = toUser;
  // 发起方：创建offer(成功将offer的设置当前流，并发送给接收方)
  let offer = await localPc.createOffer();
  // 建立连接，此时就会触发onicecandidate，然后注册ontrack
  await localPc.setLocalDescription(offer);
  sc.emit(SOCKET_ON_RTC.OFFER, offer, callType);
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
      display: flex;
      flex-direction: column;
      align-items: center;
      transform: translateX(-50%);
      .svg-icon {
        transition: 0.22s;
        cursor: pointer;
        filter: drop-shadow(1px 1px 5px rgba(240, 87, 87, 0.485));
        &:active {
          transform: scale(0.9);
        }
      }
      span {
        color: gainsboro;
        margin-bottom: 12px;
      }
    }
  }
}
</style>
