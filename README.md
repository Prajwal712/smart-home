# 🏠 Smart Home — Classroom Automation System

> An IoT-based smart home dashboard for controlling classroom lighting using **ESP32**, **MQTT**, and a modern **web interface**.


---

## ✨ Features

| Feature | Description |
|---|---|
| **Real-time Control** | Toggle classroom lights ON/OFF from any device with instant MQTT feedback |
| **Automated Scheduling** | Create recurring weekly schedules — lights turn ON/OFF automatically |
| **Live Status** | MQTT state topics keep the dashboard in sync with physical hardware |
| **Dark / Light Theme** | Toggle between themes with your preference saved in `localStorage` |
| **Responsive Design** | Works on desktop, tablet, and mobile — glassmorphism UI with smooth animations |
| **Login System** | Simple session-based authentication to protect the dashboard |
| **Toast Notifications** | Visual feedback for schedule triggers, manual toggles, and errors |

---

## 📁 Project Structure

```
smart-home/
│
├── index.html                          # Main dashboard (HTML structure)
│
├── css/
│   └── styles.css                      # All styles — design tokens, components, responsive
│
├── js/
│   ├── auth.js                         # Login, logout, theme toggle, session management
│   ├── mqtt.js                         # MQTT connection, light toggling, state sync
│   └── scheduler.js                    # Schedule CRUD, execution engine, toasts
│
├── firmware/
│   └── smart_home_esp32/
│       └── smart_home_esp32.ino        # Arduino sketch for ESP32
│
└── README.md
```

---

## 🛠️ Tech Stack

### Web Dashboard
- **HTML5 / CSS3 / Vanilla JS** — no frameworks, zero build step
- **[MQTT.js](https://github.com/mqttjs/MQTT.js)** — WebSocket MQTT client
- **[Lucide Icons](https://lucide.dev)** — beautiful open-source icon set
- **[Inter](https://rsms.me/inter/)** — Google Fonts typography

### Hardware / Firmware
- **ESP32 DevKit** — dual-core microcontroller with built-in Wi-Fi
- **Arduino IDE** — development environment
- **PubSubClient** — MQTT library for Arduino
- **HiveMQ Public Broker** — `broker.hivemq.com` (port `1883` for ESP32, `8884` WSS for web)

---

## 🚀 Getting Started

### 1. Flash the ESP32

1. Open `firmware/smart_home_esp32/smart_home_esp32.ino` in **Arduino IDE**.
2. Install required libraries via the Library Manager:
   - `PubSubClient` by Nick O'Leary
   - `WiFi` (built-in for ESP32)
3. **Update your Wi-Fi credentials** in the sketch:
   ```cpp
   const char* ssid     = "YOUR_WIFI_SSID";
   const char* password = "YOUR_WIFI_PASSWORD";
   ```
4. Select your board: **Tools → Board → ESP32 Dev Module**
5. Upload the sketch.

#### GPIO Pin Mapping

| Pin | Device |
|-----|--------|
| GPIO 2 | Light 1 (Classroom 1) |
| GPIO 4 | Light 2 (Classroom 2) |

### 2. Open the Web Dashboard

Simply open `index.html` in any modern browser — **no server required**.

> **Login credentials:**
> - Username: `default` — Password: `default`
> - Username: `admin` — Password: `admin`

The dashboard will automatically connect to the HiveMQ public broker via WebSocket (`wss://broker.hivemq.com:8884/mqtt`).

---

## 📡 MQTT Topics

| Topic | Direction | Payload | Description |
|---|---|---|---|
| `smart_home/light1` | Web → ESP32 | `ON` / `OFF` | Command to toggle Light 1 |
| `smart_home/light2` | Web → ESP32 | `ON` / `OFF` | Command to toggle Light 2 |
| `smart_home/light1/state` | ESP32 → Web | `ON` / `OFF` | Light 1 confirmed state |
| `smart_home/light2/state` | ESP32 → Web | `ON` / `OFF` | Light 2 confirmed state |

### Communication Flow

```
┌──────────────┐      MQTT Command       ┌──────────────┐
│              │ ─────────────────────▶   │              │
│  Web Browser │   smart_home/light1 ON   │    ESP32     │
│  (Dashboard) │                          │  (Firmware)  │
│              │ ◀─────────────────────   │              │
└──────────────┘  smart_home/light1/state └──────────────┘
                         ON (confirm)
```

---

## ⏰ Scheduler

The scheduling engine runs entirely **client-side** in the browser:

- Schedules are persisted in `localStorage`
- A check runs every **3 seconds** to evaluate active windows
- When a schedule window opens → publishes `ON` to the device's MQTT topic
- When a schedule window closes → publishes `OFF`
- Supports per-day selection (Mon–Sun), custom durations, and named labels

---

## 🎨 UI Preview

The dashboard features:
- **Glassmorphism cards** with `backdrop-filter` blur
- **Animated gradient mesh** background
- **Micro-animations** — hover lifts, floating orbs, wave emoji, slide-up toasts
- **Design tokens** via CSS custom properties for consistent theming

---

## ⚠️ Notes

- The **HiveMQ public broker** is shared and unencrypted — **do not use for production**. For a real deployment, use a private MQTT broker with TLS and authentication.
- The login system is **demo-only** (credentials are hardcoded in `auth.js`). Replace with a proper backend for production use.
- The web dashboard must remain open in a browser tab for scheduled automation to execute (schedules run client-side).

---

## 📜 License

This project was built for educational purposes as part of an internship at IIT Jodhpur.
