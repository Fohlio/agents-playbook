# CLAUDE.md

**Agents Playbook** — AI workflow orchestration platform with MCP server.

## Commands
```bash
npm run dev              # Dev server (port 3012)
npm run build            # Production build
npm run lint             # ESLint
npm test                 # Jest tests
npm run test:e2e         # Playwright E2E

# Database
npm run db:migrate:dev   # Run migrations
npm run db:push          # Push schema (dev only)
npm run db:seed:system   # Seed system workflows/prompts
npm run db:studio        # Prisma Studio
npm run db:generate      # Generate Prisma Client
npm run build:embeddings # Generate OpenAI embeddings
```

## Troubleshooting
- **"No workflows found"**: Run `npm run db:seed:system && npm run build:embeddings`
- **Database Errors**: Ensure `DATABASE_URL` ends with `?sslmode=require`

## Startup Hub
**Project Slug:** `agents-playbook-Rjm09y`

## UI Learnings

### Key Principles
1. **Always analyze screenshots carefully** — Don't assume the problem, look at the actual visual issue
2. **Read exact words** — "make sidebar smaller" (height) vs "make sidebar narrower" (width) are different things
3. **Don't overcomplicate solutions** — Simple CSS changes often work better than complex fixes
4. **Ask for clarification when unclear** — Better to ask than to fix the wrong thing multiple times

### Common Tailwind/CSS Pitfalls
- `bg-black/50` opacity shorthand may not work as expected; use conditional classes
- Fixed heights (`h-[calc(100vh-64px)]`) often cause issues; let content size naturally
- Z-index layering requires careful ordering: overlay (z-30), sidebar (z-40), burger (z-50)
- Drawer pattern: hide button when drawer is open to avoid duplicate controls
