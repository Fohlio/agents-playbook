# Analyze Data Flow (v1)

## 🎯 Goal
Map and document data flow patterns from backend to frontend, including API patterns, state management, and integration points for consistent data handling strategies.

## 📥 Context (ask if missing)
1. **Project Codebase** – access to source code for analysis
2. **Backend Architecture** – API structure and data sources
3. **Frontend Framework** – React, Vue, Angular, or other frontend technology
4. **State Management** – existing state management solutions in use
5. **API Documentation** – existing API specs or documentation
6. **Integration Requirements** – external services and third-party APIs

## ❓ Clarifying Questions (ask before proceeding)
**IMPORTANT: Ask clarifying questions directly in chat before proceeding.**

Generate concise one-line questions about: API architecture type (REST/GraphQL/etc.), authentication patterns, real-time requirements, data transformation needs, caching strategies, error handling approaches, and performance constraints.

## 🚦 Skip if
- Data flow is well-documented and recently analyzed (<30 days)
- Simple static application with minimal data requirements
- Single-page application without external data sources

## 📋 Analysis Process
1. **API Pattern Detection** – identify backend communication patterns (REST, GraphQL, WebSocket)
2. **State Management Analysis** – map client-side state management approaches
3. **Data Transformation Mapping** – trace data from source to UI components  
4. **Integration Point Discovery** – identify external service connections
5. **Flow Documentation** – create visual and textual data flow documentation

## 📤 Output
**File:** `.agents-playbook/data-flow-analysis.md`

### Document Structure:
```markdown
# Data Flow Analysis

## Overview
- **Backend Architecture:** [REST/GraphQL/Hybrid/etc.]
- **Frontend Framework:** [React, Vue, Angular, etc.]
- **State Management:** [Redux, Zustand, Context API, etc.]
- **Analysis Date:** [Current date]

## API Patterns

### REST Endpoints
| Method | Endpoint | Purpose | Data Format |
|--------|----------|---------|-------------|
| GET    | /api/users | Fetch users | JSON |
| POST   | /api/users | Create user | JSON |
[Continue for all endpoints]

### GraphQL Operations
- **Queries:** [List main queries]
- **Mutations:** [List main mutations]  
- **Subscriptions:** [List real-time subscriptions]

### WebSocket Connections
- **Purpose:** [Real-time features]
- **Events:** [List of events handled]
- **Data Format:** [Message structure]

## State Management Architecture

### Global State
- **Store Structure:** [Redux store/Zustand stores/Context providers]
- **State Shape:** [Main state categories]
- **Update Patterns:** [Actions/reducers/mutations/etc.]

### Component State
- **Local State Usage:** [When and why local state is used]
- **Props Drilling:** [Identified instances and alternatives]
- **State Lifting:** [Examples of state promotion patterns]

### Caching & Persistence
- **Client-side Caching:** [React Query, SWR, Apollo Cache, etc.]
- **Local Storage:** [What data is persisted]
- **Session Storage:** [Temporary data storage]

## Data Transformation Pipeline

### Backend → Frontend
```
[Data Source] → [API Layer] → [Data Transformation] → [State Store] → [UI Components]
```

1. **Data Source:** [Database, external APIs, files, etc.]
2. **API Layer:** [Backend controllers, resolvers, etc.]
3. **Data Transformation:** [Serialization, validation, formatting]
4. **State Store:** [How data enters application state]
5. **UI Components:** [How data is consumed in interface]

### Key Transformation Points
- **API Response Processing:** [How responses are handled]
- **Data Normalization:** [Structure changes for client use]
- **Error Transformation:** [How errors are processed and displayed]
- **Loading States:** [How async operations are managed]

## Integration Points

### External APIs
| Service | Purpose | Authentication | Data Format |
|---------|---------|---------------|-------------|
| [Service name] | [What it provides] | [Auth method] | [JSON/XML/etc.] |

### Third-party Libraries
- **HTTP Client:** [Axios, Fetch, etc.]
- **State Management:** [Redux Toolkit, Zustand, etc.]  
- **Data Fetching:** [React Query, SWR, Apollo, etc.]
- **Validation:** [Yup, Zod, etc.]

## Error Handling Patterns
- **API Errors:** [How backend errors are handled]
- **Network Failures:** [Retry logic, offline handling]
- **Validation Errors:** [Form validation and display]
- **Global Error Handling:** [Error boundaries, global handlers]

## Performance Considerations
- **Data Fetching Strategy:** [Eager/lazy loading patterns]
- **Caching Strategy:** [What and how long data is cached]
- **Optimization Techniques:** [Memoization, virtualization, etc.]
- **Bundle Impact:** [State management library sizes]

## Data Flow Diagram
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Database  │───→│  Backend    │───→│   Frontend  │───→│     UI      │
│             │    │     API     │    │    Store    │    │ Components  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ↑                   ↑                   ↑                   ↑
   [Data types]    [API contracts]   [State shape]   [Props/hooks]
```

## Recommendations
1. **[High Priority]** - [Specific data flow improvement]
2. **[Medium Priority]** - [State management optimization]  
3. **[Low Priority]** - [Performance enhancement]

## Action Items
- [ ] [Specific data flow improvement task]
- [ ] [State management optimization task]
- [ ] [Documentation or tooling improvement]
```

## ✅ Quality Checklist
- [ ] **Complete API Mapping** – all backend endpoints and patterns documented
- [ ] **State Management Coverage** – client-side state patterns identified
- [ ] **Integration Documentation** – external services and libraries mapped
- [ ] **Error Handling Analysis** – error patterns and strategies documented
- [ ] **Performance Assessment** – data flow efficiency evaluated
- [ ] **Visual Documentation** – clear diagrams and flow illustrations

## 🎯 Focus Areas
- **Data Consistency** – ensuring data integrity across application layers
- **Performance Optimization** – efficient data fetching and state updates
- **Error Resilience** – robust error handling throughout data pipeline
- **Developer Experience** – clear patterns for data management
- **Scalability** – data patterns that support application growth

## 💡 Analysis Tips
- Trace specific user workflows to understand complete data flows
- Identify common data transformation patterns across the application
- Look for potential performance bottlenecks in data fetching
- Check for proper error handling at each data flow stage
- Consider data consistency requirements for real-time features
- Document any custom data management utilities or helpers
