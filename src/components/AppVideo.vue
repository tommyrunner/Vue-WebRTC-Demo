<template>
  <video autoplay muted class="app-video" :style="{ width: props.width, height: props.height }">
    <source src="@/assets/vv.mp4" type="video/mp4" />
  </video>
</template>
<script lang="ts" setup>
interface PropsType {
  width?: string;
  height?: string;
}
const props = withDefaults(defineProps<PropsType>(), {
  width: "100%",
  height: "100%",
});
</script>
<style lang="less" scoped>
.app-video {
  border-radius: 12px;
  object-fit: cover;
}
</style>
