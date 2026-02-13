<template>
  <div class="bg-base-100/90 backdrop-blur border-t border-base-300 px-4 py-3">
    <!-- OPTIONS PANEL -->
    <Transition name="slide-up">
      <div
        v-if="showInputOptions"
        class="mb-2 pb-6 rounded flex flex-col gap-3"
      >
        <!-- USERNAME -->
        <div class="flex gap-2 items-center">
          <h1 class="opacity-80">Name</h1>
          <input
            :value="myName"
            @input="updateName($event.target.value)"
            class="w-full input input-sm focus:outline-none opacity-60"
          />
        </div>
        <!-- MESSAGE TYPES -->
        <div
          class="flex flex-nowrap gap-2 shrink-0 overflow-x-auto scrollbar-hide font-heading"
        >
          <div
            v-for="name in msgTypes"
            :key="name"
            class="badge badge-lg capitalize opacity-80"
            :class="activeMessageType === name ? 'badge-info' : 'badge-outline'"
            @mousedown.prevent="activeMessageType = name"
          >
            {{ name }}
          </div>
        </div>

        <!-- EFFECT TYPES -->
        <div
          v-if="activeMessageType === 'effect'"
          class="flex flex-nowrap gap-2 shrink-0 overflow-x-auto scrollbar-hide font-heading"
        >
          <div
            v-for="name in effects"
            :key="name"
            class="badge badge-lg capitalize opacity-80"
            :class="activeEffectType === name ? 'badge-info' : 'badge-outline'"
            @mousedown.prevent="activeEffectType = name"
          >
            {{ name }}
          </div>
        </div>

        <!-- IMAGE PICKER -->
        <div v-if="activeMessageType === 'image'" class="flex flex-col gap-2">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            hidden
            @change="handleImageUpload"
          />

          <div class="flex gap-2 items-center">
            <button
              class="btn btn-sm btn-primary btn-soft"
              @click="fileInput.click()"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 10v9m0-9l3 3m-3-3l-3 3m8.5 2c1.519 0 2.5-1.231 2.5-2.75a2.75 2.75 0 0 0-2.016-2.65A5 5 0 0 0 8.37 8.108a3.5 3.5 0 0 0-1.87 6.746"
                />
              </svg>

              Gallery
            </button>
            <input
              v-model="imageUrlInput"
              class="w-full input input-sm rounded-lg placeholder:opacity-60 focus:outline-none"
              placeholder="Image url..."
              @input="handleImageUrlInput"
            />
          </div>
          <!-- PREVIEW -->
          <div v-if="previewUrl" class="relative max-w-[160px]">
            <img :src="previewUrl" class="rounded-xl border" />

            <button
              class="btn btn-xs btn-error absolute -top-2 -right-2"
              @click="clearImage"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Secret -->
        <div v-if="activeMessageType === 'secret'" class="flex flex-col gap-2">
          <!-- Secret -->
          <input
            v-model="secretKey"
            class="w-full input input-sm placeholder:opacity-60 focus:outline-none"
            placeholder="SecretKey"
          />
        </div>
      </div>
    </Transition>

    <!-- INPUT BAR -->
    <div class="max-w-3xl mx-auto flex items-center gap-3">
      <button
        class="btn btn-info btn-circle"
        @mousedown.prevent="showInputOptions = !showInputOptions"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
        >
          <path
            fill="currentColor"
            d="M17 16V7H8V5h11v11zm-5 5v-9H3v-2h11v11z"
          />
        </svg>
      </button>

      <input
        v-model="inputText"
        @keyup.enter="sendText"
        placeholder="Type here…"
        :disabled="!canSendMessage"
        class="flex-1 input rounded-full bg-base-200 border-base-300 focus:outline-none focus:ring-2 focus:ring-primary placeholder:opacity-60"
      />

      <button
        class="btn btn-primary btn-circle"
        :disabled="uploading || !canSendMessage"
        @click="sendText"
      >
        <span v-if="uploading">...</span>
        <svg
          v-else
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9.912 12H4L2.023 4.135A.7.7 0 0 1 2 3.995c-.022-.721.772-1.221 1.46-.891L22 12L3.46 20.896c-.68.327-1.464-.159-1.46-.867a.7.7 0 0 1 .033-.186L3.5 15"
          />
        </svg>
      </button>
    </div>
  </div>
