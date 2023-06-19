<template>
  <video class="app-video" ref="VideoRef" :style="{ width: props.width, height: props.height }">
    <source type="video/mp4" />
  </video>
</template>
<script lang="ts" setup>
import { ref } from "vue";

const VideoRef = ref();
interface PropsType {
  width?: string;
  height?: string;
}
const props = withDefaults(defineProps<PropsType>(), {
  width: "100%",
  height: "100%"
});
function setSrc(src: string | MediaStream) {
  VideoRef.value.srcObject = src;
}
defineExpose({ setSrc });
</script>
<style lang="less" scoped>
.app-video {
  border-radius: 12px;
  object-fit: cover;
}
</style>
