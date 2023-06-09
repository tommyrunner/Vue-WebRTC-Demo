import { DataParamsType } from "./type";

export function toData(params: DataParamsType) {
  if (!params.msg) params.msg = "";
  if (!params.data) params.data = null;
  return params;
}
export function $log(msg: string) {
  console.log(`${msg}`);
}
