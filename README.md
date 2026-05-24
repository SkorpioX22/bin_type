# bin_type
https://skorpiox22.github.io/bin_type/
A minimalist, high-aesthetic text environment engineered for focus, privacy, and decentralized portability.

## Overview

bin_type is a lightweight, high-performance writing environment that operates on a strictly **serverless** and **decentralized** model. By eliminating the need for a backend, database, or API, bin_type ensures that the user remains the sole proprietor of their data.

## Core Architecture

### Serverless Execution
The application is a pure client-side implementation. All processing—from real-time character rendering to state serialization—occurs within the user's local browser environment. There is zero telemetry, zero data exfiltration, and no reliance on central infrastructure.

### Decentralized Text Sharing
bin_type replaces traditional cloud synchronization with a decentralized "TextCode" protocol. Documents are compressed into high-entropy, URL-safe strings using native Deflate algorithms. 
- **Peer-to-Peer Portability**: Share documents by simply transmitting the generated code via any medium (email, chat, physical print).
- **Infinite Persistence**: As long as the TextCode exists, the document exists. It is independent of server uptime or platform longevity.
- **Privacy by Design**: Data is only decoded when explicitly pasted into a bin_type instance. No unencrypted text ever transits a third-party server.

## Technical Specifications

- **Typography**: Optimized with JetBrains Mono for maximum character clarity.
- **Rendering**: Real-time DOM injection with CSS-driven character fade-in transitions.
- **Zoom Engine**: Proportional scaling from 0.1x to 50x magnification with dynamic line wrapping.
- **Serialization**: High-efficiency state persistence using the browser's native `CompressionStream` (Deflate) and Base64 encoding.
- **Architecture**: Pure Zero-Dependency implementation using modern ES6+ and CSS3.

## Operation & Shortcuts

| Command | Action |
| :--- | :--- |
| CTRL + / | Toggle technical instructions overlay |
| CTRL + Scroll | Adjust viewport magnification |
| ESC | Close active overlays |
| ENTER | Intelligent newline insertion (Caret-aware) |

## Setup

1. Clone the project directory.
2. Launch `index.html` in a modern web browser.
3. The environment initializes focus automatically.

---
Serverless. Decentralized. Disciplined.
