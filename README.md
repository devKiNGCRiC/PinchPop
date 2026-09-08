# PinchPop — Gesture-Controlled Photobooth Game

> **Capture. Solve. Remember.**

PinchPop is a cross-platform interactive photobooth experience that combines **real-time hand gesture recognition, photography, puzzle solving, visual effects, gamification, and social photo memories**.

The web application turns a webcam into an interactive camera. Users frame a photo with their hands, pinch to capture it, solve the resulting puzzle using gestures, and transform the completed puzzle into a shareable polaroid-style memory.

PinchPop is evolving from its original lightweight browser prototype into a complete **Web + Mobile experience** powered by a shared backend.

---

## ✨ What is PinchPop?

Traditional photobooths are built around buttons, touchscreens, and physical controls.

PinchPop replaces much of that interaction with **hand gestures**.

Instead of clicking a capture button, users interact with the camera and game using their hands.

### The core experience

```text
                         ✋       ✋
                          \     /
                           \   /
                            📷
                             │
                             ▼
                       FRAME PHOTO
                             │
                             ▼
                      🤏 PINCH TO CAPTURE
                             │
                             ▼
                     3 SECOND COUNTDOWN
                             │
                             ▼
                            📸
                         CAPTURED
                           PHOTO
                             │
                             ▼
                    ┌─────────────────┐
                    │      3 × 3      │
                    │     PUZZLE      │
                    └─────────────────┘
                             │
                             ▼
                       🤏 DRAG PIECES
                             │
                             ▼
                           SOLVE
                             │
                             ▼
                            💥
                          SHATTER
                             │
                             ▼
                           📸
                         POLAROID
                             │
                             ▼
                       SAVE / SHARE
```

The goal is to make **photography itself part of the gameplay**.

---

# 🎮 How to Play

| Gesture               | Action                         |
| --------------------- | ------------------------------ |
| Raise both hands      | Start hand tracking            |
| Use index fingers     | Define the photo frame         |
| Pinch with both hands | Capture the photo              |
| Pinch one hand        | Select and drag a puzzle piece |
| Release pinch         | Drop the puzzle piece          |
| Closed fist           | Complete / save the puzzle     |

### Complete game flow

1. Raise both hands in front of the camera.
2. Position your index fingers to create the photo frame.
3. Pinch with both hands.
4. A 3-second countdown begins.
5. The camera captures your photo.
6. The captured image becomes a 3 × 3 puzzle.
7. Solve the puzzle using hand gestures.
8. Complete the puzzle.
9. Puzzle pieces shatter with a visual effect.
10. The completed photo is presented as a polaroid-style memory.
11. Save, download, or share the result.
12. Complete additional puzzles to build a photo strip.

---

# 🧩 Core Features

## 📸 Gesture-Controlled Photography

Use your hands instead of traditional camera controls.

* Hand-based photo framing
* Pinch-to-capture interaction
* Countdown animation
* Camera flash effect
* Webcam integration
* Gesture-driven interaction

---

## 🧩 Gesture-Controlled Puzzle

Every captured photo becomes an interactive puzzle.

* 3 × 3 puzzle
* Hand-controlled piece dragging
* Automatic piece snapping
* Move tracking
* Puzzle completion detection
* Gesture-based interaction

---

## 🎨 Photo Transformation

PinchPop transforms the puzzle experience into a digital photobooth memory.

* Black-and-white puzzle
* Full-colour completed photo
* Polaroid-style presentation
* Photo numbering
* Date stamping
* Puzzle-piece shatter animation
* Photo strips

---

## 🔊 Sound Design

Interactive sounds are generated using the **Web Audio API** rather than relying on external audio files.

* Countdown beeps
* Capture sound
* Puzzle-piece snap
* Shatter effect
* Completion sound
* UI interaction sounds

---

## 🎥 Gameplay Recording

The web application can use the browser's **MediaRecorder API** to record gameplay sessions.

Recorded sessions can be exported as WebM video.

---

# 🌐 + 📱 Cross-Platform Vision

PinchPop is designed as a **Web + Mobile ecosystem** rather than two completely separate products.

The web application is the primary gameplay platform because it provides direct access to desktop and laptop webcams and supports the full gesture-controlled photobooth experience.

