import { SETTINGS_VIDEO } from "@/enum";
import { defineStore } from "pinia";
import { UserItem } from "./type";

export const useUserInfo = defineStore("userInfo", {
  // 推荐使用 完整类型推断的箭头函数
  state: () => {
    return {
      // 用户列表
      userList: [] as UserItem[],
      // 设置参数
      settings: {
        video: SETTINGS_VIDEO.USER, // 视频类型
        localAudio: true, // 本地声音
        remoteAudio: true, // 对方声音
        localVideo: true, // 本地视频
        remoteVideo: true // 对方视频
      },
      // 当前用户信息
      userInfo: {
        username: "", // 当前用
        toUserName: "" // 正在通话用户
      }
    };
  }
});
