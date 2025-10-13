# Create Implementation Plan & Task Breakdown Prompt (v1)

## 🎯 Goal
Generate detailed implementation plan (tasks.md) with hierarchical task breakdown, technical specifications, and requirement traceability for systematic development execution.

## 📋 General Instructions
- **Follow instructions precisely** - implement exactly what is requested, no more, no less
- **Avoid unnecessary code** - write only the code that is essential for the functionality  
- **Minimal logging** - use logging sparingly, only for essential debugging/monitoring
- **Critical review** - always step back and assess if the solution aligns with requirements and best practices

## 📥 Context (ask if missing)
1. **Requirements File** – `.agents-playbook/[task-name]/requirements.md` with User Stories and Acceptance Criteria
2. **Design Spec** – `.agents-playbook/[task-name]/design.md` with technical architecture and system components
3. **Technology Stack** – frameworks, libraries, and tools to be used
4. **Development Environment** – existing codebase patterns and standards


## 🔍 Task Breakdown Strategy

### **Code Patterns Analysis First**
- [ ] **Analyze Existing Patterns** – review codebase for established architectural patterns
- [ ] **Extract Best Practices** – identify coding conventions, naming standards, and reusable components
- [ ] **Document Standards** – note error handling, testing, and logging patterns currently in use

### **Task Grouping Principles** (Following Existing Patterns)
- **Data Layer First** – database, models, migrations following existing data patterns
- **API Layer Second** – backend endpoints and business logic using established API conventions  
- **UI Components Third** – user interface and interactions leveraging existing component patterns (reference `.agents-playbook/ui.json` if available)
- **Integration Fourth** – connecting components and systems using current integration approaches
- **Testing & Polish Fifth** – validation, error handling, optimization following existing standards

### **Task Hierarchy Format**
```
- [ ] 1. Major Task Group [TASK_TYPE: Backend|Frontend|Data Flow|Integration|Infrastructure]
  - High-level description of what needs to be implemented
  - Key technical considerations and dependencies
  - _Requirements: X.X, X.X_

  - [ ] 1.1 Specific Subtask [TASK_TYPE: Backend|Frontend|Data Flow|Integration|Infrastructure]
    - Detailed implementation steps
    - Specific technical requirements and acceptance criteria
    - _Requirements: X.X, X.X_

  - [ ] 1.2 Write tests for task 1.1 [TASK_TYPE: Testing]
    - Write tests covering business cases from requirements for task 1.1
    - Test all functionality implemented in task 1.1
    - Validate acceptance criteria from requirements
    - Cover edge cases and error scenarios
    - _Requirements: [Same requirements as task 1.1]_
```

## 📋 Implementation Plan Structure

### **Required Sections**
1. **Database & Data Models** – schema, migrations, relationships
2. **API Development** – endpoints, validation, authentication
3. **Frontend Components** – pages, components, interactions
4. **Core Functionality** – business logic and main features
5. **User Interface & Experience** – design implementation, responsive
6. **Integration & Data Flow** – connecting all components
7. **Error Handling & Validation** – robust error management
8. **Testing & Quality Assurance** – comprehensive test coverage (add test task after EACH implementation task)
9. **Performance & Optimization** – responsive, efficient implementation

**CRITICAL**: After each implementation task, add a corresponding test task that covers the business cases from requirements for that specific implementation.

## ✅ Quality Requirements for Each Task
- [ ] **Clear Scope** – specific, actionable task description
- [ ] **Technical Details** – implementation approach specified
- [ ] **Task Type Classification** – clearly labeled with appropriate task type
- [ ] **Acceptance Criteria** – clear definition of done
- [ ] **Requirement Traceability** – linked to specific requirements
- [ ] **Dependencies** – prerequisites and order clearly defined

## 📋 Task Type Classifications
Each task must be labeled with one of the following types:
- **Backend** – API development, business logic, server-side processing
- **Frontend** – UI components, user interactions, client-side logic  
- **Data Flow** – Database operations, data transformations, ETL processes
- **Integration** – External system connections, third-party APIs, service orchestration
- **Infrastructure** – Deployment, configuration, environment setup

