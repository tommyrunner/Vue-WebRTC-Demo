// 返回code
export enum DATA_CODE {
  OK = 200,
  ERROR = 500
}
// rtc on 消息
export enum SOCKET_ON_RTC {
  // rtc 建立连接回调
  CANDIDATE = "candidate",
  // 发起者发送offer
  OFFER = "offer",
  // 接收者发送answer
  ANSWER = "answer",
  // 挂断通话
  USER_OFF = "user_off",
  // 拒绝通话
  USER_REFUST = "user_refust"
}
// 系统 on 消息
export enum SOCKET_ON_SYS {
  // 连接socket
  CONNECTION = "connection",
  // 断开socket
  DISCONNECT = "disconnect",
  // 错误显示
  SYS_ERROR = "sys_error"
}
// 用户on消息
export enum SOCKET_EMIT {
  SYS_USER_LIST = "user_list"
}
// rtc连接消息类型
export enum CALL_TYPE {
  // 发送者
  SENDER = "sender",
  // 接收者
  RECIVER = "reciver"
}
