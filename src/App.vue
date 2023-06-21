<template>
  <div class="context">
    <UserList @callUser="onCallUser" :callState="callState" />
    <div class="right show-box">
      <div class="close">
        <span class="toast">{{ toast }}</span>
        <Transition name="close">
          <SvgIcon
            name="close"
            size="48"
            color="#fe6c6f"
            @click="onOffCall"
            v-if="callState === CALL_STATE.CONNECT || callState === CALL_STATE.SEND"
          />
        </Transition>
      </div>
      <!-- 本地视频 -->
      <AppVideo
        @click="
          (callState === CALL_STATE.CONNECT && (videoDirection = !videoDirection)) ||
            (!videoDirection && (videoDirection = !videoDirection))
        "
        :class="[videoDirection ? 'local-video' : 'remote-video']"
        ref="localVideoRef"
      />
      <!-- remote视频 -->
      <AppVideo
        @click="videoDirection = !videoDirection"
        :class="[!videoDirection ? 'local-video' : 'remote-video', callState === CALL_STATE.CONNECT ? '' : 'hidden-remote']"
        ref="remoteVideoRef"
      />
    </div>
  </div>
  <!-- 通知窗口 -->
  <Notice ref="noticeRef" @call="onCall" />
  <!-- 登录窗口 -->
  <Login @login="onLogin" ref="loginRef" />
  <!-- 设置窗口 -->
  <Settings />
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import UserList from "./components/UserList.vue";
import SvgIcon from "./components/SvgIcon.vue";
import AppVideo from "./components/AppVideo.vue";
import Login from "./components/Login.vue";
import SocketControl from "./socket";
import { DIALOG_TYPE, SOCKET_ON_RTC, CALL_TYPE, CALL_STATE, SETTINGS_VIDEO } from "./enum";
import { showDiaLog } from "./utils";
import { useUserInfo } from "./pinia/userInfo";
import { useToast } from "@/hooks/useToast";
import Notice from "./components/Notice.vue";
import Settings from "./components/Settings.vue";
const localVideoRef = ref<InstanceType<typeof AppVideo>>();
const remoteVideoRef = ref<InstanceType<typeof AppVideo>>();
const loginRef = ref<InstanceType<typeof Login>>();
const noticeRef = ref<InstanceType<typeof Notice>>();
const userInfo = useUserInfo();
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
let localStream: MediaStream; // 本地stream
let localPc: RTCPeerConnection; // 本地pc连接
let remotePc: RTCPeerConnection; // 对方pc连接
let sc: SocketControl; // socket控制器
let callState = ref<CALL_STATE>(CALL_STATE.WAIT); // 通话状态
let videoDirection = ref(true); // 对方/本地视频位置
let [toast] = useToast(callState); // 通话提示hook
watch(
  () => userInfo.userInfo.username,
  () => {
    // 初始化本地video
    if (localVideoRef.value) {
      initVideo(localVideoRef.value.$el);
      if (loginRef.value) loginRef.value.show(false);
    }
  }
);
// 监听动态设置
watch(
  () => userInfo.settings,
  () => {
    let settings = userInfo.settings;
    if (localVideoRef.value) {
      const localVideo: HTMLVideoElement = localVideoRef.value.$el;
      // 关闭本地声音
      localVideo.muted = !settings.localAudio;
      // 关闭本地视频
      localVideo.style.opacity = settings.localVideo ? "1" : "0";
    }
    // 关闭对方声音
    if (remoteVideoRef.value) {
      const remoteVideo: HTMLVideoElement = remoteVideoRef.value.$el;
      remoteVideo.muted = !settings.remoteAudio;
      // 关闭本地视频
      remoteVideo.style.opacity = settings.remoteVideo ? "1" : "0";
    }
  },
  { deep: true }
);
// 监听切换视频类型
watch(
  () => userInfo.settings.video,
  () => {
    if (localVideoRef.value && userInfo.userInfo.username) {
      const localVideo: HTMLVideoElement = localVideoRef.value.$el;
      // 如果处于通话挂断电话，否则直接切换
      if (callState.value === CALL_STATE.CONNECT) onOffCall();
      initVideo(localVideo);
    }
  }
);
function onLogin(username: string) {
  // 刚进入刷新remote，准备连接对方的pc
  remotePc = new RTCPeerConnection(rtcConfig);
  start(username);
}
// 发起通话
function onCallUser(toUser: string) {
  callState.value = CALL_STATE.SEND; // 记录当前用户是拨打用户
  // 同时发送协议给对方
  sendOffer(toUser, CALL_TYPE.SENDER);
}
// 接通来电
async function onCall(is: boolean) {
  if (!is) {
    // 拒接通话
    sc.emit(SOCKET_ON_RTC.USER_REFUST, {});
    return;
  }
  // 如果当前状态处于通话，先断开通话
  if (callState.value === CALL_STATE.CONNECT) {
    showDiaLog({ type: DIALOG_TYPE.WARNING, msg: "当前处于通话中,请先挂断后重试!" });
    sc.emit(SOCKET_ON_RTC.USER_REFUST, {});
    return;
  }
  // 接收对方的offer并同意通话
  if (remoteVideoRef.value) {
    let video = remoteVideoRef.value.$el;
    if (remoteVideoRef.value) video.play();
    // 同意方，无需提醒重新接听
    if (userInfo.userInfo.toUserName && callState.value !== CALL_STATE.SEND) {
      callState.value = CALL_STATE.CONNECT; // 同意通话，并设置自己状态为通话中
      sendOffer(userInfo.userInfo.toUserName, CALL_TYPE.RECIVER);
    } else showDiaLog({ type: DIALOG_TYPE.WARNING, msg: "当前处于拨打中..." });
  }
}
// 点击挂断
function onOffCall() {
  // 清空状态
  clearState(CALL_STATE.OFF);
  sc.emit(SOCKET_ON_RTC.USER_OFF, {});
}
// 初始化本地视频
async function initVideo(video: HTMLVideoElement) {
  if (!video) return;
  let settings = userInfo.settings;
  try {
    let config = {
      video: settings.localVideo || false,
      audio: settings.localAudio || false
    };
    // userMediaConfig ,getDisplayMedia共享屏幕
    let stream = await navigator.mediaDevices[settings.video === SETTINGS_VIDEO.DISPLAY ? "getDisplayMedia" : "getUserMedia"](
      config
    );
    video.srcObject = stream;
    localStream = stream;
    video.play();
  } catch (e) {
    console.log(`${settings.video} error: `, e);
  }
}
// 清空状态
function clearState(state: CALL_STATE) {
  // 设置状态
  callState.value = state;
  // 关闭remote pc通道
  remotePc.close();
  // 清除video监听完成事件
  if (remoteVideoRef.value) remoteVideoRef.value.$el.oncanplay = null;
  setTimeout(() => {
    userInfo.userInfo.toUserName = ""; // 清空对方信息
    callState.value = CALL_STATE.WAIT; // 归回状态
  }, 1000);
}
// 开始接听rtc协议连接
async function start(username: string) {
  sc = new SocketControl(username);
  // 监听《接收者》是否挂断
  sc.user_off(async () => {
    // 清空状态
    clearState(CALL_STATE.OFF);
  });
  // 监听《接收者》是否拒接
  sc.user_refus(async () => {
    // 清空状态
    clearState(CALL_STATE.REFUSE);
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
      // 如果是发起者需要对方同意，如果是接收者直接播放
      if (noticeRef.value && res.callType === CALL_TYPE.SENDER) noticeRef.value.showNotice(res.toUsername);
      else {
        video.oncanplay = () => {
          video.play();
          callState.value = CALL_STATE.CONNECT; // 接收者设置状态通话中
        };
      }
    };
    // 添加ice
    const candidate = res.data;
    await remotePc.addIceCandidate(candidate);
  });
}
/**
 * 发起协议offer
 * @param toUser 拨打用户
 * @param callType 当前用户协议状态
 */
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
  overflow: hidden;

  .right {
    flex: 1;
    position: relative;
    .local-video {
      position: absolute;
      transition: 0.6s;
      right: 0px;
      top: 0px;
    }
    .remote-video {
      cursor: pointer;
      position: absolute;
      z-index: 2;
      right: 12px;
      top: 12px;
      width: 300px !important;
      height: 400px !important;
      box-shadow: 0px 0px 5px black;
      transition: 0.6s;
    }
    .hidden-remote {
      transform: scale(0);
    }
    .close {
      position: absolute;
      z-index: 2;
      bottom: 50px;
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
.close-enter-active {
  animation: close-in 0.5s;
}
.close-leave-active {
  animation: close-in 0.5s reverse;
}
@keyframes close-in {
  0% {
    opacity: 0;
    transform: translateY(100px);
  }
  100% {
    opacity: 1;
    transform: translateY(0px);
  }
}
</style>