The mobile application acts as a companion experience built around the user's PinchPop account, memories, statistics, achievements, and social features.

```text
                            PINCHPOP
                               │
                ┌──────────────┴──────────────┐
                │                             │
             WEB APP                      MOBILE APP
          React + Vite                 React Native + Expo
                │                             │
       ┌────────┴────────┐           ┌────────┴─────────┐
       │                 │           │                  │
   Full Gameplay      Camera      Profile            Gallery
   Gesture Capture    Puzzle      Achievements       Statistics
   Photo Capture     Scoring      Leaderboard        Sharing
   Game Modes        Recording    History             Notifications
       │                 │           │                  │
       └─────────────────┴───────────┴──────────────────┘
                               │
                               ▼
                            SUPABASE
                    ┌──────────┼──────────┐
                    │          │          │
                   AUTH        DB       STORAGE
```

### Web application

The web application is the primary PinchPop experience.

It focuses on:

* Camera interaction
* Real-time hand tracking
* Gesture-controlled photography
* Puzzle gameplay
* Game modes
* Scoring
* Photo generation
* Gameplay recording
* Photo sharing

### Mobile application

The mobile application is designed as a companion to the web experience.

It focuses on:

* Authentication
* User profile
* Personal gallery
* Achievements
* Leaderboards
* Game statistics
* Photo memories
* Sharing
* Notifications
* Account management

Native mobile gesture-controlled gameplay can be explored as a future feature once the core platform is stable.

---

# 🚀 Project Vision

PinchPop is being developed beyond the original standalone browser prototype into a complete interactive platform.

The long-term vision is:

```text
                            PINCHPOP
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
        GAMEPLAY             USERS                SOCIAL
          │                    │                    │
       Gestures             Profiles             Gallery
       Camera               Auth                 Sharing
       Puzzles              History              Leaderboard
       Scoring              Statistics           Achievements
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
                        CROSS-PLATFORM
                               │
                    ┌──────────┴──────────┐
                    │                     │
                   WEB                 MOBILE
```

The platform combines:

* Computer vision
* Real-time gesture recognition
* Interactive image processing
* Browser-based gaming
* Mobile application development
* Cloud storage
* User profiles
* Authentication
* Gamification
* Social sharing
* Digital photo memories

---

# 🏗️ System Architecture

PinchPop uses a shared backend architecture so that the web and mobile applications can work with the same user accounts, photos, statistics, achievements, and game data.

```text
                         ┌──────────────────────┐
                         │       PINCHPOP       │
                         └──────────┬───────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
         ┌────────▼────────┐                 ┌────────▼────────┐
         │    WEB APP      │                 │   MOBILE APP    │
         │                 │                 │                 │
         │ React           │                 │ React Native    │
         │ TypeScript      │                 │ Expo            │
         │ Vite            │                 │ TypeScript      │
         └────────┬────────┘                 └────────┬────────┘
                  │                                   │
                  └─────────────────┬─────────────────┘
                                    │
                           ┌────────▼────────┐
                           │    SUPABASE     │
                           ├─────────────────┤
                           │ Authentication  │
                           │ PostgreSQL      │
                           │ Storage         │
                           │ Security / RLS  │
                           └─────────────────┘
```

---

# 🖥️ Web Application Architecture

```text
Web Browser
     │
     ├── Camera
     │
     ▼
MediaDevices API
     │
     ▼
MediaPipe
     │
     ▼
Hand Landmarks
     │
     ▼
Gesture Engine
     │
     ├── Frame
     ├── Pinch
     ├── Release
     └── Fist
     │
     ▼
Game Controller
     │
     ├── Camera Engine
     ├── Puzzle Engine
     ├── Scoring Engine
     └── Audio Engine
     │
     ▼
React UI / Canvas
     │
     ▼
Supabase
```

---

# 📱 Mobile Application Architecture

The mobile application will share the same backend and account system as the web application.

```text
Mobile App
    │
    ▼
React Native + Expo
    │
    ├── Authentication
    ├── Profile
    ├── Gallery
    ├── Achievements
    ├── Leaderboard
    ├── Statistics
    └── Sharing
    │
    ▼
Supabase
    │
    ├── Auth
    ├── PostgreSQL
    └── Storage
```

