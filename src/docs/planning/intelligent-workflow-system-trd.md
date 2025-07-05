# Intelligent Workflow System - Technical Requirements Document (TRD)

**Project:** AI Agents Playbook - Intelligent Workflow Management System  
**Version:** 1.0  
**Date:** January 2025  
**Status:** Draft  
**Document Location**: `src/docs/planning/` (per mini-prompt directives)

## 1. Executive Summary

### Objectives
Create a scalable, intelligent workflow management system enabling AI developers to:
- Store and manage custom workflows in persistent database
- Authenticate seamlessly through Cursor IDE extension
- Create and customize workflow steps with visual interface
- Execute intelligent workflows with smart skip logic

### Technical Approach
- **Frontend**: Next.js 15 with React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes with serverless architecture  
- **Database**: PostgreSQL with Prisma ORM for scalability
- **Authentication**: Cursor Extension OAuth + JWT tokens
- **AI Integration**: OpenAI API for semantic search and recommendations
- **Deployment**: Vercel platform with auto-scaling

### Key Technical Decisions
- **Single Codebase**: Next.js full-stack for reduced complexity
- **Serverless**: Vercel functions for auto-scaling and cost optimization
- **Database**: PostgreSQL for ACID compliance and complex queries
- **State Management**: React Context + TanStack Query for server state

### Timeline
- **Phase 1 (MVP)**: 2-3 months - Core CRUD + Authentication
- **Phase 2**: 2-3 months - Visual Builder + Customization  
- **Phase 3**: 2-3 months - AI Features + Advanced Collaboration

## 2. System Overview

### Architecture Diagram
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cursor IDE    │    │   Next.js App   │    │   PostgreSQL   │
│   Extension     │◄──►│   (Frontend +    │◄──►│   Database      │
│                 │    │    Backend)      │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌──────────────────┐              │
         │              │   OpenAI API     │              │
         └──────────────►│   (Embeddings)   │              │
                        └──────────────────┘              │
                                  │                       │
                                  ▼                       │
                        ┌──────────────────┐              │
                        │   Vercel CDN     │              │
                        │   (Static Files) │              │
                        └──────────────────┘              │
