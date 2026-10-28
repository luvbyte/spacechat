<template>
  <div class="bg-base-300 relative w-fit max-w-full overflow-hidden rounded-xl">
    <!-- Image container with a stable aspect ratio -->
    <div
      class="bg-base-200 relative min-h-32 max-w-full min-w-48 overflow-hidden"
      :class="loading ? 'skeleton' : ''"
    >
      <img
        :src="message.content.url"
        alt="Shared image"
        class="block max-h-72 w-auto max-w-full object-contain transition-opacity duration-300"
        :class="loading ? 'opacity-0' : 'opacity-100'"
        loading="lazy"
        @load="onLoaded"
        @error="onLoaded"
      />
    </div>

    <!-- Optional message caption -->
    <div
      v-if="message.content.message?.trim()"
      class="max-w-full px-3 py-2 text-sm wrap-break-word whitespace-pre-wrap"
    >
      {{ message.content.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";

  defineProps(["message"]);

  const loading = ref(true);

  const onLoaded = () => {
    loading.value = false;
  };
</script>
