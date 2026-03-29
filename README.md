# Taxi Logger Dashboard

A professional dashboard for tracking taxi trips, managing ad templates, and organizing dispatch history. Built for roleplay servers and logistics management.

## 🚀 Deployment to GitHub Pages

To host this dashboard for free on GitHub Pages:

1.  **Create a Repository**: Push these files to a new GitHub repository.
2.  **Go to Settings**: Open your repository on GitHub and click the **Settings** tab.
3.  **Pages**: Select **Pages** from the left-hand sidebar.
4.  **Build and deployment**:
    *   **Source**: `Deploy from a branch`
    *   **Branch**: Select `main` (or your primary branch) and the `/ (root)` folder.
5.  **Save**: Click the **Save** button.
6.  **Visit Site**: Your dashboard will be live at `https://<your-username>.github.io/<your-repo-name>/` within a few minutes.

## 📖 How to Use

### 1. Log a Single Trip
- **Enter Trip Details**: Fill in the **Server**, **Pickup**, **Dropoff**, and **Player(s)** fields.
- **Generate Trip**: Click **Generate Trip**. This will:
  - Format the trip for logging.
  - Add it to your **Trip Log Output**.
  - Save it to your **Dispatch History**.
  - Update your daily, weekly, and monthly stats.

### 2. Multi-Ride Dispatching
- **Add to Queue**: If you have multiple passengers, enter the details for each and click **Add Trip**. 
- **Generate Multi-Dispatch**: Once all trips are in the queue, click **Generate All** to bundle them into a single formatted output.

### 3. Manage In-Game Ads
- **Create Templates**: Use the **In-Game Ad Templates** section to save your common taxi advertisements.
- **Character Counter**: Keep an eye on the character count (max 125) to ensure your message fits in-game chat limits.
- **Quick Copy**: Click the **📋** button on any template to copy it to your clipboard instantly.

### 4. Discord Integration
- **Drafting**: Use the **Discord Post Draft** box to write your announcements.
- **Formatting Tools**: Use the toolbar to apply **Bold**, *Italics*, or __Underline__ formatting and insert emojis easily.
- **Quick Copy**: Click **Copy for Discord** to grab your formatted message for posting.

### 5. Review History
- **Dispatch History**: All generated trips are saved in the sidebar. You can **Copy** past trips or **Delete** old records to keep your workspace clean.

## 💾 Saving & Restoring Data

This dashboard uses **Local Storage** to keep your data in your browser. If you clear your browser cache or change devices, your data will be lost unless you back it up.

### 💾 Export (Backup)
1.  Click the **💾 Export** button in the top bar.
2.  A `.json` file containing your settings, history, and templates will be downloaded to your computer.
3.  Store this file safely.

### 📂 Import (Restore)
1.  Click the **📂 Import** button in the top bar.
2.  Select your previously exported `.json` backup file.
3.  Confirm the overwrite when prompted. Your dashboard will instantly refresh with your restored data.

### ↺ Clear Stats
*   Use the **↺ Clear Stats** button to reset your daily, weekly, and monthly trip counters without affecting your saved templates or history.

## ✨ Features
- **Smart Suggestions**: Remembers your servers, locations, and frequent players.
- **Trip History**: Logs and organizes all past dispatches for easy copying.
- **Custom Templates**: Create and manage multiple advertisement messages with character counters.
- **Discord Formatting**: Built-in tools for bolding, italics, and adding emojis to your Discord posts.
- **Custom Themes**: Choose between Discord (Dark), Midnight, Forest, Ocean, and Sunset themes.
