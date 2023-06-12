import { Socket } from "socket.io";
import { CALL_TYPE, DATA_CODE } from "./enum";

export interface DataParamsType {
  code: DATA_CODE;
  msg?: String;
  data?: any;
}
export interface ResType {
  data: any;
}
export interface ResRtcType extends ResType {
  // 发送用户id
  toUsername: string;
  nowUsername: string;
  callType?: CALL_TYPE;
}
export interface RtcSocketType extends Socket {
  $emit?: (user: UserType, key: SOCKET_EMIT, data: ResRtcType) => void;
}