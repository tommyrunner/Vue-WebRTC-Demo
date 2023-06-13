export enum DIALOG_TYPE {
  INFO = "info",
  ERROR = "error",
  WARNING = "warning",
  SUCCESS = "success" // 新增成功类型
}
// 消息code
export enum DATA_CODE {
  OK = 200,
  ERROR = 500
}
// rtc消息on
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
// 系统消息on
export enum SOCKET_ON_SYS {
  // 连接socket
  CONNECTION = "connection",
  // 断开socket
  DISCONNECT = "disconnect",
  // 用户列表
  USER_LIST = "user_list",
  // 错误显示
  SYS_ERROR = "sys_error"
}
export enum SOCKET_EMIT {
  SYS_USER_LIST = "user_list"
}
export enum CALL_TYPE {
  SENDER = "sender",
  RECIVER = "reciver"
}
export enum CALL_STATE {
  // 等待
  WAIT = 0,
  // 发起通话中
  SEND = 1,
  // 连接成功
  CONNECT = 2,
  // 拒绝通话
  REFUSE = -1,
  // 挂断
  OFF = -2
}
