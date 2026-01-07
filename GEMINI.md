# Project Overview

This is a Next.js project called "Golden Harbor Workout Coach", a GenAI-powered workout tracking application. It allows users to log their routines, workouts, and sets. 

## Key Technologies

*   **Framework**: Next.js
*   **Language**: TypeScript
*   **Database**: PostgreSQL with Prisma ORM
*   **Authentication**: Clerk
*   **UI**: Mantine UI with Tailwind CSS
*   **AI**: Anthropic Claude for chat-based workout assistance
*   **Search**: Fuse.js for fuzzy search

## Project Structure

*   `app/`: Contains the main application code, including pages and API routes.
*   `prisma/`: Contains the database schema (`schema.prisma`) and migrations.
*   `lib/`: Contains library code, including the Claude AI integration.
*   `components/`: Contains reusable React components.
*   `scripts/`: Contains various scripts for tasks like database seeding and maintenance.
*   `public/`: Contains static assets like images.

## Building and Running the Project

To build and run the project, you need to have Node.js and npm installed.

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set up Environment Variables:**
    Create a `.env` file and add the following variables:
    ```
    DATABASE_URL="your_postgres_database_url"
    DIRECT_URL="your_postgres_direct_url"
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
    CLERK_SECRET_KEY="your_clerk_secret_key"
    ANTHROPIC_API_KEY="your_anthropic_api_key"
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
    NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
    NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
    ```

3.  **Run Database Migrations:**
    ```bash
    npx prisma migrate dev
    ```

4.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

## Development Conventions

*   **Linting:** The project uses ESLint for code quality. You can run the linter with `npm run lint`.
*   **Git:** The project is under version control with Git.
*   **Commits:** Commits should be clear and descriptive.
*   **Testing:** There are some test files in the root directory, but no formal testing framework is set up. You can run tests using `node <test-file-name>.js`.
