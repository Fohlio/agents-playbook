# Create Implementation Plan & Task Breakdown Prompt (v1)

## 🎯 Goal
Generate detailed implementation plan (tasks.md) with hierarchical task breakdown, technical specifications, and requirement traceability for systematic development execution.

## 📥 Context (ask if missing)
1. **Structured Requirements** – requirements.md with User Stories and Acceptance Criteria
2. **Technical Architecture** – high-level system design and components
3. **Technology Stack** – frameworks, libraries, and tools to be used
4. **Development Environment** – existing codebase patterns and standards
5. **Team Capabilities** – available skills and resources for planning

## 🚦 Skip if
- Implementation plan already exists (<30 days) or feature is too simple for detailed breakdown

## 🔍 Task Breakdown Strategy

### **Task Grouping Principles**
- **Data Layer First** – database, models, migrations
- **API Layer Second** – backend endpoints and business logic  
- **UI Components Third** – user interface and interactions
- **Integration Fourth** – connecting components and systems
- **Testing & Polish Fifth** – validation, error handling, optimization

### **Task Hierarchy Format**
```
- [ ] 1. Major Task Group
  - High-level description of what needs to be implemented
  - Key technical considerations and dependencies
  - _Requirements: X.X, X.X_

  - [ ] 1.1 Specific Subtask
    - Detailed implementation steps
    - Specific technical requirements and acceptance criteria
    - Testing and validation requirements
    - _Requirements: X.X, X.X_
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
8. **Testing & Quality Assurance** – comprehensive test coverage
9. **Performance & Optimization** – responsive, efficient implementation

## ✅ Quality Requirements for Each Task
- [ ] **Clear Scope** – specific, actionable task description
- [ ] **Technical Details** – implementation approach specified
- [ ] **Acceptance Criteria** – clear definition of done
- [ ] **Requirement Traceability** – linked to specific requirements
- [ ] **Testing Requirements** – unit/integration tests specified
- [ ] **Dependencies** – prerequisites and order clearly defined

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

- [ ] 1. Set up database schema and core data models
  - [High-level description of data layer work]
  - _Requirements: X.X, X.X_

  - [ ] 1.1 Create data models
    - [Specific technical implementation details]
    - [Testing requirements]
    - _Requirements: X.X_

- [ ] 2. Create API endpoints
  - [API layer description]
  - _Requirements: X.X, X.X_

  - [ ] 2.1 Implement GET endpoints
    - [Detailed implementation steps]
    - _Requirements: X.X_
```

## 🎯 Task Planning Guidelines

### **Task Sizing**
- **Major Groups (1-10)** – Can take 1-3 days to complete
- **Subtasks (X.1-X.N)** – Should be completable in 2-6 hours
- **Atomic Actions** – Each checkbox represents a specific deliverable

### **Dependency Management** 
- Order tasks by logical dependencies (data → API → UI → integration)
- Ensure each task has clear prerequisites
- Group related tasks to minimize context switching

### **Technical Depth**
- Include specific technology decisions (frameworks, libraries)
- Specify testing requirements for each component
- Add error handling and validation requirements
- Consider performance and scalability needs

## 🔄 Integration Notes
This prompt works with:
- `create-structured-requirements.md` - uses requirements for task creation
- `create-trd.md` - aligns with technical architecture decisions
- `implement-feature.md` - provides detailed task list for implementation

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
- **Plan for testing** – include test requirements in each task
- **Think about edge cases** – include error handling and validation
- **Plan for maintainability** – include documentation and code quality tasks