This allows a user to capture memories on the web and access their PinchPop account and gallery from mobile.

---

# 🧠 Computer Vision & Gesture System

One of the primary technical components of PinchPop is real-time hand tracking.

```text
Webcam
   │
   ▼
MediaPipe
   │
   ▼
Hand Landmarks
   │
   ▼
Gesture Detection
   │
   ▼
Gesture Engine
   │
   ▼
Game Controller
   │
   ▼
UI / Canvas
```

The gesture engine interprets hand landmark positions and converts them into game actions.

### Example

```text
OPEN HAND
    │
    ▼
Frame / Track

PINCH
    │
    ▼
Capture / Drag

RELEASE
    │
    ▼
Drop Piece

FIST
    │
    ▼
Complete / Save
```

The gesture recognition system is one of the primary computer-vision components of PinchPop.

---

# 🎯 Game Modes

## Classic Mode

The original PinchPop experience.

```text
Capture
   │
   ▼
3 × 3 Puzzle
   │
   ▼
Solve
   │
   ▼
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
║     YOUR SCORE     ║
╠════════════════════╣
║ Time       18.42s  ║
║ Moves          27  ║
║ Accuracy       94% ║
╚════════════════════╝
```

---

## 📅 Daily Challenge

A shared challenge that changes every day.

Players compete for the best completion time and score.

```text
       DAILY CHALLENGE

       September 9, 2026

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
   │
   ▼
Capture → Solve

Player 2
   │
   ▼
Capture → Solve

Player 3
   │
   ▼
Capture → Solve

   │
   ▼
🏆 Winner
```

---

# 👤 User Accounts

Users can create a PinchPop account and maintain their own profile.

A profile can contain:

```text
Username
Avatar
Photos Captured
Puzzles Completed
Best Time
Total Score
Achievements
Streak
Statistics
```

Guest mode can remain available so new users can experience the game without creating an account.

---

# 📸 Personal Gallery

Completed photos can be stored in the user's personal PinchPop gallery.

```text
              MY GALLERY

     ┌────────┐ ┌────────┐ ┌────────┐
     │   📸   │ │   📸   │ │   📸   │
     │        │ │        │ │        │
     └────────┘ └────────┘ └────────┘

     ┌────────┐ ┌────────┐
     │   📸   │ │   📸   │
     │        │ │        │
     └────────┘ └────────┘
```

Users can:

* View photos
* Download photos
* Delete photos
* Share photos
* View associated game statistics
* Access their memories from the mobile companion app

---

# 🏆 Achievements

PinchPop uses achievements to encourage continued gameplay.

| Achievement       | Requirement                                      |
| ----------------- | ------------------------------------------------ |
| 📸 First Snap     | Capture your first photo                         |
| 🧩 Puzzle Master  | Complete 10 puzzles                              |
| ⚡ Speed Demon     | Complete a puzzle under 10 seconds               |
| 📷 Photographer   | Save 25 photos                                   |
| 🎯 Perfect Solve  | Complete a puzzle without an incorrect placement |
| 👑 Daily Champion | Finish #1 in a daily challenge                   |

Additional achievements can be introduced as the platform grows.

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

 #     PLAYER        TIME
────────────────────────────
 1     Alex          08.42s
 2     Sarah         09.17s
 3     King          10.23s
 4     John          11.84s
 5     Maya          12.02s
```

---

# ☁️ Backend & Data Architecture

PinchPop uses **Supabase** as the backend platform.

Supabase will provide:

* Authentication
* PostgreSQL database
* User profiles
* Game sessions
* Scores
* Achievements
* Gallery metadata
* Cloud photo storage
* Row Level Security

### Planned data model

```text
profiles
    │
    ├── game_sessions
    │       │
    │       └── scores
    │
    ├── photos
    │
    ├── user_achievements
    │       │
    │       └── achievements
    │
    └── statistics
