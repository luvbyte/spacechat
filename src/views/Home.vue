<template>
  <div class="bg-base-200 flex flex-1 flex-col">
    <main
      class="mt-18 flex flex-1 flex-col items-center px-6 text-center sm:mt-0 md:justify-center"
    >
      <!-- Hero Section -->
      <div class="flex items-center justify-center py-4">
        <img :src="ogImage" class="w-1/2 rounded-lg" />
      </div>
      <h1 class="mb-4 text-4xl font-bold md:text-5xl">
        Welcome to <span class="text-primary">SpaceChat</span>
      </h1>

      <p class="text-base-content/70 mb-6 max-w-md">
        Create or join spaces and chat instantly. Simple, fast, and built for real conversations.
      </p>
      <!-- Space -->
      <div class="mb-4">
        <input
          v-model="space"
          class="input input-lg w-full text-center opacity-60 focus:outline-none"
        />
      </div>

      <!-- CTA Buttons -->
      <div class="flex w-full flex-col gap-4 sm:w-auto sm:flex-row">
        <button class="btn btn-primary btn-lg w-full sm:w-auto" @click="enterApp">
          Enter SpaceChat
        </button>
      </div>
      <div class="mt-4 text-sm tracking-wide opacity-60">Safe • Private • No storage</div>
    </main>
  </div>
</template>

<script setup lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router";

  const router = useRouter();
  const ogImage = `${import.meta.env.BASE_URL}og-image.jpg`;

  function generateUniqueString() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    while (result.length < 4) {
      const randomChar = chars[Math.floor(Math.random() * chars.length)];
      if (!result.includes(randomChar)) {
        result += randomChar;
      }
    }

    return result;
  }

  const space = ref("Earth-" + generateUniqueString());

  function enterApp() {
    router.push({
      name: "space",
      params: { name: space.value.length ? space.value : "Earth" },
    });
  }
</script>
