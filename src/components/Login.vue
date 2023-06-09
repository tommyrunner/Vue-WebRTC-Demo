<template>
  <div :class="['login', oneShow ? 'show' : '', 'show-box', isError ? 'error' : '', isClose ? 'close' : '']">
    <span class="title">登录</span>
    <input placeholder="输入账号(1-4)" v-model="username" :class="isError ? 'input-error' : ''" />
    <AppButton @click="login" class="login-btn">进入</AppButton>
  </div>
</template>
<script lang="ts" setup>
import AppButton from "./AppButton.vue";
import { showDiaLog } from "@/utils";
import { ref } from "vue";
import { DIALOG_TYPE } from "@/enum";
const $emit = defineEmits(["login"]);
let username = ref("");
let isError = ref(false);
let isClose = ref(false);
// 显示一次，为了不与error动画冲突
let oneShow = ref(true);
setTimeout(() => {
  oneShow.value = false;
}, 500);
function login() {
  if (isError.value) return;
  if (username.value.length <= 0 || username.value.length > 4) {
    showDiaLog({ msg: "账号范围(1-4)", type: DIALOG_TYPE.WARNING });
    isError.value = true;
    setTimeout(() => {
      isError.value = false;
    }, 500);
  } else {
    $emit("login", username.value);
  }
}
function close() {
  isClose.value = true;
}
defineExpose({
  close,
});
</script>
<style lang="less" scoped>
.login {
  position: fixed;
  z-index: 2001;
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 22px;
  width: 30%;
  background-color: white;
  .title {
    margin-bottom: 12px;
    font-weight: bold;
    color: gainsboro;
    font-size: 18px;
  }
  input {
    margin-bottom: 32px;
  }
  .login-btn {
    font-size: 16px;
  }
}
.show {
  animation: show ease 0.5s;
}
.error {
  animation: error-show 0.5s;
}
.close {
  animation: close 0.5s forwards;
}
.input-error {
  border: 1px solid @color-error;
  &:focus {
    outline: 1px solid @color-error;
  }
}
@keyframes error-show {
  0%,
  100% {
    transform: scale(1, 1) translate(-50%, -50%);
  }
  25% {
    transform: scale(0.9, 1.1) translate(-50%, -50%);
  }
  50% {
    transform: scale(1.1, 0.9) translate(-50%, -50%);
  }
  75% {
    transform: scale(0.95, 1.05) translate(-50%, -50%);
  }
}
@keyframes show {
  0% {
    opacity: 0;
    top: 20%;
  }
  100% {
    opacity: 1;
    top: 40%;
  }
}
@keyframes close {
  0% {
    opacity: 1;
    top: 40%;
  }
  100% {
    opacity: 0;
    top: 80%;
  }
}
.login::before {
  content: "";
  z-index: -1;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  border: 2px solid gainsboro;
  transform-origin: center;
  transform: scale(1);
  border-radius: 12px;
}

.login:hover::before {
  transition: all 0.75s ease-in-out;
  transform-origin: center;
  transform: scale(1.75);
  opacity: 0;
}
</style>
