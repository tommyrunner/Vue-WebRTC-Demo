import { CALL_TYPE, DATA_CODE, DIALOG_TYPE, SETTINGS_VIDEO } from "./enum";
// 提示框参数
export interface DialogParamsType {
  msg: string; // 描述
  duration?: number; // 延迟
  type?: DIALOG_TYPE; // 类型
  autoClose?: boolean; // 是否自动关闭
}
// 返回数据类型
export interface ResType {
  code: DATA_CODE;
  msg?: string;
  data?: any;
}
// rtc返回数据类型
export interface ResRtcType extends ResType {
  nowUsername: string;
  toUsername: string;
  callType?: CALL_TYPE;
}
// rtc回调函数
export interface RtcFunParams<T> extends ResRtcType {
  data: T;
}
// rtc 提交数据类型
export interface RtcEmitParams<T> {
  nowUsername: string;
  toUsername: string;
  data: T;
  callType?: CALL_TYPE;
}
// rtc回调函数
export type RtcFun<T = undefined> = (params: RtcFunParams<T>) => void;

// 初始化适配参数
export interface InitVideoParams {
  video: SETTINGS_VIDEO;
  config?: {
    // 音频
    audio: boolean;
    // 视频
    video: boolean;
  };
}
