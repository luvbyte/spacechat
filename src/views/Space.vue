<template>
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Space Join Bar -->
    <div
      class="p-2 py-3 bg-base-200 text-base-content flex items-center justify-between gap-2"
    >
      <button class="shrink-0 text-lg font-bold" @click="showSidebar = true">
        ⌥ Space
      </button>

      <input
        v-model="spaceInput"
        @keyup.enter="changeSpace(spaceInput)"
        class="input input-sm w-full sm:max-w-sm rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-primary font-semibold opacity-60 focus:opacity-100"
      />

      <div class="flex gap-1 items-center">
        <button
          class="btn btn-sm btn-primary rounded-full px-5"
          @click="changeSpace(spaceInput)"
        >
          Join
        </button>
        <button
          class="btn btn-sm btn-info rounded-full px-5"
          @click="inviteSpace"
        >
          Invite
        </button>
        <button class="btn btn-sm btn-secondary" @click="showSidebar = true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="currentColor"
              d="M15.22 4.75L7.87 7.79l4.96 11.96l7.35-3.05zM11 10c-.55 0-1-.45-1-1s.45-1 1-1s1 .45 1 1s-.45 1-1 1"
              opacity="0.3"
            />
            <path
              fill="currentColor"
              d="m3.87 11.18l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61l1.34.56zm18.16 4.77L17.07 3.98a2.01 2.01 0 0 0-1.81-1.23c-.26 0-.53.04-.79.15L7.1 5.95a2 2 0 0 0-1.08 2.6l4.96 11.97a2 2 0 0 0 2.6 1.08l7.36-3.05a1.994 1.994 0 0 0 1.09-2.6m-9.2 3.8L7.87 7.79l7.35-3.04h.01l4.95 11.95z"
            />
            <circle cx="11" cy="9" r="1" fill="currentColor" />
            <path
              fill="currentColor"
              d="m9.33 21.75l-3.45-8.34v6.34c0 1.1.9 2 2 2z"
            />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-if="videoState.visible"
      class="relative w-full bg-black aspect-video"
    >
      <div class="fscreen" id="yt-player"></div>
    </div>

    <!-- Chat Area -->
    <div
      ref="chatBox"
      class="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-2 py-4 gap-3"
    >
      <Bubble v-for="(message, i) in messages" :key="i" :message />
    </div>

    <InputBox
      :canSendMessage
      :sendMessage
      :myName
      :updateName="changeUsername"
    />

    <!-- Sidebar -->
    <div
      class="fixed inset-0 z-20 full overflow-hidden"
      @click.self="showSidebar = false"
      :class="{ 'pointer-events-none -z-20': !showSidebar }"
    >
      <!-- SIDEBAR -->
      <Transition name="slide-right">
        <Sidebar v-show="showSidebar" :close="() => (showSidebar = false)" />
      </Transition>
    </div>
  </div>
</template>