## 🔗 Requirement Linking Format
Each task must include:
```
_Requirements: 2.1, 2.3, 4.1_
```
Where numbers refer to specific requirements from structured requirements document.

## 📤 Output
**File:** `.agents-playbook/[feature-name]/tasks.md`

### Document Structure:
```markdown
# Implementation Plan

- [ ] 1. Set up database schema and core data models [TASK_TYPE: Data Flow]
  - [High-level description of data layer work]
  - _Requirements: X.X, X.X_

  - [ ] 1.1 Create data models [TASK_TYPE: Data Flow]
    - [Specific technical implementation details]
    - _Requirements: X.X_

  - [ ] 1.2 Create database migrations [TASK_TYPE: Data Flow]
    - [Database schema setup and migration scripts]
    - _Requirements: X.X_

  - [ ] 1.3 Write tests for database layer [TASK_TYPE: Testing]
    - Test data models validation and constraints
    - Test database migrations and schema
    - Validate business rules at data layer
    - _Requirements: X.X, X.X_

- [ ] 2. Create API endpoints [TASK_TYPE: Backend]
  - [API layer description]
  - _Requirements: X.X, X.X_

  - [ ] 2.1 Implement GET endpoints [TASK_TYPE: Backend]
    - [Detailed implementation steps]
    - _Requirements: X.X_

  - [ ] 2.2 Implement POST endpoints [TASK_TYPE: Backend]
    - [API endpoint implementation details]
    - _Requirements: X.X_

  - [ ] 2.3 Write tests for API endpoints [TASK_TYPE: Testing]
    - Test all API endpoints (GET, POST, etc.)
    - Test request validation and error handling
    - Test authentication and authorization
    - Validate business logic in endpoints
    - _Requirements: X.X, X.X_

- [ ] 3. Create frontend components [TASK_TYPE: Frontend]
  - [UI component development]
  - _Requirements: X.X, X.X_

  - [ ] 3.1 Build main interface [TASK_TYPE: Frontend]
    - [Component implementation details]
    - _Requirements: X.X_

  - [ ] 3.2 Write tests for frontend components [TASK_TYPE: Testing]
    - Test component rendering and interactions
    - Test user workflows and navigation
    - Test form validation and submissions
    - Validate UI matches requirements and acceptance criteria
    - _Requirements: X.X, X.X_
```

## 🎯 Task Planning Guidelines

### **Task Sizing**
- **Major Groups (1-10)** – Comprehensive features with multiple components
- **Subtasks (X.1-X.N)** – Specific implementation components
- **Atomic Actions** – Each checkbox represents a specific deliverable

### **Dependency Management** 
- Order tasks by logical dependencies (data → API → UI → integration)
- Ensure each task has clear prerequisites
- Group related tasks to minimize context switching

### **Technical Depth**
- Include specific technology decisions (frameworks, libraries)
- Add error handling and validation requirements
- Consider performance and scalability needs
- Specify task type classification for each component

## 🔄 Integration Notes
This prompt works with:
- **requirements.md** - uses original user stories and acceptance criteria for task creation
- **design.md** - aligns with technical architecture decisions and system design
- **tasks.md** - creates the implementation breakdown that other prompts follow
- `implement-feature.md` - provides detailed task list for systematic implementation

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|structured requirements| A[Task Analyzer]
    A --> B[Group by technical layers]
    B --> C[Break into subtasks]
    C --> D[Add technical details]
    D --> E[Link to requirements]
    E --> F[Generate tasks.md]
```

## 💡 Best Practices
- **Start with MVP core** – prioritize essential functionality first
- **Consider vertical slices** – complete user workflows before adding features
- **Categorize all tasks** – ensure proper task type classification for clarity
- **Think about edge cases** – include error handling and validation
- **Plan for maintainability** – include documentation and code quality tasks
- **Test after every task** – ALWAYS add a test task immediately after each implementation task to validate business requirements