</template>
<script setup>
  import { ref } from "vue";
  import { encryptMessage, generateUUID } from "@/api";
  import { supabase } from "@/utils/supabase.js";

  const inputText = ref("");
  const showInputOptions = ref(false);

  const props = defineProps([
    "canSendMessage",
    "sendMessage",
    "myName",
    "updateName"
  ]);

  const fileInput = ref(null);
  const imageUrlInput = ref("");

  // IMAGE STATE
  const selectedImageFile = ref(null);
  const previewUrl = ref(null);
  const uploading = ref(false);

  const secretKey = ref("");

  const msgTypes = ["text", "effect", "image", "secret", "video"];

  const effects = [
    "glow",
    "confetti",
    "glitch",
    "emoji",
    "sparkle",
    "wave",
    "shimmer",
    "gradient",
    "pulse",
    "neon",
    "pop"
  ];

  const activeMessageType = ref("text");
  const activeEffectType = ref("glow");

  // IMAGE PICK - PREVIEW
  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    selectedImageFile.value = file;
    previewUrl.value = URL.createObjectURL(file);

    event.target.value = "";
  }

  function handleImageUrlInput() {
    if (!imageUrlInput.value) {
      previewUrl.value = null;
      return;
    }

    // simple validation
    if (!/^https?:\/\/.+/i.test(imageUrlInput.value)) return;

    previewUrl.value = imageUrlInput.value;
    selectedImageFile.value = null; // disable file upload
  }

  function clearImage() {
    selectedImageFile.value = null;
    previewUrl.value = null;
    imageUrlInput.value = "";
  }

  function toBase64(bytes) {
    const bin = String.fromCharCode(...bytes);
    return btoa(bin);
  }

  // SEND MESSAGE
  async function sendText() {
    let message = inputText.value;

    // IMAGE TYPE
    if (activeMessageType.value === "image" && showInputOptions.value) {
      // URL MODE
      if (imageUrlInput.value) {
        props.sendMessage(`#image:${imageUrlInput.value} ${message}`);
        clearImage();
        activeMessageType.value = "text";
      }

      // FILE MODE
      if (selectedImageFile.value) {
        if (uploading.value) return;

        uploading.value = true;

        const file = selectedImageFile.value;
        const ext = file.name.split(".").pop();
        const fileName = `${generateUUID()}.${ext}`;
        const filePath = `chat/${fileName}`;

        const { error } = await supabase.storage
          .from("chat-images")
          .upload(filePath, file);

        uploading.value = false;

        if (error) {
          console.error("Upload failed:", error.message);
          return;
        }

        const { data } = supabase.storage
          .from("chat-images")
          .getPublicUrl(filePath);

        props.sendMessage(`#image:${data.publicUrl} ${message}`);

        clearImage();
        activeMessageType.value = "text";
      }
    } else {
      // Not image type
      if (!message.length) return;
      // effect
      else if (activeMessageType.value === "effect") {
        message = `#effect:${activeEffectType.value} ${message}`;
      }
      // Video
      else if (activeMessageType.value === "video") {
        message = `#video:${message}`;
        activeMessageType.value = "text";
        showInputOptions.value = false;
      }
      // secret
      else if (activeMessageType.value === "secret") {
        const encrypted = await encryptMessage(message, secretKey.value);

        message = `#secret ${encrypted.cipher}:${encrypted.salt}:${encrypted.iv}`;
      }
      props.sendMessage(message);
    }

    inputText.value = "";
  }
</script>
