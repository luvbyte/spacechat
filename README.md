## 🚀 SpaceChat

---

SpaceChat is a real-time collaborative chat app where users can join shared “Spaces”, chat instantly, and watch synchronized YouTube videos together.
Built with Vue 3, Supabase Realtime, and TailwindCSS (DaisyUI).

---

## ✨ Features

---

[+] 💬 Real-time chat (Supabase Broadcast)
[+] 👥 Join custom “Spaces” (channels)
[+] 🎬 Synchronized YouTube playback
[+] 👑 Automatic host system (first video sender becomes host)
[+] 🔁 Drift correction & periodic sync
[+] 🖼️ Inline image sharing
[+] 🎭 Text effects & secret commands
[+] 📱 Native share / invite support

---

## 💬 Chat Commands

---

SpaceChat supports special inline commands:

### 📺 Start a Video
#video:https://youtube.com/watch?v=VIDEO_ID

### 🖼️ Send an Image
#image:https://image-url.com optional message

### 🎧 Send Audio (under development)
#audio:https://audio-url.com optional caption

### 🎭 Text Effect
#effect:shake This text will shake

### 🕵 Secret Mode
#secret


- You can select type from Input Panel Options

---

## 🏗️ Tech Stack

---

Vue 3 (Composition API)
Supabase Realtime
TailwindCSS / DaisyUI (UI styling)

---

## 📦 Installation

```bash

git clone https://github.com/luvbyte/spacechat.git
cd spacechat
pnpm install
pnpm dev

Visit http://localhost:5174

```

## 🔑 Environment Setup

---

Create a .env file:
Copy code

VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_anon_key
Make sure Realtime is enabled in your Supabase project.

---

## 🛡️ Limitations

---

Only one video at a time
Host disconnect stops video
No persistent message history (Realtime only)
No moderation tools yet

---

