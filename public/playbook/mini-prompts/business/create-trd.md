# Create TRD with Architecture Design & Task Breakdown Prompt (v3)

## 🎯 Goal
Turn business needs into a comprehensive TRD with solution architecture and detailed task breakdown—ready for implementation.

## 📥 Context (ask if missing)
1. **Analysis Results** – comprehensive feature/architecture analysis.
2. **Clarified Requirements** – business requirements with clarifications.
3. **Tech Constraints** – platform, compliance, perf targets, existing systems.
4. **Stakeholders** – who signs off on the tech design?
5. **Development Environment** – existing patterns, tools, frameworks.

## 🚦 Skip if
- A current TRD exists (<30 days) or scope is trivial/temporary.

## 🔍 Enhanced TRD Checklist

### **Architecture Design** 
- [ ] **Architecture Variants**: 2-3 approaches, trade-offs, recommended option
- [ ] **System Design**: Components, responsibilities, interfaces
- [ ] **Data Architecture**: Schema, relationships, migrations, validation
- [ ] **Integration Design**: API style, events, queues, third-party hooks
- [ ] **Security Architecture**: AuthN/Z, data protection, compliance
- [ ] **Design System**: Tokens, components, theming, accessibility

### **Technical Specifications**
- **Overview**  
  - [ ] Objectives + timeline  
  - [ ] High-level architecture & tech stack  

- **Implementation Strategy**
  - [ ] Break features into vertical slices (complete user scenarios)
  - [ ] Define delivery order from simplest to most complex slice
  - [ ] Ensure each slice delivers working end-to-end functionality

- **Functional Requirements**  
  - [ ] Feature list, workflows, UI specifications  

- **Non-Functional Requirements**  
  - [ ] Performance, scalability, security, reliability targets  

- **Data Layer**  
  - [ ] Models, storage strategy, validation rules  

- **API Specifications**  
  - [ ] Endpoints, payloads, authentication, rate limits  

- **Integration Architecture**  
  - [ ] External services, queues, webhooks, SSO  

- **Development Standards**  
  - [ ] Code style, testing patterns, error handling

### **Task Breakdown & Planning**
- [ ] **Vertical Slice Breakdown**: Complete user scenarios with tasks
- [ ] **Dependency Mapping**: Prerequisites and blockers for each slice  
- [ ] **Effort Estimation**: Time estimates for each task/slice
- [ ] **Acceptance Criteria**: Clear definition of done for each task  

## 📤 Outputs
1. Gather insights from the user directly
2. Generate comprehensive documentation including:

**File:** `.agents-playbook/[feature-or-task-name]/trd.md`

### Document Sections:
1. **Executive Summary** – objectives, scope, recommended architecture
2. **Architecture Design** – system diagrams, component matrix, data design
3. **Technical Specifications** – all TRD sections above
4. **Implementation Roadmap** – vertical slice breakdown with tasks
5. **Task Breakdown** – detailed task list with estimates and dependencies

### Additional Deliverables:
- **Architecture diagrams**: System & data flow (PlantUML/Mermaid)
- **API documentation**: Endpoint tables with examples
- **Task tracking**: Structured task list ready for project management
- **Decision log**: Architecture trade-offs and rationale  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|BRD / scope| A[TRD Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for BRD / constraints]
    B -- No --> D[Draft TRD]
    D --> E[Generate docs]
