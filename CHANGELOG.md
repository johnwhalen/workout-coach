# Changelog

All notable changes to the **Golden Harbor Workout Coach** will be documented in this file.

## [1.2.0] - 2026-01-10

### Added

- **Structured Workout Tables**: AI coach now displays workout plans and logging summaries in a clean, tabular format within the chat messages.
- **AI Unit Tests**: Comprehensive test suite for AI prompt building logic and action type guards using Vitest.
- **Improved Action Handling**: Refactored chat action logic into a dedicated `ChatActionHandler` service for better maintainability and enterprise-grade architecture.
- **Expanded System Prompts**: Enhanced AI context for progressive overload, equipment availability (Hydrow, dumbbells), and returning-to-training guidance.
- **Today's Workout Sidebar**: A collapsible sidebar in the chat interface that provides a real-time summary of the current day's exercises and metrics.

### Changed

- **Architecture Refactor (Phase 3)**: Migrated business logic to a centralized service layer, improving testability and observability.
- **Indentation & Code Style**: Standardized code formatting across key components for better consistency.

---

## [1.1.0] - 2026-01-06

- **Real-time SSE Updates**: Integrated server-sent events (SSE) to trigger sidebar refreshes immediately after an AI-confirmed workout log.

### Fixed

- Improved mobile responsiveness for the chat interface on high-density displays.

---

## [1.0.0] - 2026-01-02

### Added

- **Initial Launch**: Core AI workout coaching engine powered by Anthropic Claude.
- **Dynamic Logging**: Ability to log sets, reps, and weights using natural language.
- **Fitness Profile**: User onboarding with equipment and goal tracking.
- **Historical Analysis**: Integration with legacy workout data from Excel imports.

---

## [0.9.0] - 2025-11-30

### Added

- **Technical Foundation**: Next.js framework setup with Prisma ORM and PostgreSQL.
- **Authentication**: Secure user login and multi-session support via Clerk.
- **Design System**: Implemented "Golden Harbor" aesthetic using Mantine UI and glassmorphic Tailwind components.
