import { DATA_CODE } from "./enum";

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
}