```

### Technology Stack
- **Frontend Framework**: Next.js 15.3.5 with App Router
- **UI Library**: React 18 with TypeScript 5.6+
- **Styling**: Tailwind CSS 3.4+ with HeadlessUI components
- **State Management**: React Context + TanStack Query v5
- **Database**: PostgreSQL 15+ with Prisma ORM v5
- **Authentication**: NextAuth.js with Cursor Extension OAuth
- **API Layer**: Next.js API routes with tRPC for type safety
- **Build Tool**: Turbopack for fast development builds
- **Testing**: Jest + React Testing Library + Playwright E2E

### Environments
- **Development**: Local Next.js server + local PostgreSQL
- **Staging**: Vercel preview deployments + Neon PostgreSQL
- **Production**: Vercel production + Neon PostgreSQL Pro

### Dependencies
```json
{
  "next": "^15.3.5",
  "react": "^18.3.0", 
  "typescript": "^5.6.0",
  "prisma": "^5.20.0",
  "@prisma/client": "^5.20.0",
  "next-auth": "^4.24.0",
  "@tanstack/react-query": "^5.56.0",
  "@trpc/server": "^10.45.0",
  "tailwindcss": "^3.4.0",
  "openai": "^4.67.0",
  "zod": "^3.23.0"
}
```

## 3. Functional Requirements

### FR-1: User Authentication & Authorization
**Technical Implementation**:
- **OAuth Flow**: Cursor Extension → NextAuth.js → JWT tokens
- **Session Management**: HTTP-only cookies + JWT refresh tokens  
- **User Schema**:
```typescript
interface User {
  id: string              // UUID v4
  cursorUserId: string    // Cursor extension user ID
  email: string           // Email from Cursor OAuth
  name?: string           // Optional display name
  workspaceSettings: Json // Preferences and configuration
  createdAt: DateTime
  updatedAt: DateTime
}
```

### FR-2: Workflow Database Management
**Technical Implementation**:
- **Database**: PostgreSQL with Prisma schema
- **CRUD Operations**: tRPC procedures with Zod validation
- **Workflow Schema**:
```typescript
interface Workflow {
  id: string              // UUID v4
  name: string            // Max 255 chars
  description: string     // Text field
  category: WorkflowCategory // Enum
  complexity: Complexity   // Enum: SIMPLE | STANDARD | COMPLEX
  phases: Phase[]         // One-to-many relationship
  tags: string[]          // Array of strings
  isPublic: boolean       // Privacy setting
  userId: string          // Foreign key to User
  version: string         // Semantic versioning
  metadata: Json          // Flexible metadata
  createdAt: DateTime
  updatedAt: DateTime
}
```

### FR-3: Visual Workflow Builder
**Technical Implementation**:
- **UI Framework**: React Flow for drag-and-drop interface
- **State Management**: React Context for workflow builder state
- **Components**:
  - `WorkflowCanvas`: Main drag-and-drop area
  - `StepNode`: Individual workflow step component
  - `PhaseContainer`: Phase grouping component
  - `Toolbar`: Add steps, save, validate actions

### FR-4: Custom Step Creation
**Technical Implementation**:
- **Step Schema**:
```typescript
interface Step {
  id: string              // UUID v4
  phaseId: string         // Foreign key to Phase
  miniPrompt: string      // Step ID from mini-prompts
  customContent?: string  // Custom markdown content
  prerequisites: Json     // Prerequisites configuration
  skipConditions: Json    // Skip logic configuration
  executionOrder: number  // Order within phase
  parameters: Json        // Step-specific parameters
}
```

### FR-5: Intelligent Execution Engine
**Technical Implementation**:
- **Smart Engine**: Enhanced version of existing SmartWorkflowEngine
- **Context System**: Persistent context storage and retrieval
- **Skip Logic**: Enhanced rule-based system with user preferences

## 4. Non-Functional Requirements

### NFR-1: Performance Requirements
**Database Performance**:
- **Query Response Time**: < 100ms for simple queries, < 500ms for complex
- **Connection Pooling**: Prisma connection pool (max 10 connections)
- **Indexing Strategy**:
  - Primary indexes on all UUID fields
  - Composite index on (userId, category) for workflow filtering
  - Full-text search index on workflow name/description

**Frontend Performance**:
- **Page Load Time**: < 2 seconds (99th percentile)
- **Time to Interactive**: < 3 seconds
- **Bundle Size**: < 500KB (excluding chunks)
- **Code Splitting**: Route-based and component-based lazy loading

### NFR-2: Security Requirements
**Authentication Security**:
```typescript
// JWT Token Configuration
const jwtConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  maxAge: 30 * 24 * 60 * 60, // 30 days
  algorithm: 'HS256',
  issuer: 'workflow-system',
  audience: 'workflow-users'
}
```

**API Security**:
- **Rate Limiting**: 100 requests/minute per user
- **Input Validation**: Zod schemas on all API endpoints
- **SQL Injection**: Prisma ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers

### NFR-3: Scalability Requirements
**Database Scaling**:
- **Horizontal Scaling**: Read replicas for query distribution
- **Connection Management**: Prisma connection pooling
- **Data Partitioning**: Partition workflows by user_id for large datasets

**Application Scaling**:
- **Serverless**: Vercel functions auto-scale to zero
- **CDN**: Static assets cached on Vercel Edge Network
- **API Optimization**: Response caching with stale-while-revalidate

## 5. Data Requirements

### Database Schema
```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cursor_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  workspace_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  complexity VARCHAR(20) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  version VARCHAR(20) DEFAULT '1.0.0',
  metadata JSONB DEFAULT '{}',
  embedding_vector VECTOR(1536), -- For semantic search
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Phases table
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  phase_order INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'
);

-- Steps table
CREATE TABLE steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  mini_prompt VARCHAR(255) NOT NULL,
  custom_content TEXT,
  prerequisites JSONB DEFAULT '{}',
  skip_conditions JSONB DEFAULT '{}',
  execution_order INTEGER NOT NULL,
  parameters JSONB DEFAULT '{}'
);

-- Indexes for performance
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_category ON workflows(category);
CREATE INDEX idx_workflows_public ON workflows(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_phases_workflow_id ON phases(workflow_id);
CREATE INDEX idx_steps_phase_id ON steps(phase_id);
```

### Data Validation Rules
```typescript
// Zod schemas for data validation
const WorkflowSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  category: z.enum(['development', 'analysis', 'operations', 'documentation']),
  complexity: z.enum(['SIMPLE', 'STANDARD', 'COMPLEX']),
  tags: z.array(z.string()).max(10),
  isPublic: z.boolean(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/)
});
```

## 6. API Specifications

### REST API Endpoints
```typescript
// Workflow CRUD operations
GET    /api/workflows              // List user workflows
POST   /api/workflows              // Create new workflow
GET    /api/workflows/:id          // Get workflow by ID
PUT    /api/workflows/:id          // Update workflow
DELETE /api/workflows/:id          // Delete workflow

// Workflow execution
POST   /api/workflows/:id/execute  // Start workflow execution
GET    /api/workflows/:id/status   // Get execution status

