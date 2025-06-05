# WebScripts Loader & Pocket Waifu Hack

**Author: ZenbladeJS**

---

## 🚀 Project Overview

This project is an evolving framework for modular, script-based browser hacks and utilities.

At its core, it provides a **clean script loader** that:

* 📅 Dynamically loads and caches user scripts
* 🔄 Provides isolated per-script API injection
* 🔐 Prevents global namespace pollution
* 👌 Offers a minimal, professional framework structure

It is designed to be **simple, fast, and scalable** — you can add more user scripts, more APIs, and more features without bloating or breaking the architecture.

---

## 🎮 Pocket Waifu Hack — Current Script

The current "main" user script is a **Pocket Waifu Coin Hack** for the Nutaku game:

### What it does:

When you select any minigame, and then **quit the minigame** (you don't even have to play it):

* 🔄 It gives you the **highest possible score**
* 🔄 It gives you the **maximum safe coin count** (500 coins)

---

### Why this works:

* The server does not verify how long the minigame was played (very inefficient to track)
* The game client sends the score/coins at the end → so we intercept and modify that data
* It's not worth it for the server to track this properly, and the client is easily modifiable

---

### Why is 500 coins safe?

* If you send a **coin count higher than 500**, you will get banned.
* Normal players earn about **100 coins per 2 minutes** → so earning 500 coins would normally take about **6 hours**.
* Our hack "fakes" this safely by sending a "normal-looking" max value.

---

### In short:

* 🔄 Skip grinding
* 🔄 Instantly get max coins per minigame
* 🔄 Safe if used within known limits
* 🔄 No need to actually play minigame → just enter and quit 🚀

---

## 🚧 Future Plans

I am building this as a **general framework** — Pocket Waifu is just the first example.

Planned features:

* 🔄 A **UI library** that allows user scripts to create overlays, buttons, controls
* 🔄 A **ZenLog** system to **capture and download logs** → useful for debugging hacks or game behaviors
* 🔄 A **more advanced API manager** → with versioning, dependencies, and UI components
* 🔄 A cleaner **DevMode** toggle → to allow faster testing

---

## 🔌 Using `createApi` and `getApi`

---

### How to define an API:

In any user script:

```js
global.createApi('myApi', (userScript) => {
    return {
        sayHello: () => console.log(`[${userScript.name}] Hello!`)
    };
});
```

---

### How to use an API:

In the same or another user script:

```js
const myApi = getApi('myApi');

if (myApi) {
    myApi.sayHello();
}
```

---

### How it works:

* 🔄 `global.createApi(apiName, factory)` → Registers a factory function for that API
* 🔄 When you do `getApi('myApi')`, the framework will:

  1️⃣ Inject the **current user script object** → `{ name, file }`
  2️⃣ Call your API factory with it
  3️⃣ Return your API object → now bound to that script

---

### Example result:

```text
[Pocket Waifu Coin Script] Hello!
```

---

## 🚀 Final Notes

I am building this for **fun**, for **learning**, and to create a **reusable framework** for future projects.

Pocket Waifu Hack is just **one example** — the real goal is:

* 🔄 Build a flexible framework
* 🔄 Make game hacking easier
* 🔄 Provide powerful logging / UI tools
* 🔄 Let others write their own scripts easily 🚀

---

### 🎉 Summary

**Current state:**

* 🔄 Pocket Waifu hack works
* 🔄 Core framework (script loader + API manager) is working beautifully
* 🔄 Log system is partially in place (ZenLog will evolve further)

---

**Planned next steps:**

* 🔄 UI Library
* 🔄 Log download (already done but not quite the way i'd like it to be done)
* 🔄 Dynamic script manager
* 🔄 Hot-reload DevMode

---

**Built by:** ZenbladeJS 🚀
**Framework proudly in progress** 🚀🚀🚀

---

## 💬 How to contribute

Right now this is **personal & experimental**, but:

* 🔄 If you write a cool API → register it with `createApi`
* 🔄 If you write a cool script → just load it via the userScriptList
* 🔄 If you have feedback → let's chat 🚀

---

**END README**