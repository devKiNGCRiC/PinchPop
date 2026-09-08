# PinchPop — Gesture-Controlled Photobooth Game

> **Capture. Solve. Remember.**

PinchPop is a browser-based interactive photobooth game that combines **real-time hand gesture recognition, photography, puzzle solving, and playful visual effects**.

Use your hands to frame a photo, pinch to capture it, solve the resulting puzzle using hand gestures, and transform the completed puzzle into a shareable polaroid-style memory.

The project started as a lightweight vanilla JavaScript prototype and is being developed into a more complete web application with user accounts, game statistics, galleries, achievements, leaderboards, and cloud storage.

---

## ✨ What is PinchPop?

PinchPop turns a simple webcam into an interactive game.

Instead of clicking buttons with a mouse, the player interacts with the application using **hand gestures**.

### The core experience

```text
        ✋        ✋
         \      /
          \    /
           📷
            ↓
       FRAME PHOTO
            ↓
      🤏 PINCH TO CAPTURE
            ↓
       3 SECOND COUNTDOWN
            ↓
        📸 PHOTO
            ↓
      ┌─────────────┐
      │   3 × 3     │
      │   PUZZLE    │
      └─────────────┘
            ↓
       🤏 DRAG PIECES
            ↓
          SOLVE
            ↓
           💥
        SHATTER
            ↓
        📸 POLAROID
            ↓
        SAVE / SHARE
```

The goal is to make photography itself part of the gameplay.

---

## 🎮 How to Play

| Gesture               | Action                         |
| --------------------- | ------------------------------ |
| Raise both hands      | Start hand tracking            |
| Use index fingers     | Define the photo frame         |
| Pinch with both hands | Capture the photo              |
| Pinch one hand        | Select and drag a puzzle piece |
| Release pinch         | Drop the puzzle piece          |
| Closed fist           | Complete/save the puzzle       |

### Complete game flow

1. Raise both hands in front of the camera.
2. Position your index fingers to create the photo frame.
3. Pinch with both hands.
4. A 3-second countdown begins.
5. The camera captures your photo.
6. The image becomes a 3 × 3 puzzle.
7. Solve the puzzle using hand gestures.
8. Complete the puzzle.
9. The puzzle pieces shatter with a visual effect.
10. Your completed photo is presented as a polaroid-style memory.
11. After completing the required puzzles, a photo strip can be generated.

---

## 🧩 Core Features

### 📸 Gesture-Controlled Photography

Use your hands instead of traditional camera controls.

* Hand-based photo framing
* Pinch-to-capture interaction
* Countdown animation
* Camera flash effect
* Webcam integration

### 🧩 Gesture-Controlled Puzzle

The captured image becomes an interactive puzzle.

* 3 × 3 puzzle
* Hand-controlled piece dragging
* Automatic piece snapping
* Move tracking
* Puzzle completion detection

### 🎨 Photo Transformation

The game uses visual effects to make the experience feel like a physical photobooth.

* Black-and-white puzzle
* Full-colour completed photo
* Polaroid-style presentation
* Photo numbering
* Date stamping
* Puzzle-piece shatter animation

### 🔊 Sound Design

Interactive sounds are generated using the Web Audio API.

* Countdown beeps
* Capture sound
* Puzzle-piece snap
* Shatter effect
* Completion sound

### 🎥 Game Recording

The browser's MediaRecorder API can be used to record gameplay sessions and export them as WebM video.

---

# 🚀 Project Vision

PinchPop is being developed beyond the original standalone prototype into a complete interactive gaming platform.

The long-term goal is:

```text
                   PINCHPOP
                       │
        ┌──────────────┼──────────────┐
        │              │              │
     GAMEPLAY        USERS          SOCIAL
        │              │              │
    Gestures        Profiles       Gallery
    Camera          Auth           Sharing
    Puzzles         History        Leaderboard
    Scoring         Statistics     Achievements
```

The application will combine:

* Computer vision
* Real-time gesture recognition
* Interactive image processing
* Browser-based gaming
* Cloud storage
* User profiles
* Gamification
* Social sharing

---

# 🏗️ Planned Architecture

The project is being gradually transitioned from the original vanilla JavaScript prototype into a structured application architecture.

```text
                         PINCHPOP
                            │
             ┌──────────────┼──────────────┐
             │              │              │
         FRONTEND        BACKEND        STORAGE
             │              │              │
        React / Vite     Supabase       Supabase
        TypeScript          │            Storage
             │              │
       ┌─────┼─────┐    ┌───┼────┐
       │     │     │    │   │    │
    Camera Puzzle Audio Auth DB  Sessions
       │
   MediaPipe
       │
 Hand Gestures
```

### Frontend

Planned application technologies include:

