<script setup>
  import { ref, onBeforeMount, onBeforeUnmount, nextTick, watch } from "vue";
  import { useRoute, useRouter } from "vue-router";
  import { supabase } from "@/utils/supabase.js";

  import { extractYouTubeId, getClientId } from "@/api";

  import Sidebar from "@/components/Sidebar.vue";
  import Bubble from "@/components/Bubble.vue";
  import InputBox from "@/components/InputBox.vue";

  import YouTubePlayer from "youtube-player";

  // ---------------- router
  const router = useRouter();
  const route = useRoute();

  const spaceChannel = ref(null);

  // video
  const canSendVideo = ref(false);

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
  const myName = ref("someone");

  // FUNCTIONS
  // Video
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

  async function resetVideo(reason = "Video stopped") {
    if (player.value) {
      await player.value.destroy();
      player.value = null;
    }

    videoState.value.visible = false;
    videoState.value.videoId = null;
    videoState.value.playing = false;

    if (spaceChannel.value) {
      spaceChannel.value.untrack();
    }

    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }

    hasControls.value = false;
    playerReady.value = false;
    pendingAction = null;

    addMessage({
      name: "System",
      text: reason,
      self: false,
      alert: true
    });
  }

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
      // Video
      else if (commandPart.startsWith("video:")) {
        if (player.value) return;

        const url = commandPart.slice("video:".length);
        const videoId = extractYouTubeId(url);

        if (!videoId) {
          message.type = "text";
          message.content = "Invalid YouTube link";
          return;
        }

        initPlayer(videoId, 0);
        broadcastVideo("init", 0, videoId);

        message.type = "text";
        message.content = "▶ Started a video";
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

  function addMessage(msg) {
    // Parsing
    messages.value.push(parseMessage(msg));

    nextTick(() => {
      chatBox.value?.scrollTo(0, chatBox.value.scrollHeight);
    });
  }

  function onMessage(msg) {
    const payload = msg.payload;

    addMessage({
      name: payload.name,
      text: payload.text,
      self: false,
      alert: false
    });
  }

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

  // CHANGE SPACE
  async function changeSpace(name) {
    if (!name) return;

    // already in this space
    if (activeSpace.value === name && spaceChannel.value) return;

    // cleanup old channel (ONLY unsubscribe)
    if (spaceChannel.value) {
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
          resetVideo("Host disconnected. Video stopped.");
        }
      });

    spaceChannel.value = channel;

    channel.subscribe(status => {
      let text = "";

      if (status === "SUBSCRIBED") {
        text = `You are in ${name} :)`;
      }

      if (status === "CLOSED") {
        text = `You left ${name}`;
      }

      if (status === "CHANNEL_ERROR") {
        text = `Something went wrong with ${name}`;
      }

      if (text) {
        addMessage({
          name: "System",
          text,
          self: true,
          alert: true
        });
      }
    });
  }

  // SEND MESSAGE
  function sendMessage(message) {
    if (!message.trim()) return;
    if (!spaceChannel.value) return;

    // if video
    if (message.startsWith("#video:")) {
      if (player.value || !canSendVideo.value) return;

      hasControls.value = true;
      // Mark yourself as host
      spaceChannel.value.track({ role: "host" });

      if (player.value && playerReady.value) {
        startHostSync();
      }
    }

    const msg = {
      name: "You",
      text: message,
      self: true,
      alert: false
    };

    spaceChannel.value.send({
      event: "message",
      type: "broadcast",
      payload: { name: `${myName.value} (${clientId})`, text: message }
    });

    addMessage(msg);
    inputText.value = "";
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

<template>
  <div class="flex-1 flex flex-col bg-base-200 overflow-hidden">
    <!-- Space Join Bar -->
    <div
      class="px-4 py-3 bg-base-100/80 backdrop-blur border-b border-base-300"
    >
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2">
          <button @click="showSidebar = true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M4 18h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1m0-5h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1s.45 1 1 1M3 7c0 .55.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1H4c-.55 0-1 .45-1 1"
              />
            </svg>
          </button>

          <span class="font-semibold text-[17px]">Space</span>
        </div>

        <input
          v-model="spaceInput"
          class="input input-sm w-full rounded-full bg-transparent focus:outline-none focus:ring-2 focus:ring-primary"
        />

        <div class="flex gap-2 items-center">
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
        </div>
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
      class="flex-1 flex flex-col overflow-y-auto overflow-x-hidden p-2 py-4 gap-3 bg-base-200"
    >
      <Bubble v-for="(message, i) in messages" :key="i" :message />
    </div>

    <InputBox :sendMessage :myName :updateName="name => (myName = name)" />

    <!-- Sidebar -->
    <Transition name="slide-right">
      <Sidebar v-show="showSidebar" :close="() => (showSidebar = false)" />
    </Transition>
  </div>
</template>