```

The same backend can be accessed by both the web and mobile applications.

---

# 🗂️ Planned Project Structure

The project is expected to evolve from the current prototype into a modular multi-platform structure.

```text
pinchpop/
│
├── web/
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Camera/
│   │   │   ├── GestureOverlay/
│   │   │   ├── PuzzleBoard/
│   │   │   ├── Polaroid/
│   │   │   ├── PhotoStrip/
│   │   │   └── Leaderboard/
│   │   │
│   │   ├── pages/
│   │   │   ├── Landing/
│   │   │   ├── Home/
│   │   │   ├── Game/
│   │   │   ├── Results/
│   │   │   ├── Gallery/
│   │   │   ├── Profile/
│   │   │   └── Share/
│   │   │
│   │   ├── game/
│   │   │   ├── gestureEngine.ts
│   │   │   ├── puzzleEngine.ts
│   │   │   ├── scoringEngine.ts
│   │   │   ├── cameraEngine.ts
│   │   │   └── audioEngine.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   └── storage.ts
│   │   │
│   │   ├── store/
│   │   │   └── gameStore.ts
│   │   │
│   │   └── types/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── mobile/
│   │
│   ├── app/
│   │   ├── index.tsx
│   │   ├── login.tsx
│   │   ├── gallery.tsx
│   │   ├── profile.tsx
│   │   ├── achievements.tsx
│   │   └── leaderboard.tsx
│   │
│   ├── components/
│   ├── lib/
│   ├── store/
│   ├── types/
│   └── package.json
│
├── supabase/
│   ├── migrations/
│   └── seed/
│
├── README.md
└── .gitignore
```

This structure represents the **planned architecture** and may evolve during development.

The existing vanilla JavaScript prototype remains the foundation for the web gameplay migration.

---

# 🛠️ Technology Stack

## Web

| Technology        | Purpose                             |
| ----------------- | ----------------------------------- |
| React             | Frontend UI                         |
| TypeScript        | Type-safe development               |
| Vite              | Development and build tooling       |
| CSS               | Application styling                 |
| MediaPipe         | Real-time hand tracking             |
| Canvas API        | Puzzle rendering and visual effects |
| Web Audio API     | Procedural sound effects            |
| MediaRecorder API | Gameplay recording                  |
| MediaDevices API  | Webcam access                       |
| Zustand           | Client-side state management        |

## Mobile

| Technology   | Purpose                      |
| ------------ | ---------------------------- |
| React Native | Mobile application           |
| Expo         | Mobile development platform  |
| TypeScript   | Type-safe development        |
| Expo Router  | Application navigation       |
| Zustand      | Client-side state management |

## Backend

| Technology         | Purpose              |
| ------------------ | -------------------- |
| Supabase           | Backend platform     |
| PostgreSQL         | Application database |
| Supabase Auth      | Authentication       |
| Supabase Storage   | Photo storage        |
| Row Level Security | Data protection      |

## Development & Deployment

| Technology | Purpose                             |
| ---------- | ----------------------------------- |
| Git        | Version control                     |
| GitHub     | Source code hosting                 |
| Vercel     | Web deployment                      |
| Expo       | Mobile development and distribution |

---

# 🌐 Web Browser Support

The full gesture-controlled PinchPop experience requires a device with a working camera.

| Browser         | Support           |
| --------------- | ----------------- |
| Chrome          | Recommended       |
| Edge            | Recommended       |
| Firefox         | Supported         |
| Safari          | Limited / Testing |
| Mobile browsers | Limited           |

Camera and microphone permissions may be requested by the browser depending on the features being used.

The web application remains the primary platform for the complete gesture-controlled experience.

---

# 📱 Mobile Platform

The mobile application is intended to provide a companion experience for PinchPop users.

Initial mobile functionality focuses on:

* Account management
* Profile
* Gallery
* Achievements
* Leaderboard
* Statistics
* Photo sharing
* Notifications

Native mobile gesture gameplay is considered a future enhancement rather than a requirement for the initial mobile release.

---

# 🔐 Privacy & Security

PinchPop is designed around privacy-conscious camera interaction.

The application should:

* Request camera access only when required.
* Clearly communicate when the camera is active.
* Allow users to control whether photos are saved.
* Protect authenticated resources through Supabase Auth.
* Use Row Level Security for database access.
* Restrict private gallery data to its owner.
* Use explicitly generated public resources for shared photos.

Privacy and secure data handling remain important parts of the platform.

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

---

## Phase 2 — Web Product Experience

* [ ] React + Vite migration
* [ ] TypeScript migration
* [ ] Production landing page
* [ ] Home screen
* [ ] Game screen
* [ ] Results screen
* [ ] Gallery
* [ ] Profile
* [ ] Responsive design
* [ ] Loading states
* [ ] Error handling
* [ ] Camera permission handling
* [ ] Accessibility improvements
* [ ] Performance optimization

---

## Phase 3 — Backend

* [ ] Supabase integration
* [ ] Authentication
* [ ] User profiles
* [ ] Game sessions
* [ ] Score storage
* [ ] Photo storage
* [ ] Personal gallery
* [ ] Row Level Security
* [ ] Cloud photo management

---

## Phase 4 — Gamification

* [ ] Scoring system
* [ ] Leaderboard
* [ ] Achievements
* [ ] Daily Challenge
* [ ] Speed Run mode
* [ ] Player statistics
* [ ] Streak system
* [ ] Score history

---

## Phase 5 — Social & Sharing

* [ ] Shareable photo pages
* [ ] Public photo links
* [ ] Downloadable photo strips
* [ ] Social sharing
* [ ] Public profiles
* [ ] Photo reactions
* [ ] Privacy controls for shared content

---

## Phase 6 — Mobile Companion

* [ ] React Native + Expo application
* [ ] Shared Supabase authentication
* [ ] Mobile profile
* [ ] Mobile gallery
* [ ] Achievements
* [ ] Leaderboard
* [ ] Game statistics
* [ ] Photo sharing
* [ ] Notifications
* [ ] Mobile-optimized UI
* [ ] Cross-platform account synchronization

---

## Phase 7 — Production

* [ ] Production web deployment
* [ ] Mobile application testing
* [ ] Performance optimization
* [ ] Security review
* [ ] Database optimization
* [ ] Error monitoring
* [ ] Cross-browser testing
* [ ] Cross-device testing
* [ ] Production documentation

---

# 🔮 Future Ideas

Possible future additions include:

* [ ] AI-based photo categorization
* [ ] AI-powered photo enhancements
* [ ] Additional puzzle sizes
* [ ] Custom photo frames
* [ ] Themes
* [ ] Seasonal events
* [ ] Party mode
* [ ] Multiplayer
* [ ] Native mobile gesture capture
* [ ] Mobile camera gameplay
* [ ] Public profiles
* [ ] Social reactions
* [ ] Friend system
* [ ] Photo challenges
* [ ] Community events

These ideas are intentionally separated from the core roadmap so that the primary experience remains focused.

---

# 📊 Project Goals

PinchPop is designed to demonstrate the practical combination of:

* Real-time computer vision
* Hand gesture recognition
* Interactive image processing
* Browser APIs
* Game mechanics
* State management
* Full-stack web development
* Mobile application development
* Authentication
* Database design
* Cloud storage
* Gamification
* Social sharing
* Cross-platform architecture
* Web deployment

The goal is to evolve PinchPop from a simple browser experiment into a polished interactive product.

---

# 🧪 Development & Testing

PinchPop uses a combination of automated and manual testing during development.

Testing areas include:

* Gesture recognition
* Camera permissions
* Puzzle interactions
* Puzzle completion
* Score calculation
* Authentication
* Gallery operations
* Photo uploads
* Sharing
* Responsive layouts
* Browser compatibility
* Mobile application behaviour

Automated browser testing will be introduced as the web application architecture stabilizes.

---

# 🚀 Deployment

The planned production architecture is:

```text
                         GitHub
                           │
             ┌─────────────┴─────────────┐
             │                           │
          Vercel                       Expo
             │                           │
             ▼                           ▼
       PinchPop Web              PinchPop Mobile
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
                        Supabase
                    ┌──────┼──────┐
                    │      │      │
                   Auth     DB   Storage
```

The web application can be deployed independently from the mobile application while both continue using the same backend.

---

# 🤝 Development

PinchPop is an evolving project.

Features, architecture, technologies, and implementation details may change as development progresses.

The repository documents the evolution from the original browser prototype toward a larger cross-platform PinchPop application.

---

# 📄 License

PinchPop's licensing will be finalized as the project approaches release.

---

# 👨‍💻 PinchPop

**PinchPop — Gesture-Controlled Photobooth Game**

> **Capture • Solve • Remember**

A camera becomes a game.

Your hands become the controls.

Your photos become the memories.