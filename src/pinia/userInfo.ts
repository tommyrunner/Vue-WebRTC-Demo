import { defineStore } from "pinia";
import { UserItem } from "./type";

export const useUserInfo = defineStore("userInfo", {
  // 推荐使用 完整类型推断的箭头函数
  state: () => {
    return {
      userList: [] as UserItem[],
      userInfo: {
        username: "",
        toUserName: "",
      },
    };
  },
});