* React
* TypeScript
* Vite
* CSS
* MediaPipe
* Canvas API
* Web Audio API
* MediaRecorder API
* Zustand

### Backend

The planned backend uses Supabase for:

* Authentication
* PostgreSQL database
* User profiles
* Game sessions
* Scores
* Achievements
* Gallery metadata
* Cloud storage

### Deployment

The intended deployment architecture is:

```text
GitHub
   ↓
Vercel
   ↓
PinchPop Web Application
   ↓
Supabase
 ┌────┼────┐
Auth  DB  Storage
```

---

# 🎯 Game Modes

## Classic Mode

The original PinchPop experience.

```text
Capture
   ↓
3 × 3 Puzzle
   ↓
Solve
   ↓
Polaroid
```

---

## ⚡ Speed Run

Solve the puzzle as quickly as possible.

The game can track:

* Completion time
* Number of moves
* Incorrect placements
* Accuracy
* Final score

Example:

```text
╔════════════════════╗
║    YOUR SCORE      ║
╠════════════════════╣
║ Time       18.42s  ║
║ Moves          27  ║
║ Accuracy       94% ║
╚════════════════════╝
```

---

## 📅 Daily Challenge

A shared challenge that changes every day.

Players can compete for the best completion time and score.

```text
        DAILY CHALLENGE

        September 8, 2026

          🧩 3 × 3

        Best Time
          12.81s

          [ PLAY ]
```

---

## 🎉 Party Mode

A future multiplayer-style mode where multiple players compete by completing their own puzzles.

```text
Player 1
   ↓
Capture → Solve

Player 2
   ↓
Capture → Solve

Player 3
   ↓
Capture → Solve

   ↓

🏆 Winner
```

---

# 👤 User Accounts

Users will eventually be able to create accounts and maintain their own PinchPop profile.

A profile can contain:

```text
Username
Avatar
Photos captured
Puzzles completed
Best time
Total score
Achievements
```

Guest mode can remain available so users can try the game without creating an account.

---

# 📸 Personal Gallery

Completed photos can be stored in the user's personal gallery.

```text
MY GALLERY

┌────────┐ ┌────────┐ ┌────────┐
│  📸    │ │  📸    │ │  📸    │
│        │ │        │ │        │
└────────┘ └────────┘ └────────┘

┌────────┐ ┌────────┐
│  📸    │ │  📸    │
│        │ │        │
└────────┘ └────────┘
```

Users will be able to:

* View photos
* Download photos
* Delete photos
* Share photos
* View associated game statistics

---

# 🏆 Achievements

PinchPop will use achievements to encourage continued gameplay.

Examples:

| Achievement       | Requirement                                      |
| ----------------- | ------------------------------------------------ |
| 📸 First Snap     | Capture your first photo                         |
| 🧩 Puzzle Master  | Complete 10 puzzles                              |
| ⚡ Speed Demon     | Complete a puzzle under 10 seconds               |
| 📷 Photographer   | Save 25 photos                                   |
| 🎯 Perfect Solve  | Complete a puzzle without an incorrect placement |
| 👑 Daily Champion | Finish #1 in a daily challenge                   |

---

# 🏅 Leaderboard

Players can compete through different leaderboard categories.

### Daily

Best scores for the current day.

### Weekly

Best scores for the current week.

### All-Time

Overall best scores.

Example:

```text
🏆 LEADERBOARD

 #    PLAYER       TIME
────────────────────────
 1    Alex         08.42s
 2    Sarah        09.17s
 3    King         10.23s
 4    John         11.84s
 5    Maya         12.02s
```

---

# 🧠 Computer Vision & Gesture System

One of the main technical components of PinchPop is real-time hand tracking.

```text
Webcam
   ↓
MediaPipe
   ↓
Hand Landmarks
   ↓
Gesture Detection
   ↓
Gesture Engine
   ↓
Game Controller
   ↓
UI / Canvas
```

The gesture engine interprets hand landmark positions and converts them into game actions.

Example:

```text
OPEN HAND
    ↓
Frame / Track

PINCH
    ↓
Capture / Drag

RELEASE
    ↓
Drop Piece

FIST
    ↓
Complete / Save
```

The gesture recognition system is one of the primary computer-vision components of the project.

---

# 🧱 Planned Project Structure

The application will gradually move toward a modular structure similar to:

```text
pinchpop/
│
├── src/
│   ├── components/
│   │   ├── Camera/
│   │   ├── GestureOverlay/
│   │   ├── PuzzleBoard/
│   │   ├── Polaroid/
│   │   ├── PhotoStrip/
│   │   └── Leaderboard/
│   │
│   ├── pages/
│   │   ├── Landing/
│   │   ├── Home/
│   │   ├── Game/
│   │   ├── Gallery/
│   │   ├── Profile/
│   │   └── Share/
│   │
│   ├── game/
│   │   ├── gestureEngine.ts
│   │   ├── puzzleEngine.ts
│   │   ├── scoringEngine.ts
│   │   ├── cameraEngine.ts
│   │   └── audioEngine.ts
│   │
│   ├── lib/
│   │   ├── supabase.ts
│   │   └── storage.ts
│   │
│   ├── store/
│   │   └── gameStore.ts
│   │
│   └── types/
│
├── public/
│
├── README.md
└── package.json
```

