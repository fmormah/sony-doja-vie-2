# Howler.js Demo Components

This directory contains demonstration components showcasing various Howler.js audio manipulation features.

## Components

### 1. HowlerFadeDemo

**Purpose**: Demonstrates fade in/out functionality

- **Features**:
  - Volume control slider
  - Adjustable fade duration (0-5000ms)
  - Fade In button (starts from volume 0)
  - Fade Out button (fades to 0 and pauses)
- **Audio File**: `/assets/music/sample-1.mp3`

### 2. HowlerFilterDemo

**Purpose**: Demonstrates Web Audio API filters (Low Pass / High Pass)

- **Features**:
  - Toggle between No Filter, Low Pass, and High Pass
  - Frequency control (100Hz - 16kHz)
  - Q factor control (0.1 - 20)
  - Global filter applied to Howler master gain
- **Audio File**: `/assets/music/sample-2.mp3`
- **Note**: Filters affect all Howler sounds globally while active

### 3. HowlerRateDemo

**Purpose**: Demonstrates playback speed manipulation

- **Features**:
  - Rate control slider (0.5x - 2x speed)
  - Real-time rate adjustment
  - Note: Rate changes affect pitch (no pitch preservation)
- **Audio File**: `/assets/music/sample-3.mp3`

### 4. HowlerSeekDemo

**Purpose**: Demonstrates seeking/jumping within a track

- **Features**:
  - Visual progress bar with seek control
  - Time display (current/total)
  - Quick jump buttons (Start, Middle, Near End)
  - Real-time position tracking during playback
- **Audio File**: `/assets/music/sample-1.mp3`

### 5. HowlerPlaylistDemo

**Purpose**: Demonstrates playlist management and track switching

- **Features**:
  - Multiple track support
  - Previous/Next navigation
  - Direct track selection from list
  - Auto-advance on track completion
  - Progress bar for current track
- **Audio Files**: All three samples (sample-1.mp3, sample-2.mp3, sample-3.mp3)

## Usage

### In Storybook

Run Storybook and navigate to **Audio > Howler Demos**:

```bash
npm run storybook
```

### In Application

Import components from the index:

```tsx
import {
  HowlerFadeDemo,
  HowlerFilterDemo,
  HowlerPlaylistDemo,
  HowlerRateDemo,
  HowlerSeekDemo,
} from "@/components/molecules/HowlerDemos";
```

### Test Page

Visit `/howler-test` in the development server to see all demos on one page:

```bash
npm run dev
# Navigate to http://localhost:3000/howler-test
```

## Technical Notes

### Filter Implementation

The filter demo uses Web Audio API's BiquadFilterNode, inserting it between Howler's master gain and the audio context destination. This approach affects all Howler sounds globally.

### Memory Management

All components properly clean up Howl instances on unmount, removing event listeners and unloading audio to prevent memory leaks.

### Browser Compatibility

- Requires Web Audio API support for filters
- Tested with modern browsers (Chrome, Firefox, Safari, Edge)
- Gracefully degrades if Web Audio is unavailable

## Audio Files

The demos use three sample MP3 files located in `/public/assets/music/`:

- `sample-1.mp3`
- `sample-2.mp3`
- `sample-3.mp3`

Ensure these files are present for the demos to work properly.
