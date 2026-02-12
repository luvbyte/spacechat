<template>
  <div
    class="relative min-w-[80%] min-h-18 bg-base-300 flex flex-col rounded-xl overflow-hidden"
  >
    <!-- Image skeleton wrapper -->
    <div class="flex-1" :class="loading ? 'skeleton' : ''">
      <img
        :src="message.content.url"
        class="w-full min-w-64 object-cover transition-opacity duration-300"
        :class="loading ? 'opacity-0' : 'opacity-100'"
        loading="lazy"
        @load="onLoaded"
        @error="onLoaded"
      />
    </div>

    <div v-if="message.content.message.length" class="p-2">
      {{ message.content.message }}
    </div>
  </div>
</template>
<script setup>
  import { ref } from "vue";

  defineProps(["message"]);

  const loading = ref(true);

  const onLoaded = () => {
    loading.value = false;
  };
</script>
