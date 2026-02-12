<template>
  <div>
    <div v-if="message.alert" class="divider m-0 opacity-60 font-heading">
      {{ message.content }}
    </div>
    <!-- ROW -->
    <div
      v-else
      class="flex w-full fade-in"
      :class="message.self ? 'justify-end' : 'justify-start'"
    >
      <!-- CONTENT -->
      <div
        class="flex flex-col max-w-[75%]"
        :class="message.self ? 'items-end' : 'items-start'"
      >
        <!-- USERNAME -->
        <div v-if="!message.self" class="text-xs opacity-50 mb-1 text-left">
          {{ message.name }}
        </div>

        <TextBubble v-if="message.type === 'text'" :message />
        <EffectBubble v-else-if="message.type === 'effect'" :message />
        <ImageBubble
          v-else-if="message.type === 'image'"
          :message
        />
        <AudioBubble v-else-if="message.type === 'audio'" :message />
        <SecretBubble v-else-if="message.type === 'secret'" :message />
      </div>
    </div>
  </div>
</template>

<script setup>
  import TextBubble from "./bubbles/TextBubble.vue";
  import ImageBubble from "./bubbles/ImageBubble.vue";
  import AudioBubble from "./bubbles/AudioBubble.vue";
  import EffectBubble from "./bubbles/EffectBubble.vue";
  import SecretBubble from "./bubbles/SecretBubble.vue";

  defineProps(["message"]);
</script>
