# Mnemo

> **Master Vocabulary with Intelligent Spaced Repetition**

Mnemo is a production-ready, offline-first vocabulary learning application designed for serious learners. Built with a "Zen" philosophy found in high-performance tools, it combines a distraction-free interface with a powerful Spaced Repetition System (SRS) to ensure long-term retention.

## Vision

Our vision is to create the ultimate vocabulary acquisition tool for developers and professionals. Mnemo isn't just a flashcard app; it's a **Memory HUD** (Heads-Up Display) that integrates seamlessly into your workflow.

By leveraging a feature-based architecture and modern tech stack, Mnemo delivers a premium, native-app experience that respects your time and cognitive load.

## Key Features

### 🧠 Advanced SRS Engine
Implementation of a modified SM-2 algorithm that optimizes review intervals based on your performance. Mnemo handles the scheduling, so you focus purely on learning.

### 🛡️ Non-Intrusive HUD Interface
A minimalist, "always-on-top" styling option allows for micro-learning sessions without context switching. The interface is designed to be sleek, compact, and beautiful.

### ⚡ Quick Add System
Capture new words instantly. Mnemo integrates dictionary lookups to automatically populate definitions, examples, and phonetic transcriptions, reducing friction in your learning loop.

### 🔄 Local Data Store
Fully offline local storage using electron store and file system. Your data stays on your machine.

### 🚀 Optimized CI/CD
Fully automated pipeline using GitHub Actions v4. Smart matrix strategy runs minimal checks for PRs (Ubuntu/Node 20) while performing comprehensive multi-OS builds for Release tags.

## Tech Stack

- **Core**: Electron, React, TypeScript
- **Styling**: TailwindCSS (Custom Design System)
- **State**: Zustand
- **Build**: Vite

## Installation & Setup

Follow these steps to get Mnemo running locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/AykutDag/mnemo.git
   cd mnemo
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

## Feature-Based Architecture

Mnemo is built with scalability in mind. We utilize a **Feature-Based Architecture** where code is organized by domain rather than type. See [CONTRIBUTING.md](CONTRIBUTING.md) for a detailed breakdown of our structure.

## Contributing

We welcome contributions from the community! Whether it's fixing bugs, improving documentation, or proposing new features, your help is appreciated.

Please read our [Contribution Guide](CONTRIBUTING.md) to get started.

## License

MIT © Aykut Dağ
