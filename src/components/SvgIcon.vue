<template>
  <svg :class="`fill-current ${svgClass}`" v-bind="$attrs" :fill="color" :style="{ color: props.color, width: props.size, height: props.size }">
    <use :xlink:href="iconName" rel="external nofollow" />
  </svg>
</template>
<script lang="ts" setup>
import { computed } from "vue";
interface PropsType {
  size?: string;
  name: string;
  color?: string;
}
const props = withDefaults(defineProps<PropsType>(), {
  size: "24px",
  color: "#fff",
});
const iconName = computed(() => `#icon-${props.name}`);
const svgClass = computed(() => {
  if (props.name) {
    return `svg-icon ${iconName.value}`;
  }
  return "svg-icon";
});
</script>
<style scoped></style>
