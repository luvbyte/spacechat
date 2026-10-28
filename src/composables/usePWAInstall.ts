import { ref } from "vue";

const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const isInstallable = ref(false);

// listen event only once
window.addEventListener("beforeinstallprompt", (event: Event) => {
  const e = event as BeforeInstallPromptEvent;
  e.preventDefault();
  deferredPrompt.value = e;
  isInstallable.value = true;
});

export function usePWAInstall() {
  async function installPWA() {
    if (!deferredPrompt.value) {
      alert("PWA install not available yet.");
      return;
    }

    // Show the native install prompt
    deferredPrompt.value.prompt();

    // Wait for user action
    const choice = await deferredPrompt.value.userChoice;

    if (choice.outcome === "accepted") {
      if ("Toast" in window) {
        const ToastConstructor = (
          window as Window & {
            Toast: new (message: string) => { show(): void };
          }
        ).Toast;
        new ToastConstructor("Installed Succesfully").show();
      }
    } else {
      // console.log("PWA dismissed.");
    }

    // Reset so it doesn't show twice
    deferredPrompt.value = null;
    isInstallable.value = false;
  }

  return {
    installPWA,
    isInstallable,
  };
}
