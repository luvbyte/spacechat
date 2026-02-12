<template>
  <div @click.self="close" class="fixed z-20 inset-0 fscreen">
    <div class="w-[80%] h-full flex flex-col p-2 bg-base-200 shadow-xl">
      <!-- Banner -->
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

      <!-- themes -->
      <div class="flex flex-col overflow-hidden text-xs">
        <div class="divider m-0 uppercase">Theme - {{ currentTheme }}</div>
        <div
          class="rounded grid grid-rows-2 grid-flow-col space-x-1 space-y-1 py-2 overflow-x-auto scrollbar-hide"
        >
          <div
            v-for="theme in themes"
            :data-theme="theme"
            @click="setTheme(theme)"
            class="w-12 h-12 shrink-0 rounded-full border-2 flex items-center justify-center gap-1 p-1"
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
        class="bg-primary text-primary-content p-1 rounded text-center font-heading"
      >
        ⌥ Quick Join
      </div>

      <div class="mt-2 flex-1 flex flex-col gap-2 overflow-y-auto">
        <button
          v-for="name in spaces"
          @click="quickJoin(name)"
          class="p-1 rounded bg-base-300 font-heading"
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
      <div class="text-sm text-center my-4">
        <span class="text-info">SpaceChat</span> ツ
        <span class="text-success">kikku ᥫ᭡</span>
      </div>
      <pre class="flex justify-center items-center text-xs">
┗ღ❦ღ • - • - • - • - • - • -- •- •  ┛
      </pre>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, onBeforeMount } from "vue";
  import { getTheme, applyTheme } from "@/api/config";

  import { useRouter } from "vue-router";

  defineProps(["close"]);

  const router = useRouter();

  // Daisyui themes
  const themes = [
    "dracula",
    "light",
    "dark",
    "cupcake",
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
    "dim",
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
    "caramellatte",
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

    // Dwarf planets
    "Pluto",
    "Eris",
    "Haumea",
    "Makemake",
    "Ceres",

    // Famous moons
    "Europa",
    "Titan",
    "Io",
    "Ganymede",
    "Callisto",
    "Enceladus",
    "Phobos",
    "Deimos",
    "Luna",

    // Sci-fi classics
    "Tatooine",
    "Coruscant",
    "Naboo",
    "Dagobah",
    "Endor",
    "Hoth",
    "Krypton",
    "Vulcan",
    "Arrakis",
    "Pandora",

    // Fantasy planets / realms
    "Elysium",
    "Avalon",
    "Asgard",
    "Midgard",
    "Valhalla",
    "Olympus",
    "Arcadia",

    // Cosmic words
    "Nebula",
    "Supernova",
    "Cosmos",
    "Void",
    "Eclipse",
    "Starlight",
    "Galaxy",
    "Orbit",
    "Singularity",
    "Quasar",
    "Pulsar",

    // Server / lobby style
    "Lobby-01",
    "Lobby-02",
    "Sector-7",
    "Sector-9",
    "Zone-Alpha",
    "Zone-Beta",
    "Outpost-3",
    "Docking-Bay",

    // Cool extras
    "Starfall",
    "Skyreach",
    "Deep-Space",
    "Infinity",
    "Hyperion",
    "Celestia",
    "Astryx",
    "Voidwalker",

    // Original
    "Anime"
  ];

  function quickJoin(name) {
    router.push({
      name: "space",
      params: { name }
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
