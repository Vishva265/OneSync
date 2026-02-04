# OneFlow Frontend

Modern React application for project management and finance.

## Tech Stack

- React 18 + TypeScript
- Vite (fast bundler)
- Tailwind CSS v4
- React Query (server state)
- Zustand (auth store)
- React Router (navigation)

## Quick Start

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Environment Variables

Create a `.env` file:

\`\`\`env
VITE_API_URL=http://localhost:3000
\`\`\`

## Test Credentials

- **Admin**: admin@oneflow.local / admin@123
- **PM**: pm@oneflow.local / pm@123
- **Finance**: finance@oneflow.local / finance@123
- **Team Member**: team@oneflow.local / team@123

## Features

✓ JWT-based authentication  
✓ Role-based routing  
✓ Dashboard with KPIs  
✓ Project management  
✓ Kanban task board  
✓ Timesheet logging  
✓ Invoice creation from timesheets  
✓ Financial analytics  

## Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── api/                # API client functions
├── store/              # Zustand stores
├── types/              # TypeScript types
├── App.tsx             # Root component
└── main.tsx            # Entry point
\`\`\`

## Building for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## Scripts

- `npm run dev` - Start dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Check TypeScript

## API Integration

All API calls go through `src/api/client.ts` which handles:
- JWT token attachment
- Error handling
- Auto-logout on 401

API endpoints follow `/api/v1/*` pattern and are defined in `src/api/*.ts` files.
\`\`\`
