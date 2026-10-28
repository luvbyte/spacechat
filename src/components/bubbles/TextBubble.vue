<template>
  <!-- TEXT -->
  <div
    class="rounded-2xl px-4 py-2 text-[15px] leading-relaxed shadow-sm"
    :class="
      message.self
        ? 'bg-primary text-primary-content rounded-br-sm'
        : 'bg-base-100 text-base-content rounded-bl-sm'
    "
  >
    {{ message.content }}
  </div>
</template>

<script setup lang="ts">
  defineProps(["message"]);
</script>
