import { DATA_CODE, DIALOG_TYPE } from "./enum";
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
}
export interface RtcFunParams<T> extends ResRtcType {
  data: T;
}
export type RtcFun<T> = (params: RtcFunParams<T>) => void;
