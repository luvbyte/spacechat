<template>
  <!-- AUDIO WRAPPER -->
  <div
    class="p-2 rounded-2xl shadow-sm max-w-sm"
    :class="
      message.self ? 'bg-primary/20 rounded-br-sm' : 'bg-base-100 rounded-bl-sm'
    "
  >
    <!-- PLAYER SLOT -->
    <div
      class="relative w-full min-h-[60px] rounded-xl overflow-hidden"
      :class="{ skeleton: loading }"
    >
      <!-- Audio -->
      <audio
        class="w-full transition-opacity duration-300"
        :class="loading ? 'opacity-0' : 'opacity-100'"
        controls
        preload="metadata"
        :src="message.content.url"
        @loadedmetadata="onLoaded"
        @canplay="onLoaded"
        @error="onError"
      ></audio>
    </div>

    <!-- Caption -->
    <p
      v-if="message.content.caption"
      class="mt-2 text-sm leading-snug opacity-90"
    >
      {{ message.content.caption }}
    </p>
  </div>
</template>

<script setup>
  import { ref } from "vue";

  const props = defineProps({
    message: {
      type: Object,
      required: true
    }
  });

  const loading = ref(true);

  const onLoaded = () => {
    loading.value = false;
  };

  const onError = e => {
    loading.value = false;
    console.error("Audio failed to load:", props.message.content.url, e);
  };
</script>
