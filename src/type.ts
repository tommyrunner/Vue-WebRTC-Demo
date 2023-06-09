import { DIALOG_TYPE } from "./enum";
export interface DialogParamsType {
  msg: string;
  duration?: number;
  type?: DIALOG_TYPE;
  autoClose?: boolean;
}
