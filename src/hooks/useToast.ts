import { CALL_STATE } from "@/enum";
import { Ref, ref, watch } from "vue";

export function useToast(state: Ref<CALL_STATE>) {
  let toast = ref("耍帅中...");
  watch(state, () => {
    switch (state.value) {
      case CALL_STATE.CONNECT:
        toast.value = "通话中...";
        break;
      case CALL_STATE.SEND:
        toast.value = "正在发起通话...";
        break;
      case CALL_STATE.REFUSE:
        toast.value = "对方已拒绝";
        break;
      case CALL_STATE.OFF:
        toast.value = "已挂断";
        break;
      case CALL_STATE.WAIT:
      default:
        toast.value = "耍帅中...";
        break;
    }
  });
  return [toast];
}
