export enum DIALOG_TYPE {
  INFO = "info",
  ERROR = "error",
  WARNING = "warning",
  SUCCESS = "success", // 新增成功类型
}
// rtc消息on
export enum SOCKET_ON_RTC {
  // rtc 建立连接回调
  CANDIDATE = "candidate",
  // 发起者发送offer
  OFFER = "offer",
  // 接收者发送answer
  ANSWER = "answer",
}
// 系统消息on
export enum SOCKET_ON_SYS {
  // 连接socket
  CONNECTION = "connection",
  // 断开socket
  DISCONNECT = "disconnect",
  USER_LIST = "user_list",
}
export enum SOCKET_EMIT {
  SYS_USER_LIST = "user_list",
}
