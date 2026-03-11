---
page: details
---
A B2B SaaS Candidate Profile Summary page (details view) for HR recruiters.
Showcase a single candidate's detailed AI evaluation.
Include:
1. A header section with Candidate Name, Role applied for, and overall AI Match Score (out of 100).
2. A two-column layout below the header.
3. Left column: AI Score Breakdown (Experience, Stability, Communication, Typing, Role-specific) visually represented with progress bars. 
4. Right column: A summary of the candidate's Resume and "Key Strengths" extracted by Gemini AI.
5. Bottom section: A full transcript of the Chatbot Interview.
6. A primary action button "Schedule Follow-up Interview" at the top right.

**DESIGN SYSTEM (REQUIRED):**
# Design System: TalentLens Admin Dashboard
**Project ID:** 1600612278851322865

## 1. Visual Theme & Atmosphere
Professional, clean, and highly functional B2B SaaS aesthetic. The mood is trustworthy and efficient, using ample whitespace and distinct visual hierarchy to prioritize candidate data and AI scores.

## 2. Color Palette & Roles
* **Primary Brand:** Deep Trust Blue (#0f172a) - Used for primary actions, headers, and active states.
* **Accent:** Vibrant Indigo (#4f46e5) - Used for highlights, active links, and key AI scoring indicators.
* **Surface:** Crisp White (#ffffff) - Used for primary backgrounds and cards.
* **Background:** Soft Gray-White (#f8fafc) - Used for the main application background to make cards pop.
* **Text Primary:** Dense Slate (#1e293b) - Used for primary headings and body text.
* **Text Secondary:** Muted Slate (#64748b) - Used for metadata, subtitles, and placeholder text.
* **Success/Good Score:** Emerald Green (#10b981) - Used to indicate high candidate scores.
* **Warning/Borderline:** Amber (#f59e0b) - Used for medium scores.

## 3. Typography Rules
Clean sans-serif typography (Inter or Roboto). 
* **Headers:** Semi-bold to bold (600-700), tight letter spacing.
* **Body:** Regular weight (400), highly legible line-height (1.5).
* **Labels:** Uppercase, wide tracking, small size (text-xs) for AI categories.

## 4. Component Stylings
* **Buttons:** Subtly rounded corners (rounded-md), solid Deep Trust Blue or vibrant Indigo background for primary.
* **Cards/Containers:** Subtly rounded corners (rounded-lg) with whisper-soft diffused shadows (shadow-sm) on a Solid White background.
* **Inputs/Forms:** 1px solid border matching Muted Slate, focus ring in Vibrant Indigo.
* **Badges:** Pill-shaped (rounded-full) for statuses or tags.

## 5. Layout Principles
* Left-sided vertical navigation sidebar for admin routing (Links: Dashboard, Candidates, Settings). Make "Candidates" the active link in the sidebar since we are viewing a candidate detail.
* Top header bar for user profile and global search.
* 16px to 24px consistent padding between distinct sections.
* Information is presented in clean data-grids or card grids.
