<template>
  <Transition name="notice">
    <div class="notice show-box" v-if="isShow">
      <div class="left">
        <SvgIcon name="user" color="#67C23A" size="48px" />
        <span>{{ username ? `${username}来电` : "未知用户" }}</span>
      </div>
      <div class="right">
        <SvgIcon
          name="close"
          color="#fe6c6f"
          size="48px"
          class="svg-call svg-close"
          @click="
            $emit('call', false);
            isShow = false;
          "
        />
        <SvgIcon
          name="close"
          color="#67C23A"
          size="48px"
          class="svg-call"
          @click="
            $emit('call', true);
            isShow = false;
          "
        />
      </div>
    </div>
  </Transition>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import SvgIcon from "./SvgIcon.vue";
let username = ref("");
let isShow = ref(false);
function showNotice(toUsername: string) {
  isShow.value = true;
  username.value = toUsername;
}
defineExpose({ showNotice });
</script>
<style lang="less" scoped>
.notice {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2001;
  width: 98%;
  height: 89px;
  background-color: white;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  padding: 24px;
  justify-content: space-between;
  .left {
    display: flex;
    align-items: center;
    span {
      margin-left: 12px;
      font-size: 18px;
      font-weight: bold;
      color: gray;
    }
  }
  .svg-call {
    cursor: pointer;
    transition: 0.22s;
    &:active {
      transform: scale(0.9);
    }
  }
  .svg-close {
    transform: rotate(180deg);
    margin-right: 32px;
    &:active {
      transform: rotate(180deg) scale(0.9);
    }
  }
}
.notice-enter-active {
  animation: notice-in 0.5s;
}
.notice-leave-active {
  animation: notice-in 0.5s reverse;
}
@keyframes notice-in {
  0% {
    top: -100px;
  }
  100% {
    top: 10px;
  }
}
</style>
