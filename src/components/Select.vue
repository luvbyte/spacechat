<template>
  <div class="relative w-full">
    <!-- Trigger -->
    <button
      ref="button"
      type="button"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.esc="close"
      class="border-base-content/40 focus:ring-primary w-full rounded-lg border bg-transparent px-4 py-1 text-left transition select-none focus:ring-2 focus:outline-none"
      :class="{ 'bg-base-100': isOpen }"
    >
      <span class="text-base-content">
        {{ selectedLabel || placeholder }}
      </span>
    </button>

    <!-- Dropdown -->
    <ul
      v-show="isOpen"
      class="border-base-300 bg-base-100 absolute z-20 mt-1 max-h-64 w-full overflow-hidden overflow-y-auto rounded-lg border shadow"
    >
      <li
        v-for="option in options"
        :key="option.value"
        @click="select(option)"
        class="hover:bg-base-200 cursor-pointer px-4 py-1"
        :class="{ 'bg-base-200': option.value === modelValue }"
      >
        {{ option.label }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from "vue";

  interface SelectOption {
    value: string | number;
    label: string;
  }

  const props = withDefaults(
    defineProps<{
      modelValue?: string | number;
      options: SelectOption[];
      placeholder?: string;
    }>(),
    { placeholder: "Select option" },
  );

  const emit = defineEmits<{
    (event: "update:modelValue", value: string | number): void;
  }>();

  const isOpen = ref(false);
  const button = ref<HTMLButtonElement | null>(null);

  const selectedLabel = computed(
    () => props.options.find((o) => o.value === props.modelValue)?.label,
  );

  function toggle() {
    isOpen.value = !isOpen.value;
  }

  function close() {
    isOpen.value = false;
  }

  function select(option: SelectOption) {
    emit("update:modelValue", option.value);
    close();
  }

  // Close on outside click
  function onClickOutside(e: MouseEvent) {
    if (!button.value?.parentElement?.contains(e.target as Node)) {
      close();
    }
  }

  onMounted(() => {
    document.addEventListener("click", onClickOutside);
  });

  onBeforeUnmount(() => {
    document.removeEventListener("click", onClickOutside);
  });
</script>