<script setup>
  import { ref, onBeforeMount, onBeforeUnmount, nextTick, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { supabase } from "@/utils/supabase.js";

  import { extractYouTubeId, getClientId, getClientUsername } from "@/api";

  import Sidebar from "@/components/Sidebar.vue";
  import Bubble from "@/components/Bubble.vue";
  import InputBox from "@/components/InputBox.vue";

  import YouTubePlayer from "youtube-player";

  // ---------------- router
  const router = useRouter();
  const route = useRoute();

  const spaceChannel = ref(null);

  // ---------------- video
  const canSendVideo = ref(false);
  const canSendMessage = ref(false);

  const videoState = ref({
    visible: false,
    videoId: null,
    currentTime: 0,
    playing: false
  });

  const player = ref(null);
  const hasControls = ref(false);

  const playerReady = ref(false);
  let pendingAction = null;
  let suppressBroadcast = false;

  let syncInterval = null;

  const clientId = getClientId();

  // ---------------- spaces
  const activeSpace = ref("Mars"); // currently joined
  const spaceInput = ref("Mars"); // input field value

  // sidebar
  const showSidebar = ref(false);

  // ---------------- chat area
  const messages = ref([]);
  const chatBox = ref(null);

  // ---------------- input
  const inputText = ref("");

  // ---------------- usernames
  const myName = ref(getClientUsername());

  // Utils function
  function changeUsername(userName) {
    localStorage.setItem("space-chat-userName", userName);
    myName.value = userName;
  }

  // ---------------- Video
  // Video sync action
  async function executeAction({ action, time }) {
    if (!player.value) return;

    suppressBroadcast = true;

    if (action === "play") {
      await player.value.seekTo(time, true);
      await player.value.playVideo();
    }

    if (action === "pause") {
      await player.value.seekTo(time, true);
      await player.value.pauseVideo();
    }

    if (action === "seek") {
      await player.value.seekTo(time, true);
    }

    // Important delay to avoid feedback loop
    setTimeout(() => {
      suppressBroadcast = false;
    }, 400);
  }

  // Sync video with host
  function startHostSync() {
    if (syncInterval) {
      clearInterval(syncInterval);
    }

    syncInterval = setInterval(async () => {
      if (!player.value || !playerReady.value) return;
      if (!hasControls.value) return;

      const time = await player.value.getCurrentTime();
      const state = await player.value.getPlayerState();

      broadcastVideo("sync", time, videoState.value.videoId, state);
    }, 4000);
  }

  // Broadcast video
  function broadcastVideo(action, time = 0, videoId = null, state = null) {
    if (!spaceChannel.value) return;
    if (!hasControls.value) return; // safety

    spaceChannel.value.send({
      event: "video",
      type: "broadcast",
      payload: {
        action,
        time,
        videoId: videoId ?? videoState.value.videoId,
        state
      }
    });
  }

  // Initialize video player
  async function initPlayer(videoId, start = 0) {
    videoState.value.visible = true;
    videoState.value.videoId = videoId;

    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }

    await nextTick();

    if (player.value) {
      await player.value.destroy();
    }

    playerReady.value = false;

    player.value = YouTubePlayer("yt-player", {
      videoId,
      playerVars: {
        autoplay: 1,
        start,
        mute: 1
      }
    });

    player.value.on("ready", async () => {
      playerReady.value = true;

      if (hasControls.value) {
        await player.value.unMute();
      }

      player.value.playVideo();

      if (pendingAction) {
        await executeAction(pendingAction);
        pendingAction = null;
      }

      if (hasControls.value) {
        startHostSync();
      }
    });

    let lastTime = 0;

    player.value.on("stateChange", async event => {
      if (suppressBroadcast || !hasControls.value) return;

      const time = await player.value.getCurrentTime();

      // Only broadcast if meaningful difference
      if (Math.abs(time - lastTime) > 1) {
        broadcastVideo("seek", time);
      }

      if (event.data === 1) {
        broadcastVideo("play", time);
      }

      if (event.data === 2) {
        broadcastVideo("pause", time);
      }

      lastTime = time;
    });
  }

  // on video
  async function onVideoEvent(msg) {
    const { action, time, videoId, state } = msg.payload;

    if (action === "init") {
      await initPlayer(videoId, time);

      return;
    }

    if (action === "sync") {
      // If no player yet, initialize
      if (!player.value) {
        await initPlayer(videoId, time);
      }

      if (!playerReady.value) {
        pendingAction = { action: "sync", time, state };
        return;
      }

      suppressBroadcast = true;

      const localTime = await player.value.getCurrentTime();

      // Correct drift if > 1 sec
      if (Math.abs(localTime - time) > 1) {
        await player.value.seekTo(time, true);
      }

      if (state === 1) {
        await player.value.playVideo();
      } else {
        await player.value.pauseVideo();
      }

      setTimeout(() => {
        suppressBroadcast = false;
      }, 300);

      return;
    }

    // PLAY / PAUSE / SEEK
    if (!player.value) return;

    if (!playerReady.value) {
      pendingAction = { action, time };
      return;
    }

    await executeAction({ action, time });
  }

  // Reset current video if playing
  async function resetVideo(reason = "Video stopped", removeHost = true) {
    if (player.value) {
      await player.value.destroy();
      player.value = null;
    }

    videoState.value.visible = false;
    videoState.value.videoId = null;
    videoState.value.playing = false;

    if (spaceChannel.value && removeHost) {
      spaceChannel.value.untrack();
    }

    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }

    if (removeHost) {
      hasControls.value = false;
    }

    playerReady.value = false;
    pendingAction = null;

    addMessage({
      name: "System",
      text: reason,
      self: false,
      alert: true
    });

    // Broadcast to others
    broadcastMessage(reason);
  }

  // ---------------- Message functions
  // Broadcast message to everyone
  function broadcastMessage(message) {
    if (!spaceChannel.value) return;
    spaceChannel.value.send({
      event: "message",
      type: "broadcast",
      payload: { name: `${myName.value} (${clientId})`, text: message }
    });
  }

  // System message (locally)
  function systemMessage(message) {
    addMessage({ name: "You", text: message, self: true, alert: true });
  }

  // Parse message
  function parseMessage(msg) {
    const message = {
      name: msg.name,
      self: msg.self,
      alert: msg.alert,
      type: "text",
      content: msg.text
    };

    // Special Case
    if (msg.text.startsWith("#")) {
      // Removes #
      const raw = msg.text.slice(1);

      // Split first word/command from rest
      const firstSpace = raw.indexOf(" ");
      const commandPart = firstSpace === -1 ? raw : raw.slice(0, firstSpace);
      const rest = firstSpace === -1 ? "" : raw.slice(firstSpace + 1);

      // IMAGE: #image:url message
      if (commandPart.startsWith("image:")) {
        const url = commandPart.slice("image:".length);

        message.type = "image";
        message.content = {
          url,
          message: rest
        };
      }
      // AUDIO: #audio:url caption (development)
      else if (commandPart.startsWith("audio:")) {
        const url = commandPart.slice("audio:".length);

        message.type = "audio";
        message.content = {
          url,
          caption: rest
        };
      }

      // EFFECT: #effect:name text
      else if (commandPart.startsWith("effect:")) {
        const name = commandPart.slice("effect:".length);

        message.type = "effect";
        message.content = {
          name,
          text: rest
        };
      } else if (commandPart.startsWith("secret")) {
        message.type = "secret";
      }
    }

    return message;
  }

  // parse and add message to ChatBox
  function addMessage(msg) {
    // Parsing
    messages.value.push(parseMessage(msg));

    nextTick(() => {
      chatBox.value?.scrollTo(0, chatBox.value.scrollHeight);
    });
  }

  // On message
  function onMessage(msg) {
    const payload = msg.payload;

    addMessage({
      name: payload.name,
      text: payload.text,
      self: false,
      alert: false
    });
  }

  // SEND MESSAGE (entry)
  async function sendMessage(message) {
    if (!canSendMessage.value) return;
    if (!spaceChannel.value) return;
    if (!message.trim()) return;

    const msg = {
      name: "You",
      text: message,
      self: true,
      alert: false
    };

    // if video
    if (message.startsWith("#video:")) {
      if (!canSendVideo.value) return;

      // url parsing
      const url = message.replace("#video:", "").trim();

      // Extract YT url
      const videoId = extractYouTubeId(url);
      if (!videoId) {
        return systemMessage("Invalid url");
      }

      // For changing
      const isHost = hasControls.value;
      // If someone else is host → block
      if (player.value && !isHost) {
        return systemMessage("Can't play since a video is already playing.");
      }

      // Become host
      hasControls.value = true;
      spaceChannel.value.track({ role: "host" });

      // ALWAYS reset locally (but keep host role)
      if (player.value) {
        await resetVideo("Switched video...", false);
      } else {
        // If starting video
        await resetVideo("Started video...", false);
      }

      // Init locally
      await initPlayer(videoId, 0);

      // Broadcast to everyone
      broadcastVideo("init", 0, videoId);

      return; // stop further
    }

    // Broadcast to others
    broadcastMessage(msg.text);
    // Add locally
    addMessage(msg);
  }

  // ---------------- Space functions
  async function inviteSpace() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          text: "Join me here 👋",
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch (err) {
      console.error("Sharing failed:", err);
    }
  }

  // Change space
  async function changeSpace(name) {
    if (!name) return;

    // already in this space
    if (activeSpace.value === name && spaceChannel.value) return;

    // cleanup old channel (ONLY unsubscribe)
    if (spaceChannel.value) {
      if (videoState.value.visible) {
        await resetVideo("Switched space... Video stopped...");
      }
      await spaceChannel.value.unsubscribe();
      spaceChannel.value = null;
    }

    activeSpace.value = name;
    spaceInput.value = name;

    // update URL only if different
    if (route.params.name !== name) {
      router.push({
        name: "space",
        params: { name }
      });
    }

    const channel = supabase
      .channel(name, {
        config: {
          broadcast: { self: false },
          presence: { key: clientId }
        }
      })
      .on("broadcast", { event: "message" }, onMessage)
      .on("broadcast", { event: "video" }, onVideoEvent)
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();

        let hostId = null;

        for (const [key, users] of Object.entries(state)) {
          for (const user of users) {
            if (user.role === "host") {
              hostId = key;
              break;
            }
          }
          if (hostId) break;
        }

        if (videoState.value.visible && !hasControls.value && !hostId) {
          resetVideo("Host disconnected...Video stopped...");
        }
      });

    spaceChannel.value = channel;

    channel.subscribe(status => {
      let text = "";

      if (status === "SUBSCRIBED") {
        text = `You are in ${name} :)`;

        canSendMessage.value = true;
      }

      if (status === "CLOSED") {
        text = `You left ${name}`;

        canSendMessage.value = false;
      }

      if (status === "CHANNEL_ERROR") {
        text = `Something went wrong with ${name}`;

        canSendMessage.value = false;
      }

      if (text) {
        systemMessage(text);
      }
    });
  }

  onBeforeMount(() => {
    const initial = route.params.name ?? "Mars";

    spaceInput.value = initial;
    changeSpace(initial);

    setTimeout(() => {
      canSendVideo.value = true;
    }, 4000);
  });

  // watch URL changes (/space/xxx)
  watch(
    () => route.params.name,
    newName => {
      if (typeof newName === "string" && newName !== activeSpace.value) {
        changeSpace(newName);
      }
    }
  );

  // cleanup on destroy
  onBeforeUnmount(async () => {
    if (spaceChannel.value) {
      await spaceChannel.value.unsubscribe();
      spaceChannel.value = null;
    }

    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
  });
</script>

<style scoped>
  .gradient-text {
    font-weight: 600;
    font-size: 18px;
    display: inline-block;

    background: linear-gradient(90deg, hsl(var(--p)), hsl(var(--s)));

    -webkit-background-clip: text;
    background-clip: text;

    -webkit-text-fill-color: transparent;
    color: transparent;
  }
</style>
