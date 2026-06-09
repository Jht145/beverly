# Implementation Plan - Premium Residential Project Website

Design and build a high-converting, modern website for a luxury residential project based on the official architectural data, adopting an elegant, clean slate-and-emerald design system.

---

## Visual Identity & Design System

*   **Color Palette**:
    *   **Primary (60%)**: Minimalist Clean White (`#FFFFFF`) and Crisp Light Gray (`#F8F9FA`) for structural layouts.
    *   **Secondary (30%)**: Deep Charcoal / Slate (`#212529`) for typography, panels, and borders.
    *   **Accent (10%)**: Vibrant Emerald Green (`#00873F`) for badges, highlights, and primary CTA buttons.
*   **Typography**:
    *   **Headings**: Bold, geometric **Montserrat** with wide character tracking (`letter-spacing: 0.05em`) to mirror blueprint aesthetics.
    *   **Body & Labels**: Clean UI fonts (**Inter** or **Roboto**) with monospaced styles (`font-family: monospace`) for technical dimensions.

---

## Structural Layout & Requirements

We will replace the current Beverly website files with the new structure. The Express server backend and file database will be updated to host the new configurations.

### 1. Database & Seed (`database.json`)
*   Update content configs with the new residential specs, pricing, and project overview parameters.
*   Create new seed records for the gallery database mapping the new configurations (Towers A/B/C/D Type 1-5 floor plans, lobby, pool, etc.) and categorizing them appropriately.

### 2. Generated Visual Assets (`public/assets/images/`)
Using image generation tools, we will create new photorealistic architectural renderings matching the white/slate/emerald aesthetic:
*   [NEW] `hero_render.png` - Luxury modern residential high-rise tower.
*   [NEW] `lobby_render.png` - Clean architectural entrance foyer.
*   [NEW] `pool_render.png` - Wellness rooftop infinity pool area.
*   [NEW] `plan_type1.png` - Type 1 3BHK floor plan layout.
*   [NEW] `plan_type2.png` - Type 2 3BHK floor plan layout.
*   [NEW] `plan_type3.png` - Type 3 3BHK floor plan layout.
*   [NEW] `plan_type4.png` - Type 4 3BHK floor plan layout.
*   [NEW] `plan_type5.png` - Type 5 3BHK floor plan layout.

### 3. Public Landing Page (`public/index.html`)
*   **Hero Section**: Bold Montserrat headings, clean typography, subtext detailing the 3BHK configurations (240 to 265 Sq. Yd.), and a prominent emerald green **"Download Brochure"** CTA.
*   **Project Overview Selector**: An interactive blueprint selector representing the structural progression:
    *   *Ground Floor Plan*, *First Floor Plan*, *Typical Floor Plan*, *Penthouse Floor Plan*, and *Terrace Floor Plan*.
*   **Residences Configurations Module**: Tab controls to toggle between Type 1, Type 2, Type 3, Type 4, and Type 5 floor plans. Displays technical specifications side-by-side with monospaced room dimensions and attachments.
*   **Amenities Grid**: Clean, icon-coded grid categorizing the 26 logical zones:
    *   *Wellness & Recreation* (Pools, Yoga, Gym, Court, Paths)
    *   *Entertainment & Social Hubs* (Banquet, Kitchen, Cinema, Games, Lawn)
    *   *Family & Child-Centric Spaces* (Play Areas, Drop Zone)
    *   *Infrastructure & Safety Services* (Foyer, Offices, Locker, Change Rooms, Services)
*   **Location & Connectivity Section**: Details positioning along the **12 MT WIDE T.P.S. ROAD** with access margins (5 MT, 6 MT, 8 MT).

### 4. Stylesheet (`public/style.css`)
*   Refactor color variables to clean white, light gray, deep charcoal, and vibrant emerald green (`#00873F`).
*   Adopt Montserrat and Inter typography.
*   Incorporate wide character tracking on headings and monospaced layout specifications.
*   Verify full mobile responsiveness on grid elements, modals, forms, and alignment margins.

### 5. Interactive Script (`public/script.js`)
*   Dynamically load specs, details, and project texts from the local database.
*   Wire the interactive selectors:
    *   Overview blueprint progression (Ground, First, Typical, Penthouse, Terrace).
    *   Residences configurations tabs (Type 1-5 dimensions).
    *   Amenities category grids.
*   Integrate static client-side fallback triggers and inquiry local storage for immediate GitHub Pages compatibility.

---

## Verification Plan

### Automated Endpoint Verification
*   Execute [test_endpoints.js](file:///C:/Users/jahan/.gemini/antigravity/brain/42c65725-4574-4d8b-8022-d0909dd83905/scratch/test_endpoints.js) to confirm backend server health.

### Manual Verification
*   Open `http://localhost:3000/`.
*   Verify the page displays the white/slate/emerald color scheme.
*   Confirm tab selectors update floor plan blueprints and details dynamically.
*   Check that the 26 amenities are correctly grouped.
*   Validate responsiveness on mobile/tablet viewports.
