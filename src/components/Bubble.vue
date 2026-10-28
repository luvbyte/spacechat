<template>
  <div>
    <div v-if="message.alert" class="fade-in divider font-heading m-0 opacity-80">
      <div class="badge badge-sm badge-info">
        {{ message.content }}
      </div>
    </div>
    <!-- ROW -->
    <div v-else class="fade-in flex w-full" :class="message.self ? 'justify-end' : 'justify-start'">
      <!-- CONTENT -->
      <div class="flex max-w-[75%] flex-col" :class="message.self ? 'items-end' : 'items-start'">
        <!-- USERNAME -->
        <div v-if="!message.self" class="mb-1 text-left text-xs opacity-50">
          {{ message.name }}
        </div>

        <TextBubble v-if="message.type === 'text'" :message />
        <EffectBubble v-else-if="message.type === 'effect'" :message />
        <ImageBubble v-else-if="message.type === 'image'" :message />
        <AudioBubble v-else-if="message.type === 'audio'" :message />
        <SecretBubble v-else-if="message.type === 'secret'" :message />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import TextBubble from "./bubbles/TextBubble.vue";
  import ImageBubble from "./bubbles/ImageBubble.vue";
  import AudioBubble from "./bubbles/AudioBubble.vue";
  import EffectBubble from "./bubbles/EffectBubble.vue";
  import SecretBubble from "./bubbles/SecretBubble.vue";

  defineProps(["message"]);
</script>
