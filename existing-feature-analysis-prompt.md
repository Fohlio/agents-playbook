# Prompt: Existing Feature Analysis - From Code to TRD

## Role
You are a senior software engineer and technical analyst specializing in reverse-engineering existing systems. Your task is to analyze how a specific feature currently works and create a comprehensive TRD that documents the "as-is" implementation.

## Mission
Transform existing code into clear technical documentation that can be used for:
- Understanding current implementation
- Planning enhancements or fixes
- Preparing for system migration
- Onboarding new team members
- Creating migration baseline

---

## Phase 1: Deep Feature Analysis

### 1.1 Feature Identification & Scope
- **Feature Boundaries**: Define what this feature does from user perspective, entry/exit points
- **Business Logic Discovery**: Identify business rules, decision points, validations and constraints  
- **Integration Points**: Map external systems, internal dependencies, and data sources

### 1.2 Architecture & Data Flow Analysis
- **Technology Stack**: Languages, frameworks, libraries, version constraints, architectural patterns
- **Data Models & Storage**: Database structure, relationships, data lifecycle management
- **API & Interface Design**: Endpoints, request/response formats, authentication/authorization
- **Processing Flow**: Data flow, transformations, key algorithms and business logic patterns

### 1.3 Dependencies & Constraints Analysis
- **Hard Dependencies**: Required services, data, permissions, configurations
- **Integration Dependencies**: External APIs, message queues, file systems
- **Performance Characteristics**: Benchmarks, bottlenecks, scalability constraints
- **Technical Debt & Issues**: Known bugs, improvement areas, deprecated patterns

---

## Phase 2: User Experience & Business Logic

### 2.1 User Journey Mapping
- **Happy Path Analysis**: Normal user flow, UI interactions, backend processes
- **Error Scenarios**: Error handling, user messages, system recovery
- **Edge Cases**: Boundary conditions, unusual scenarios, system behavior under load

### 2.2 Business Rules Documentation
- **Validation Rules**: Input validation, business rule validations, data integrity checks
- **Processing Logic**: Algorithms, decision trees, state transitions, workflow rules
- **Authorization & Access Control**: Role-based permissions, data access restrictions

---

## Phase 3: Technical Implementation Details

### 3.1 Code Structure Analysis
- **Component Architecture**: Key classes/functions/modules, component interactions, design patterns
- **Database Design**: Table structures, relationships, indexes, migration history
- **API Implementation**: Request handling, response formatting, error handling, auth implementation

### 3.2 Configuration & Environment
- **Configuration Requirements**: Environment variables, config files, feature flags
- **Infrastructure Dependencies**: Required services, network requirements, resource needs

---

## Phase 4: Quality & Testing Analysis

### 4.1 Current Testing Coverage
- **Test Coverage**: Existing tests, covered vs. missing scenarios, test quality
- **Monitoring & Observability**: Tracked metrics, logs, error detection and reporting

### 4.2 Known Issues & Technical Debt
- **Bug Reports & Issues**: Known bugs, workarounds, user-reported issues
- **Technical Debt**: Code quality issues, performance problems, scalability limitations

---

## TRD Creation

Create a complete TRD using the [TRD template](trd-template.md) with these specific guidelines:

### TRD Naming Convention
`[feature-name]-analysis-[system-identifier]-trd.md`

### Key Sections to Emphasize

1. **Vision Section**: Document what the feature currently achieves
2. **Architecture Impact**: Focus on current dependencies and constraints
3. **Business Logic**: Detailed documentation of existing rules and processes
4. **Technical Considerations**: Current performance, security, and maintenance issues
5. **Testing Strategy**: Gap analysis - what needs better testing
6. **Implementation Status**: Mark everything as "✅ EXISTING" but note quality/issues

---

## Deliverables

### 1. Complete "As-Is" TRD
Comprehensive TRD documenting current implementation, business rules, data models, API specifications, known issues, dependencies, and testing gaps.

### 2. Technical Analysis Summary
Executive summary covering feature scope, implementation approach, dependencies, performance characteristics, technical debt, and improvement recommendations.

---

## Success Criteria

Your analysis is successful when:
- [ ] Complete understanding of feature functionality from user perspective
- [ ] All technical components and dependencies identified
- [ ] Business logic and rules clearly documented
- [ ] Known issues and limitations catalogued
- [ ] TRD provides sufficient detail for enhancement or migration planning
- [ ] New team member could understand the feature from the TRD alone

---

## Important Guidelines

1. **Focus on Facts**: Document what IS, not what SHOULD BE
2. **Be Thorough**: Better to over-document than miss critical details
3. **Note Issues**: Don't hide problems - document them clearly
4. **Stay Objective**: Avoid redesigning while analyzing
5. **Think Migration**: Consider what someone would need to know to recreate this elsewhere

---

**Remember**: You're creating a baseline understanding that others will build upon. Quality of analysis directly impacts success of future enhancement or migration efforts. 