// Search and discovery
GET    /api/search/workflows       // Search workflows
POST   /api/search/semantic        // Semantic search

// User management
GET    /api/user/profile           // Get user profile
PUT    /api/user/profile           // Update user profile
GET    /api/user/preferences       // Get user preferences
```

### tRPC API Procedures
```typescript
// Type-safe API with tRPC
export const appRouter = router({
  workflow: router({
    list: protectedProcedure
      .input(z.object({ category: z.string().optional() }))
      .query(({ input, ctx }) => {
        return ctx.prisma.workflow.findMany({
          where: { userId: ctx.user.id, category: input.category }
        });
      }),
    
    create: protectedProcedure
      .input(WorkflowSchema)
      .mutation(({ input, ctx }) => {
        return ctx.prisma.workflow.create({
          data: { ...input, userId: ctx.user.id }
        });
      })
  }),
  
  search: router({
    semantic: protectedProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => {
        return semanticSearch.search(input.query);
      })
  })
});
```

### Response Formats
```typescript
// Standardized API response format
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}
```

## 7. Integration Requirements

### Cursor Extension Integration
```typescript
// Cursor Extension API integration
interface CursorIntegration {
  // Authentication flow
  authenticateUser(): Promise<{ token: string; user: CursorUser }>;
  
  // Context sharing
  getWorkspaceContext(): Promise<WorkspaceContext>;
  sendWorkflowResult(result: WorkflowResult): Promise<void>;
  
  // Command palette integration
  registerCommands(commands: Command[]): void;
}

// WebSocket connection for real-time communication
const cursorSocket = new WebSocket('wss://workflow-system.vercel.app/cursor');
```

### OpenAI API Integration
```typescript
// OpenAI service for semantic search
class OpenAIService {
  private client: OpenAI;
  
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float'
    });
    return response.data[0].embedding;
  }
  
  async semanticSearch(query: string, workflows: Workflow[]): Promise<SearchResult[]> {
    const queryEmbedding = await this.generateEmbedding(query);
    return workflows.map(workflow => ({
      workflow,
      similarity: cosineSimilarity(queryEmbedding, workflow.embeddingVector)
    })).sort((a, b) => b.similarity - a.similarity);
  }
}
```

### MCP Server Integration
```typescript
// Maintain compatibility with existing MCP server
interface MCPIntegration {
  getAvailableWorkflows(query: string): Promise<Workflow[]>;
  selectWorkflow(workflowId: string): Promise<WorkflowExecution>;
  getNextStep(workflowId: string, currentStep: number): Promise<StepResult>;
}
```

## 8. Infrastructure Requirements

### Hosting Architecture
```yaml
# Vercel deployment configuration
# vercel.json
{
  "framework": "nextjs",
  "regions": ["iad1", "sfo1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database-url",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "OPENAI_API_KEY": "@openai-api-key"
  }
}
```

### Database Infrastructure
- **Provider**: Neon (PostgreSQL-compatible)
- **Plan**: Pro tier for production (auto-scaling)
- **Backup**: Daily automated backups with 30-day retention
- **Monitoring**: Built-in Neon monitoring + custom alerts

### Monitoring & Observability
```typescript
// Monitoring setup
import { Analytics } from '@vercel/analytics';
import * as Sentry from '@sentry/nextjs';

// Performance monitoring
const monitoring = {
  analytics: new Analytics(),
  errorTracking: Sentry,
  customMetrics: {
    workflowExecutions: 'counter',
    apiResponseTime: 'histogram',
    databaseQueries: 'counter'
  }
};
```

### Security Infrastructure
- **Environment Variables**: Vercel secure environment variables
- **SSL/TLS**: Automatic HTTPS with Vercel certificates
- **CORS**: Configured for Cursor extension domain
- **Rate Limiting**: Vercel Edge Functions with Redis

## Technical Constraints

### Development Standards
- **Code Style**: ESLint + Prettier with TypeScript strict mode
- **Testing**: 80%+ code coverage requirement
- **Documentation**: TSDoc for all public APIs
- **Git Workflow**: Feature branches with PR reviews

### Performance Constraints
- **Bundle Size**: < 500KB main bundle (excluding async chunks)
- **Database**: < 500ms for complex queries, < 100ms for simple
- **API Response**: < 2 seconds for workflow operations
- **Memory**: < 256MB per serverless function

### Security Constraints
- **Authentication**: JWT tokens with 30-day expiration
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: All user inputs validated with Zod schemas
- **Data Protection**: Encryption at rest and in transit

---

**Document Status**: ✅ TRD Created  
**Next Steps**: Architecture design and implementation planning  
**Review Required**: Technical architecture review with development team 