<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# Database and API

We use **Prisma** as our primary ORM and database client. Do **NOT** use Supabase's PostgREST (via `supabase.from()`) for data fetching or mutations. Always use the Prisma client for database operations. Supabase is used primarily for Authentication.

For our API layer, we use **oRPC**. All client-server communication should go through oRPC routers defined in `src/routers/`. Use the provided oRPC hooks (`useQuery`, `useMutation`) from `@/lib/orpc/client` for frontend data fetching.

# Background Tasks

We use **Trigger.dev v3** for background jobs and long-running tasks. Define all tasks in the `src/trigger/` directory.

# UI and Components

We use **Shadcn UI** for our component library. Shared UI components are located in `src/components/ui/`. When adding new components, use the `npx shadcn@latest add` command or follow the existing patterns in `src/components/ui/`.

# Implementation Details

- **Prisma Import**: Always import the database client from `@/lib/prisma`. Do **NOT** import from `@/generated/prisma` or instantiate `PrismaClient` directly.
- **Environment Variables**: Ensure all required environment variables (e.g., `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`) are correctly configured in your local environment.

# Agent Capabilities

You have access to a variety of project-specific **Skills**. Before implementing complex logic, check if there is an existing skill that provides best practices or utilities for the task at hand. Always prioritize following the patterns and rules defined in these skills.
<!-- END:nextjs-agent-rules -->