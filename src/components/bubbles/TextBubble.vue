<template>
  <!-- TEXT -->
  <div
    class="px-4 py-2 rounded-2xl shadow-sm text-[15px] leading-relaxed"
    :class="
      message.self
        ? 'bg-primary text-primary-content rounded-br-sm'
        : 'bg-base-100 text-base-content rounded-bl-sm'
    "
  >
    {{ message.content }}
  </div>
</template>

<script setup>
  defineProps(["message"]);
</script>
