<template>
  <div data-theme="coffee" class="flex-1 bg-base-200 flex flex-col">
    <!-- Navbar -->
    <div class="navbar bg-base-100 shadow">
      <div class="flex-1">
        <span class="btn btn-ghost text-xl">SpaceChat</span>
      </div>
    </div>

    <main
      class="flex-1 flex flex-col items-center md:justify-center mt-4 sm:mt-0 px-6 text-center"
    >
      <!-- Hero Section -->
      <div class="flex justify-center items-center py-4">
        <img src="\og-image.jpg" class="w-1/2 rounded-lg" />
      </div>
      <h1 class="text-4xl md:text-5xl font-bold mb-4">
        Welcome to <span class="text-primary">SpaceChat</span>
      </h1>

      <p class="text-base-content/70 max-w-md mb-6">
        Create or join spaces and chat instantly. Simple, fast, and built for
        real conversations.
      </p>
      <!-- Space -->
      <div class="mb-4">
        <input
          v-model="space"
          class="w-full input input-lg text-center opacity-60 focus:outline-none"
        />
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button
          class="btn btn-primary btn-lg w-full sm:w-auto"
          @click="enterApp"
        >
          Enter SpaceChat
        </button>
      </div>
      <div class="mt-4 text-sm opacity-60 tracking-wide">
        Safe • Private • No storage
      </div>
    </main>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { useRouter } from "vue-router";

  const router = useRouter();

  const space = ref("Earth");

  function enterApp() {
    router.push({
      name: "space",
      params: { name: space.value.length ? space.value : "Earth" }
    });
  }
</script>
