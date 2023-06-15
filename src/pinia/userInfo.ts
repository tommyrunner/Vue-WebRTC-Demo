import { defineStore } from "pinia";
import { UserItem } from "./type";

export const useUserInfo = defineStore("userInfo", {
  // 推荐使用 完整类型推断的箭头函数
  state: () => {
    return {
      // 用户列表
      userList: [] as UserItem[],
      // 当前用户信息
      userInfo: {
        username: "", // 当前用
        toUserName: "" // 正在通话用户
      }
    };
  }
});
