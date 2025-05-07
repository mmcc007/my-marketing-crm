# Cursor Rules for CRM Project

## Purpose
Ensure consistent, high-quality code for the Marketing Agency CRM project by guiding AI-driven development in Cursor IDE. These rules enforce project structure, code style, and best practices for integration with Next.js, Tailwind CSS, shadcn/ui, and Neon DB.

## Project Structure
- **Root Files**:
  - `PRD.md`: Product Requirements Document for feature reference.
  - `package.json`: Manage dependencies (Next.js, TypeScript, Tailwind CSS, shadcn/ui, Drizzle ORM, Clerk/NextAuth.js).
- **Folders**:
  - `/app`: Next.js App Router pages (e.g., /login, /dashboard, /clients, /campaigns, /admin).
  - `/components`: Reusable React components (e.g., ClientList.tsx, CampaignForm.tsx).
  - `/api`: Next.js API routes (e.g., /api/clients, /api/campaigns, /api/admin).
  - `/db`: Drizzle ORM schemas and migrations (e.g., schema.ts, migrations/).
  - `/lib`: Utility functions and helpers (e.g., validation, API wrappers).
  - `/styles`: Global Tailwind CSS styles (e.g., globals.css).
- **Naming**: Use PascalCase for components (e.g., ClientList.tsx), kebab-case for files/folders (e.g., client-list.ts).

## Code Style
- **Language**: TypeScript for type safety (define interfaces for Client, Campaign, User).
- **Components**: Functional React components with hooks (e.g., useState, useEffect).
- **Syntax**: ES6+ (arrow functions, destructuring, async/await).
- **Formatting**: Prettier with default settings (2-space indent, single quotes, trailing commas).
- **CSS**: Tailwind CSS classes for all styling, avoid custom CSS unless necessary.
- **UI Library**: shadcn/ui for tables, forms, modals, buttons, and toasts.

## Development Guidelines
- **Prompts**:
  - Be specific (e.g., “Create a TypeScript component for a client creation form with shadcn/ui inputs and Tailwind CSS”).
  - Reference PRD.md for feature specs (e.g., “Follow PRD for client list filters”).
  - Iterate on AI outputs (e.g., “Simplify the API to handle only GET/POST”).
  - Debug with Cursor (e.g., “Fix the client list not updating after form submission”).
- **Error Handling**:
  - Handle API failures with try/catch and user-friendly toasts.
  - Validate inputs (e.g., email format, required fields) on client and server.
  - Display loading spinners and empty states for UI feedback.
- **Performance**:
  - Use Next.js dynamic imports for large components.
  - Memoize API calls with React.useMemo where applicable.
  - Implement pagination for large datasets (clients, campaigns).
- **Accessibility**:
  - Use semantic HTML (e.g., <nav>, <main>, <form>).
  - Add ARIA labels for interactive elements.
  - Ensure keyboard navigation for all UI components.

## Libraries and Tools
- **Next.js**: Use App Router for pages and API routes.
- **TypeScript**: Define interfaces for all data models (e.g., Client, Campaign).
- **Tailwind CSS**: Use utility classes for responsive, consistent styling (neutral palette, rounded corners, shadows).
- **shadcn/ui**: Primary UI library for tables, forms, modals, dropdowns, and toasts.
- **Drizzle ORM**: Type-safe queries and migrations for Neon DB.
- **Clerk/NextAuth.js**: Handle authentication and role-based access.
- **Neon DB**: PostgreSQL database with connection string in environment variables.

## API Guidelines
- **Routes**:
  - /api/auth/*: Authentication (login, logout).
  - /api/clients: CRUD for clients (GET, POST, PATCH, DELETE).
  - /api/campaigns: CRUD for campaigns.
  - /api/admin/*: User and settings management (admin-only).
  - /api/dashboard: Fetch metrics and recent activity.
- **Validation**:
  - Enforce unique email for clients and users.
  - Validate dates, numbers, and required fields.
  - Sanitize inputs to prevent injection attacks.
- **Responses**:
  - Return JSON with status codes (200, 400, 401, 500).
  - Include error messages for failed requests.
- **Security**:
  - Use environment variables for sensitive data (e.g., DB_URL, CLERK_SECRET_KEY).
  - Implement middleware to protect routes (e.g., require authentication).

## Database Guidelines
- **Schema**:
  - Define in /db/schema.ts using Drizzle ORM.
  - Tables: clients, campaigns, interactions, users (per PRD).
  - Include id, created_at, updated_at for all tables.
- **Migrations**:
  - Store in /db/migrations.
  - Run migrations during deployment to set up tables.
- **Queries**:
  - Use Drizzle ORM for type-safe queries.
  - Optimize with indexes for frequent queries (e.g., client email, campaign client_id).

## Deployment
- **Vercel**:
  - Push to GitHub and link to Vercel.
  - Configure environment variables (e.g., DATABASE_URL, NEXTAUTH_SECRET).
  - Enable automatic scaling and domains.
- **Testing**:
  - Test all CRUD operations locally before deployment.
  - Verify UI responsiveness on desktop and mobile.
  - Check authentication and role-based access.

## Best Practices
- Keep components small and reusable.
- Document complex logic with comments.
- Test edge cases (e.g., empty lists, invalid inputs, failed APIs).
- Use consistent naming and structure for scalability.
- Prioritize user feedback (e.g., toasts, loading states) for a polished experience.
