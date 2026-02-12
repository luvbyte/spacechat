const DEFAULT_USERNAME = "Someone";

function bytesToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

export async function encryptMessage(message, password) {
  const enc = new TextEncoder();

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(message)
  );

  return {
    cipher: bytesToBase64(new Uint8Array(encrypted)),
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv)
  };
}

function base64ToBytes(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

export async function decryptMessage(cipher, password, salt, iv) {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToBytes(salt),
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: base64ToBytes(iv)
    },
    key,
    base64ToBytes(cipher)
  );

  return dec.decode(decrypted);
}

export function generateUUID() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  // Fallback UUID v4 generator
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function extractYouTubeId(url) {
  try {
    const parsedUrl = new URL(url);

    // 1 Standard watch URL
    if (parsedUrl.searchParams.get("v")) {
      return parsedUrl.searchParams.get("v");
    }

    // 2 Short youtu.be URL
    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.split("/")[1];
    }

    // 3 /embed/VIDEO_ID
    if (parsedUrl.pathname.includes("/embed/")) {
      return parsedUrl.pathname.split("/embed/")[1];
    }

    // 4 /shorts/VIDEO_ID
    if (parsedUrl.pathname.includes("/shorts/")) {
      return parsedUrl.pathname.split("/shorts/")[1];
    }

    return null;
  } catch (err) {
    return null;
  }
}

export function getClientId() {
  const existing = localStorage.getItem("space-chat-clientID");
  if (existing) return existing;

  const id = "u0" + Math.floor(100000 + Math.random() * 900000);
  localStorage.setItem("space-chat-clientID", id);
  return id;
}

export function getClientUsername() {
  const existing = localStorage.getItem("space-chat-userName");
  if (existing) return existing;

  localStorage.setItem("space-chat-userName", DEFAULT_USERNAME);
  return DEFAULT_USERNAME;
}