This structure represents the **planned architecture** and may evolve during development.

---

# 🛠️ Tech Stack

| Technology        | Purpose                             |
| ----------------- | ----------------------------------- |
| React             | Frontend UI                         |
| TypeScript        | Type-safe application development   |
| Vite              | Development and build tooling       |
| MediaPipe         | Real-time hand tracking             |
| Canvas API        | Puzzle rendering and visual effects |
| Web Audio API     | Procedural sound effects            |
| MediaRecorder API | Gameplay recording                  |
| Zustand           | Client-side state management        |
| Supabase          | Backend services                    |
| PostgreSQL        | Application database                |
| Supabase Storage  | Photo storage                       |
| GitHub            | Version control                     |
| Vercel            | Planned deployment                  |

---

# 🌐 Browser Support

| Browser         | Support                |
| --------------- | ---------------------- |
| Chrome          | Recommended            |
| Edge            | Recommended            |
| Firefox         | Supported              |
| Safari          | Limited                |
| Mobile browsers | Experimental / Limited |

A device with a working webcam is required for the full experience.

Camera and microphone permissions may be requested by the browser depending on the features being used.

---

# 🔐 Privacy

PinchPop is designed around browser-based camera interaction.

The application should request camera access only when required.

For the future cloud-enabled version:

* Users should control whether photos are saved.
* Authentication should be handled through Supabase Auth.
* Database access should be protected using Row Level Security.
* Users should only be able to access their own private gallery data.
* Shared photos should use explicitly generated public/shareable resources.

Privacy and secure data handling will remain an important part of the project's development.

---

# 🗺️ Development Roadmap

## Phase 1 — Core Game

* [x] Webcam integration
* [x] Hand tracking
* [x] Gesture-based framing
* [x] Pinch capture
* [x] Countdown
* [x] Photo capture
* [x] 3 × 3 puzzle
* [x] Gesture-based puzzle interaction
* [x] Puzzle completion
* [x] Polaroid presentation
* [x] Sound effects
* [x] Shatter animation

## Phase 2 — Product Experience

* [ ] Landing page
* [ ] Home screen
* [ ] Game screen
* [ ] Results screen
* [ ] Gallery
* [ ] Profile
* [ ] Better responsive design
* [ ] Loading states
* [ ] Error handling
* [ ] Camera permission handling

## Phase 3 — Backend

* [ ] Supabase integration
* [ ] Authentication
* [ ] User profiles
* [ ] Game sessions
* [ ] Score storage
* [ ] Photo storage
* [ ] Personal gallery

## Phase 4 — Gamification

* [ ] Scoring system
* [ ] Leaderboard
* [ ] Achievements
* [ ] Daily challenge
* [ ] Speed Run mode
* [ ] Player statistics
* [ ] Streak system

## Phase 5 — Social & Deployment

* [ ] Shareable photo pages
* [ ] Public photo links
* [ ] Downloadable photo strips
* [ ] Production deployment
* [ ] Performance optimization
* [ ] Mobile testing

## Future Ideas

* [ ] AI-based photo categorization
* [ ] Additional puzzle sizes
* [ ] Custom photo frames
* [ ] Themes
* [ ] Party mode
* [ ] Multiplayer
* [ ] Public profiles
* [ ] Social reactions

---

# 📊 Project Goals

PinchPop aims to demonstrate practical implementation of:

* Real-time computer vision
* Gesture recognition
* Interactive image processing
* Browser APIs
* Game mechanics
* State management
* Full-stack web development
* Authentication
* Database design
* Cloud storage
* Gamification
* Web deployment

The project is being developed as a larger full-stack application rather than remaining only a standalone browser demo.

---

# 🤝 Development

PinchPop is an evolving project. Features, architecture, and technologies may change as development progresses.

The repository will document the transition from the original prototype into the expanded PinchPop application.

---

# 📄 Attribution & License

PinchPop was initially developed from the existing **PuzzleCam** prototype by **Unnati-23**.

Original repository:

`https://github.com/Unnati-23/puzzlecam`

The original project's license and attribution requirements should be reviewed and preserved where applicable.

PinchPop's licensing will follow the applicable requirements of the original project while documenting the modifications and additions made during its development.

---

# 👨‍💻 Project

**PinchPop — Gesture-Controlled Photobooth Game**

> **Capture • Solve • Remember**