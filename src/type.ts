import { CALL_TYPE, DATA_CODE, DIALOG_TYPE } from "./enum";
export interface DialogParamsType {
  msg: string;
  duration?: number;
  type?: DIALOG_TYPE;
  autoClose?: boolean;
}
export interface ResType {
  code: DATA_CODE;
  msg?: string;
  data?: any;
}
export interface ResRtcType extends ResType {
  nowUsername: string;
  toUsername: string;
  callType?: CALL_TYPE;
}
export interface RtcFunParams<T> extends ResRtcType {
  data: T;
}

export interface RtcEmitParams<T> {
  nowUsername: string;
  toUsername: string;
  data: T;
  callType?: CALL_TYPE;
}
export type RtcFun<T> = (params: RtcFunParams<T>) => void;
