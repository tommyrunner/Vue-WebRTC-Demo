import { DataParamsType } from "./type";

/**
 * 规定返回数据
 * @param params 
 * @returns DataParamsType
 */
export function toData(params: DataParamsType) {
  if (!params.msg) params.msg = "";
  if (!params.data) params.data = null;
  return params;
}
export function $log(msg: string) {
  console.log(`${msg}`);
}
