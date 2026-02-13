<script setup>
  import { onMounted } from "vue"
  import { setDefaultTheme } from "@/api/config";

  onMounted(setDefaultTheme);
</script>

<template>
  <div
    id="main"
    class="h-dvh flex flex-col font-body overflow-hidden transition-colors duration-600"
  >
    <div class="flex-1 flex flex-col overflow-hidden">
      <router-view />
    </div>
  </div>
</template>

<style scoped></style>
