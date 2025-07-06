# Gather Requirements

## Goal
Collect comprehensive business requirements from stakeholders to ensure solution meets business needs and objectives.

**📁 Document Location**: Create all requirements documents in `docs/planning/` directory.

## Context Required
- Project/feature scope definition
- Stakeholder identification

## Context Gathering
If you don't have the required context, gather it by:
- **Project scope**: Ask user to describe the project, feature, or system being developed
- **Stakeholder identification**: Identify who uses, manages, or is affected by the system
- **Business objectives**: Understand the goals this project should achieve
- **Current state**: Learn about existing systems, processes, or solutions in place

## Skip When
- Requirements already well-documented and validated
- Very limited project scope with obvious requirements
- Emergency situation with deferred requirements gathering

## Complexity Assessment
- **Task Complexity**: Medium-High - requires stakeholder coordination and business analysis skills

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Context Assessment

**Before proceeding with requirements gathering, let's check what documentation already exists:**

### Existing Documentation
- **Do you already have requirements documentation?**
  A) Complete requirements document exists B) Partial/draft requirements available C) Only high-level notes/ideas D) Starting completely from scratch

- **What existing project documents are available?**
  A) Business requirements document B) Technical specifications C) User stories/epics D) Meeting notes/emails E) No existing documentation

- **Are there related documents I should reference?**
  A) Similar project requirements B) System architecture docs C) API documentation D) User research/feedback E) No related documents

### Document Generation Support
- **How would you like me to help with requirements?**
  A) Create complete requirements from your description B) Structure and organize existing notes C) Generate template for you to complete D) Review and improve existing requirements

- **What level of detail do you need?**
  A) High-level feature overview B) Detailed functional specifications C) Complete technical requirements D) MVP scope definition

- **Should I generate missing supporting documents?**
  A) Yes, create any needed supporting docs B) Focus only on core requirements C) I'll provide additional context as needed

**If documents don't exist, I can help generate them based on your input. If they exist but need improvement, I can help structure and enhance them.**

## Requirement Categories

### Functional Requirements
- **Core Features** - primary functionality system must provide
- **User Workflows** - step-by-step processes users complete
- **Business Rules** - logic and validation rules system enforces
- **Data Requirements** - information to capture, store, process
- **Integration Requirements** - connections with other systems

### Non-Functional Requirements
- **Performance** - response time, throughput, capacity
- **Security** - authentication, authorization, data protection
- **Usability** - user experience, accessibility
- **Reliability** - availability, fault tolerance, recovery
- **Scalability** - growth and load handling

### Business Constraints
- **Budget** - financial constraints, cost considerations
- **Timeline** - delivery deadlines, milestone dates
- **Resources** - available team members, skills
- **Technology** - required/preferred tech stack
- **Regulatory** - compliance, legal obligations

## Stakeholder Types
- **End Users** - direct system users
- **Business Owners** - responsible for business outcomes
- **IT Operations** - system maintenance responsibility
- **Compliance Officers** - regulatory compliance
- **External Partners** - third-party integrations

## Key Techniques
- **Stakeholder Interviews** - structured questionnaires, focus on goals/pain points
- **Business Process Analysis** - map current state, identify bottlenecks
- **User Story Development** - persona + goal + benefit with acceptance criteria
- **Requirements Workshops** - collaborative sessions, consensus building

## Documentation Structure
- **Requirement ID** - unique identifier
- **Description** - clear, concise statement
- **Priority** - must/should/could/won't have
- **Acceptance Criteria** - verification method
- **Dependencies** - related requirements
- **Assumptions** - underlying assumptions

## User Story Format
```
As a [role] I want [goal] so that [benefit]
Acceptance Criteria: Given [context] When [action] Then [outcome]
```

## Success Criteria
- All key stakeholders interviewed
- Requirements clearly documented and validated
- Priorities established by business value
- Acceptance criteria defined
- Stakeholder sign-off obtained

## Key Outputs
- Comprehensive requirements document
- Stakeholder analysis and roles
- Functional and non-functional requirements
- Priority matrix and dependencies
- Assumptions and constraints documentation 