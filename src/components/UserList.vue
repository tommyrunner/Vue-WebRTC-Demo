<template>
  <div class="user-list show-box">
    <spen class="title">用户列表</spen>
    <div class="list">
      <div class="item show-box" v-for="item in userInfo.userList" :key="item.userId">
        <div class="left">
          <SvgIcon name="user" size="22" />
          <span class="name">{{ item.username }}</span>
        </div>
        <AppButton>拨打</AppButton>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import SvgIcon from "./SvgIcon.vue";
import AppButton from "./AppButton.vue";
import { useUserInfo } from "@/pinia/userInfo";
let userInfo = useUserInfo();
</script>
<style lang="less" scoped>
.user-list {
  padding: 12px;
  width: 300px;
  margin-right: 12px;
  display: flex;
  flex-direction: column;
  .title {
    align-self: center;
    font-weight: bold;
    color: @color-theme;
    margin-bottom: 12px;
  }
  .list {
    height: 100%;
    overflow: auto;
    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 32px;
      padding: 12px;
      margin-bottom: 12px;
      .left {
        display: flex;
        align-items: center;
        .name {
          margin-left: 12px;
          font-weight: bold;
          color: gray;
        }
      }
    }
  }
}
</style>
