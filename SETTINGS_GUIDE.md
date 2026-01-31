# Advanced Settings Guide

This document explains the technical tools found in the **Settings > Advanced** section and when to use them.

## 1. Force Cloud Sync
- **What it does:**
  Forces an immediate synchronization of your local data with the main server (Supabase/Cloud). It bypasses the automatic background sync schedule.
- **When to use it:**
  - If you added words on another device (e.g., phone or laptop) and they are not appearing on this computer yet.
  - To refresh data if you suspect a "sync error" or delay.

## 2. Test Popup Window
- **What it does:**
  Trigger the vocabulary learning popup (card) to appear on the screen immediately.
- **When to use it:**
  - To check how your selected popup position (Bottom Right, Top Left, etc.) looks on your specific screen.
  - To instantly test design or content changes without waiting for the timer.

## 3. Reset App Settings
- **What it does:**
  Reverts all personalized application settings to their default factory values.
  - *Defaults:* Frequency (15min), Position (Bottom Right), Data Source (Dummy), Focus Mode (On).
- **When to use it:**
  - If you have changed too many settings and want to start fresh.
  - If the application behaves unexpectedly after a setting change, this acts as a "clean slate".

## 4. Clear Local Data
- **What it does:**
  Wipes all temporary memory, `localStorage` data, and cache from the application/browser. It then reloads the application.
- **When to use it:**
  - **Emergency Button.** Use this if the app crashes, freezes, fails to load data, or if you cannot log in.
  - It effectively logs you out and forces a complete fresh data fetch from the server or default files.
