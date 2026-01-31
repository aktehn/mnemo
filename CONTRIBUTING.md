# Contributing to Mnemo

Thank you for your interest in contributing to Mnemo! We rely on community contributions to keep this project production-ready and elite.

This guide details our architectural standards and development workflow.

## Feature-Based Architecture

To maintain scalability and distinct separation of concerns, Mnemo uses a **Feature-Based Architecture**. Instead of grouping files by type (e.g., all components in one folder), we group them by **domain**.

When adding new code, identify which feature it belongs to:

### `src/features/`
This is the core of our application structure.
*   **`auth/`**: Authentication logic, login forms, and user session management.
*   **`dashboard/`**: The main application view, analytics, and summary widgets.
*   **`vocabulary/`**: Core learning logic, flashcards, word management, and the SRS engine.

Each feature folder should be self-contained, typically including its own:
*   `components/`: UI components specific to this feature.
*   `hooks/`: React hooks logic isolated to this feature.
*   `types/`: TypeScript definitions used only here.

### Global Directories
Code that is truly generic or shared across multiple features goes into the root `src` folders:
*   **`src/components/`**: Atomic UI elements (Buttons, Inputs, Cards) used everywhere.
*   **`src/services/`**: External API integrations (Supabase client, Dictionary API).
*   **`src/store/`**: Global state managers (Zustand stores).
*   **`src/utils/`**: Pure helper functions.

## Development Workflow

1.  **Fork & Clone**: Fork the repo and clone it locally.
2.  **Branching**: Create a strictly named branch for your work:
    *   `feat/your-feature-name`
    *   `fix/bug-description`
    *   `docs/documentation-update`
3.  ** implementation**:
    *   Ensure all new files have strict **TypeScript** typing. Avoid `any`.
    *   Add **JSDoc** comments to complex functions and logic.
    *   Follow the **Feature-Based Architecture** strictly.
4.  **Commit**: Write clear, descriptive commit messages.
5.  **Pull Request**: Push your branch and open a PR. Describe your changes and link any relevant issues.

## Security

*   **Never commit secrets.** Ensure `.env` is in your `.gitignore`.
*   Do not hardcode sensitive keys or URLs. Use environment variables.

## Code Standards

*   **Styling**: use TailwindCSS utility classes. Avoid creating new CSS files unless necessary for complex animations.
*   **State**: Use local state (`useState`) for UI logic and global state (`Zustand`) for data that needs to persist across features.

We look forward to your code! 
