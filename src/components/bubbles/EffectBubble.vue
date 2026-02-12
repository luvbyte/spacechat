<template>
  <div
    class="p-2 px-4 rounded-2xl shadow-sm max-w-sm relative overflow-hidden effect-root"
    :class="[
      message.self
        ? 'bg-primary/20 rounded-br-sm'
        : 'bg-base-100 rounded-bl-sm',
      effectClass
    ]"
  >
    <!-- overlays -->
    <div v-if="isConfetti" class="confetti-layer"></div>
    <div v-if="isEmojiRain" class="emoji-layer">
      🧡💛💚💙💜🤎🖤🤍🩷🩵🩶💕💞💓💗💖💘💝
    </div>
    <div v-if="isSparkle" class="sparkle-layer"></div>
    <div v-if="isShimmer" class="shimmer-layer"></div>

    <!-- text -->
    <p class="text-[15px] relative z-10" :class="{ 'wave-text': isWave }">
      {{ message.content.text }}
    </p>
  </div>
</template>

<script setup>
  import { computed } from "vue";

  const props = defineProps({
    message: {
      type: Object,
      required: true
    }
  });

  const name = computed(() => props.message.content.name);

  const effectClass = computed(() => {
    switch (name.value) {
      case "glow":
        return "ig-glow";

      case "gradient":
        return "ig-gradient";

      case "pulse":
        return "ig-pulse";

      case "glitch":
        return "ig-glitch";

      case "neon":
        return "ig-neon";

      case "pop":
        return "ig-pop";

      default:
        return "";
    }
  });

  const isConfetti = computed(() => name.value === "confetti");
  const isEmojiRain = computed(() => name.value === "emoji");
  const isSparkle = computed(() => name.value === "sparkle");
  const isWave = computed(() => name.value === "wave");
  const isShimmer = computed(() => name.value === "shimmer");
</script>

<style scoped>
  /* ================= CORE EFFECTS ================= */

  /* Glow */
  .ig-glow {
    box-shadow: 0 0 18px rgba(236, 72, 153, 0.9);
  }

  /* Gradient */
  .ig-gradient {
    background: linear-gradient(120deg, #ff0066, #ffcc00, #33ccff, #7c3aed);
    background-size: 400% 400%;
    color: white;
    animation: gradientMove 6s ease infinite;
  }

  @keyframes gradientMove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  /* Pulse */
  .ig-pulse {
    animation: pulse 1.8s ease-in-out infinite;
  }

  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.06);
    }
    100% {
      transform: scale(1);
    }
  }

  /* Glitch */
  .ig-glitch {
    background: black;
    color: white;
    text-shadow:
      -2px 0 cyan,
      2px 0 magenta;
    animation: glitchShake 0.15s infinite;
  }

  @keyframes glitchShake {
    0% {
      transform: translate(0);
    }
    50% {
      transform: translate(-1px, 1px);
    }
    100% {
      transform: translate(0);
    }
  }

  /* Neon */
  .ig-neon {
    background: black;
    color: #22d3ee;
    box-shadow:
      0 0 6px #22d3ee,
      0 0 20px #22d3ee,
      0 0 40px #22d3ee;
  }

  /* Pop-in */
  .ig-pop {
    animation: popIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @keyframes popIn {
    0% {
      transform: scale(0.4);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* ================= OVERLAY FX ================= */

  .confetti-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(circle at 10% 10%, #ff0 2px, transparent 3px),
      radial-gradient(circle at 80% 20%, #0ff 2px, transparent 3px),
      radial-gradient(circle at 40% 70%, #f0f 2px, transparent 3px);
    animation: confetti 1.2s linear infinite;
  }

  @keyframes confetti {
    from {
      background-position:
        0 0,
        0 0,
        0 0;
    }
    to {
      background-position:
        0 140px,
        0 200px,
        0 260px;
    }
  }

  /* Emoji rain */
  .emoji-layer {
    position: absolute;
    inset: 0;
    font-size: 20px;
    pointer-events: none;
    opacity: 0.7;
    animation: emojiFall 1.5s linear infinite;
  }

  @keyframes emojiFall {
    from {
      transform: translateY(-100%);
    }
    to {
      transform: translateY(100%);
    }
  }

  /* Sparkle */
  .sparkle-layer {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      circle,
      rgba(255, 255, 255, 0.8) 2px,
      transparent 3px
    );
    background-size: 40px 40px;
    animation: sparkle 1.4s ease infinite;
  }

  @keyframes sparkle {
    0% {
      opacity: 0;
    }
    50% {
      opacity: 0.9;
    }
    100% {
      opacity: 0;
    }
  }

  /* Shimmer */
  .shimmer-layer {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      120deg,
      transparent,
      rgba(255, 255, 255, 0.6),
      transparent
    );
    animation: shimmer 2s infinite;
  }

  @keyframes shimmer {
    from {
      transform: translateX(-100%);
    }
    to {
      transform: translateX(100%);
    }
  }

  /* Wave text */
  .wave-text {
    animation: wave 1.2s ease-in-out infinite;
  }

  @keyframes wave {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-4px);
    }
    100% {
      transform: translateY(0);
    }
  }
</style>
