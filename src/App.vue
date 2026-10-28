<script setup lang="ts">
  import { onMounted } from "vue";
  import { setDefaultTheme } from "@/api/config";

  onMounted(setDefaultTheme);
</script>

<template>
  <div
    id="main"
    class="font-body flex h-dvh flex-col overflow-hidden transition-colors duration-600"
  >
    <div class="flex flex-1 flex-col overflow-hidden">
      <router-view />
    </div>
  </div>
</template>

<style scoped></style>
