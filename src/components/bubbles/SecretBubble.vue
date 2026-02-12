<template>
  <div
    @click="askSecretKey = true"
    class="px-4 py-2 rounded-2xl shadow-sm text-[15px] leading-relaxed"
    :class="
      message.self
        ? 'bg-primary text-primary-content rounded-br-sm'
        : 'bg-base-100 text-base-content rounded-bl-sm'
    "
  >
    <p v-if="decrypted">{{ decrypted }}</p>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path
        fill="currentColor"
        d="M12 22q-3.475-.875-5.738-3.988T4 11.1V5l8-3l8 3v6.1q0 .25-.012.5t-.038.5q-.225-.05-.462-.075T19 12q-.275 0-.525.025t-.525.075q.025-.25.038-.487T18 11.1V6.375l-6-2.25l-6 2.25V11.1q0 3.025 1.7 5.5t4.3 3.3q.525-.175 1.025-.425T14 18.9v2.35q-.475.25-.975.438T12 22m4 0v-5h1v-1q0-.825.588-1.412T19 14t1.413.588T21 16v1h1v5zm2-5h2v-1q0-.425-.288-.712T19 15t-.712.288T18 16z"
      />
    </svg>
  </div>
  <div
    v-if="askSecretKey"
    class="fixed z-90 inset-0 p-4 fscreen bg-base-200/60 flex gap-2 justify-center items-center"
    @click.self="unlock"
  >
    <input
      v-model="secretKey"
      class="w-full input input-sm placeholder:opacity-60"
      placeholder="SecretKey"
    />
    <button @click="unlock" class="btn btn-sm btn-primary">Unlock</button>
  </div>
</template>

<script setup>
  import { ref } from "vue";
  import { decryptMessage } from "@/api";

  const props = defineProps(["message"]);

  const secretKey = ref("");
  const decrypted = ref(null);

  const askSecretKey = ref(false);

  function splitSecretMessage(message) {
    // Remove "#secret " prefix
    const withoutPrefix = message.replace(/^#secret\s*/, "");

    // Split into parts
    const [cipher, salt, iv] = withoutPrefix.split(":");

    return { cipher, salt, iv };
  }
  function fromBase64(b64) {
    const bin = atob(b64);
    return Uint8Array.from(bin, c => c.charCodeAt(0));
  }

  async function unlock() {
    askSecretKey.value = false;
    const parts = splitSecretMessage(props.message.content);

    decrypted.value = await decryptMessage(
      parts.cipher,
      secretKey.value,
      parts.salt,
      parts.iv
    );
  }
</script>
