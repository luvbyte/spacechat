<template>
  <div class="w-[80%] h-full flex flex-col p-2 glass shadow-xl">
    <!-- Banner -->
    <button @click="goHome" class="font-bold">
      <pre class="pt-3 px-2 flex items-center justify-center text-[9px]">
  ___________________  _____  _________ ___________
 /   _____/\______   \/  _  \ \_   ___ \\_   _____/
 \_____  \  |     ___/  /_\  \/    \  \/ |    __)_ 
 /        \ |    |  /    |    \     \____|        \
/_______  / |____|  \____|__  /\______  /_______  /
        \/                  \/        \/        \/ </pre
      >
      <!-- Banner -->
      <pre class="px-2 flex items-center justify-center text-[9px]">
_________   ___ ___    ________________
\_   ___ \ /   |   \  /  _  \__    ___/
/    \  \//    ~    \/  /_\  \|    |   
\     \___\    Y    /    |    \    |   
 \______  /\___|_  /\____|__  /____|   
        \/       \/         \/         
      </pre>
    </button>
    <h1 class="text-xs text-center opacity-60">Version - {{ VERSION }}</h1>
    <!-- themes -->
    <div class="flex flex-col overflow-hidden text-xs">
      <div class="divider m-0 uppercase">Theme - {{ currentTheme }}</div>
      <div
        class="rounded grid grid-rows-1 grid-flow-col space-x-1 overflow-x-auto scrollbar-hide"
      >
        <div
          v-for="theme in themes"
          :data-theme="theme"
          @click="setTheme(theme)"
          class="w-12 h-12 shrink-0 rounded-full border-2 flex items-center justify-center gap-1"
          :class="
            currentTheme === theme
              ? 'border-base-content'
              : 'border-base-content/20'
          "
        >
          <div class="w-1 h-4 bg-primary rounded"></div>
          <div class="w-1 h-4 bg-secondary rounded"></div>
          <div class="w-1 h-4 bg-info rounded"></div>
          <div class="w-1 h-4 bg-primary rounded"></div>
        </div>
      </div>
      <div class="divider m-0"></div>
    </div>

    <div
      class="bg-primary glass text-primary-content p-1 rounded text-center font-heading"
    >
      ⌥ Quick Join
    </div>

    <div class="mt-2 flex-1 flex flex-col gap-2 overflow-y-auto">
      <button
        v-for="name in spaces"
        @click="quickJoin(name)"
        class="p-1 rounded bg-primary/60 text-primary-content glass text-sm font-heading active:bg-secondary"
      >
        {{ name }}
      </button>
    </div>

    <!-- footer -->
    <pre class="flex justify-center items-center text-xs">
        
♡  ∩_∩
 （„• ֊ •„)♡
┏ • UU • - • - • - • - • - • - • ღ❦ღ┓</pre
    >
    <div class="text-sm flex items-center gap-1 justify-center my-4">
      <span class="badge badge-sm badge-primary font-semibold font-heading"
        >SpaceChat</span
      >
      ツ
      <span class="badge badge-sm badge-secondary font-semibold font-heading"
        >kikku ᥫ᭡</span
      >
    </div>
    <pre class="flex justify-center items-center text-xs">
┗ღ❦ღ • - • - • - • - • - • -- •- •  ┛
      </pre
    >
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeMount } from "vue";

  import { getTheme, applyTheme, VERSION } from "@/api/config";

  import { useRouter } from "vue-router";

  const props = defineProps(["close"]);

  const router = useRouter();

  // Daisyui themes
  const themes = [
    "caramellatte",
    "dim",
    "light",
    "dracula",
    "cupcake",
    "dark",
    "bumblebee",
    "emerald",
    "retro",
    "black",
    "corporate",
    "synthwave",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "luxury",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
    "nord",
    "sunset",
    "abyss",
    "silk"
  ];

  const spaces = [
    // Real planets
    "Mercury",
    "Venus",
    "Earth",
    "Mars",
    "Jupiter",
    "Saturn",
    "Uranus",
    "Neptune",

    // Others
    "Anime"
  ];

  function quickJoin(name) {
    router.push({
      name: "space",
      params: { name }
    });

    props.close();
  }

  function goHome() {
    router.push({
      name: "home"
    });
  }

  const currentTheme = ref(getTheme());

  function setTheme(name) {
    applyTheme(name);
    currentTheme.value = name;
  }

  onMounted(async () => {
    applyTheme(currentTheme.value);
  });
</script>
