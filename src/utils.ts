import type { DialogParamsType } from "./type";
import { DIALOG_TYPE } from "./enum";
let alertBox: HTMLElement | null = null;
let timeInt1: NodeJS.Timer | null = null;
const timeInt2: NodeJS.Timer | null = null;
/**
 * 提示框
 * @param params 提示参数
 * @returns void
 */
export function showDiaLog(params: DialogParamsType) {
  // 只显示最后一个
  if (alertBox) alertBox.remove();
  if (timeInt1) clearTimeout(timeInt1);
  if (timeInt2) clearTimeout(timeInt2);
  const mergedParams: Required<DialogParamsType> = Object.assign(
    {
      msg: "",
      duration: 800,
      type: DIALOG_TYPE.INFO,
      autoClose: true
    },
    params
  );
  alertBox = document.createElement("div");
  alertBox.style.cssText = `
      position: fixed;
      top: 2%;
      left: -100%;
      width: 80%;
      transform: translateX(-50%);
      border: none;
      padding: 0.439rem;
      border-radius: 0.146rem;
      box-shadow: 0rem 0rem 0.186rem rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-size: 18px;
      background-color: ${
        mergedParams.type === DIALOG_TYPE.ERROR
          ? "#fef0f0"
          : mergedParams.type === DIALOG_TYPE.WARNING
          ? "#fdf6ec"
          : mergedParams.type === DIALOG_TYPE.SUCCESS
          ? "#f0f9eb"
          : "#edf2fc"
      };
      color: ${
        mergedParams.type === DIALOG_TYPE.ERROR
          ? "#f56c6c"
          : mergedParams.type === DIALOG_TYPE.WARNING
          ? "#e6a23c"
          : mergedParams.type === DIALOG_TYPE.SUCCESS
          ? "#67c23a"
          : "#909399"
      };
    `;
  alertBox.innerText = mergedParams.msg;
  document.body.appendChild(alertBox);
  alertBox.animate([{ left: "-100%" }, { left: "50%" }], {
    duration: mergedParams.duration,
    fill: "forwards",
    easing: "ease-in-out"
  });
  if (!mergedParams.autoClose) return;
  timeInt1 = setTimeout(() => {
    if (alertBox)
      alertBox.animate([{ left: "50%" }, { left: "150%" }], {
        duration: 400,
        fill: "forwards",
        easing: "ease-in-out"
      });
    timeInt1 = setTimeout(() => {
      if (alertBox) alertBox.remove();
      if (timeInt1) clearTimeout(timeInt1);
      if (timeInt2) clearTimeout(timeInt2);
    }, 400);
  }, mergedParams.duration + 800);
}
