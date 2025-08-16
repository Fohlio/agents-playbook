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

### **Architecture Validation**
- [ ] **Architecture Review**: Validate system design decisions
- [ ] **Integration Points**: Define component interfaces and contracts  
- [ ] **Scalability Assessment**: Architecture scalability and performance considerations
- [ ] **Security Review**: Architecture security considerations and compliance  

## 📤 Outputs
1. Gather insights from the user directly
2. Generate comprehensive documentation including:

**File:** `.agents-playbook/[feature-or-task-name]/trd.md`

### Document Sections:
1. **Executive Summary** – objectives, scope, recommended architecture
2. **Requirements Analysis** – clarified and analyzed requirements
3. **Feature Analysis** – comprehensive feature breakdown and implications
4. **Architecture Analysis** – system architecture and component design
5. **Solution Design** – detailed technical solution approach
6. **Implementation Strategy** – high-level approach and vertical slice organization
7. **API Specification** – detailed API contracts and interfaces
8. **Integration Architecture** – external systems and integration points
9. **Development Standards** – coding patterns and quality requirements
10. **Security Considerations** – security architecture and compliance
11. **Risk Assessment** – technical risks and mitigation strategies
12. **Appendices** – supporting documents and detailed specifications

### Additional Deliverables:
- **Architecture diagrams**: System & data flow (PlantUML/Mermaid)
- **API documentation**: Endpoint tables with examples
- **Decision log**: Architecture trade-offs and rationale
- **Technical specifications**: Detailed system specifications  

## ➡️ Response Flow
```mermaid
flowchart LR
    U[User] -->|BRD / scope| A[TRD Engine]
    A --> B{Need more context?}
    B -- Yes --> C[Ask for BRD / constraints]
    B -- No --> D[Draft TRD]
    D --> E[Generate docs]
