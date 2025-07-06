# Cursor Authentication Feature - Requirements

**Feature**: User Authentication через Cursor IDE Extension  
**Priority**: Must Have (Critical Path)  
**Epic**: FR-1 User Authentication & Authorization  
**Created**: January 2025

## Stakeholder Analysis

### Primary Stakeholders
- **End Users**: AI developers using Cursor IDE
- **Product Owner**: Ivan Bunin (workflow system owner)
- **Development Team**: Backend developer implementing auth

### Stakeholder Requirements
- **End Users**: Seamless authentication without manual login
- **Product Owner**: Secure, scalable auth system
- **Development Team**: Simple implementation with good DX

## Functional Requirements

### FR-AUTH-1: Cursor Extension OAuth Integration
**Priority**: Must Have
- **Description**: Integrate with Cursor extension OAuth flow
- **User Story**: As an AI developer, I want to authenticate through my Cursor IDE so that I can access my workflows without separate login
- **Acceptance Criteria**:
  - Given user has Cursor extension installed
  - When they access workflow system from Cursor
  - Then they are automatically authenticated
  - And user profile is created/updated

### FR-AUTH-2: JWT Token Management
**Priority**: Must Have  
- **Description**: Secure JWT token handling for session management
- **User Story**: As a system, I want to manage user sessions securely so that user data is protected
- **Acceptance Criteria**:
  - JWT tokens expire after 30 days
  - Refresh tokens implemented for seamless renewal
  - HTTP-only cookies for security

### FR-AUTH-3: User Profile Creation
**Priority**: Must Have
- **Description**: Create user profiles from Cursor OAuth data
- **User Story**: As a user, I want my Cursor profile data to be used so that I have personalized experience
- **Acceptance Criteria**:
  - User profile created from OAuth data (email, name, cursor_user_id)
  - Workspace settings initialized with defaults
  - User can view/edit profile

## Non-Functional Requirements

### NFR-AUTH-1: Security
- **OAuth Security**: Use Cursor extension official OAuth flow
- **Token Security**: JWT with HS256 algorithm, secure secrets
- **Session Security**: HTTP-only cookies, SameSite protection

### NFR-AUTH-2: Performance  
- **Authentication Speed**: < 2 seconds for OAuth flow
- **Token Validation**: < 100ms for JWT verification
- **Database Queries**: < 50ms for user lookup

### NFR-AUTH-3: Reliability
- **OAuth Availability**: Handle Cursor OAuth service downtime
- **Token Refresh**: Automatic refresh without user intervention
- **Error Handling**: Clear error messages for auth failures

## Technical Constraints

### Integration Constraints
- **Cursor Extension API**: Must use official Cursor OAuth endpoints
- **Next.js Compatibility**: Must work with NextAuth.js v4.24+
- **Database Schema**: Must fit existing PostgreSQL schema

### Security Constraints
- **HTTPS Only**: All auth endpoints require HTTPS
- **CORS Policy**: Restrict origins to Cursor extension domain
- **Rate Limiting**: 100 auth requests per minute per IP

## User Stories (Detailed)

### Epic: Authentication Flow

**US-AUTH-1**: OAuth Integration
```
As an AI developer using Cursor IDE
I want to authenticate through my Cursor extension
So that I can access workflows without separate login

Acceptance Criteria:
- Given I have Cursor extension installed and configured
- When I access the workflow system through extension
- Then OAuth flow initiates automatically
- And I'm redirected back to workflow system authenticated
- And my user profile is created/updated
```

**US-AUTH-2**: Session Management
```
As an authenticated user
I want my session to persist across browser sessions
So that I don't need to re-authenticate frequently

Acceptance Criteria:
- Given I'm authenticated with valid JWT
- When I close and reopen browser
- Then my session persists for 30 days
- And tokens refresh automatically when needed
- And I can access protected resources
```

**US-AUTH-3**: Profile Management
```
As an authenticated user  
I want to view and update my profile
So that I can manage my workflow preferences

Acceptance Criteria:
- Given I'm authenticated
- When I access profile page
- Then I see my Cursor profile data (email, name)
- And I can edit workspace settings
- And changes are saved to database
```

## Data Requirements

### User Schema
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cursor_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  workspace_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Session Schema (NextAuth)
```sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  provider_account_id VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at INTEGER,
  token_type VARCHAR(255),
  scope VARCHAR(255),
  id_token TEXT,
  session_state VARCHAR(255)
);
```

## API Requirements

### OAuth Endpoints
```typescript
// Cursor OAuth configuration
const cursorProvider = {
  id: 'cursor',
  name: 'Cursor',
  type: 'oauth',
  authorization: 'https://cursor.com/oauth/authorize',
  token: 'https://cursor.com/oauth/token',
  userinfo: 'https://cursor.com/oauth/userinfo',
  clientId: process.env.CURSOR_CLIENT_ID,
  clientSecret: process.env.CURSOR_CLIENT_SECRET,
  scope: 'read:user read:workspace'
}
```

### Protected Routes
```typescript
// API routes requiring authentication
POST /api/workflows              // Create workflow
GET /api/workflows               // List user workflows  
PUT /api/workflows/:id           // Update workflow
DELETE /api/workflows/:id        // Delete workflow
GET /api/user/profile            // Get user profile
PUT /api/user/profile            // Update profile
```

## Success Criteria

### Business Metrics
- [ ] 100% of Cursor users can authenticate successfully
- [ ] < 5% authentication failure rate
- [ ] < 2 seconds average authentication time
- [ ] 95%+ user satisfaction with auth UX

### Technical Metrics  
- [ ] OAuth flow implemented and tested
- [ ] JWT token system working with 30-day expiry
- [ ] User profiles created automatically from OAuth
- [ ] Database schema implemented and indexed
- [ ] All API endpoints secured with authentication
- [ ] Error handling covers all auth failure scenarios

## Dependencies & Assumptions

### Dependencies
- **Cursor Extension OAuth API**: Must be available and stable
- **NextAuth.js**: Compatible version with Cursor provider
- **PostgreSQL Database**: Setup with user schema
- **Environment Variables**: Cursor OAuth credentials configured

### Assumptions
- Cursor extension provides stable OAuth API
- Users have Cursor extension installed and configured
- Database schema can be extended for auth tables
- Vercel deployment supports NextAuth.js

---

**Status**: ✅ Requirements Gathered  
**Next Step**: ask-clarifying-questions 