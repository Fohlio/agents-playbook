# Create Technical Architecture Document

## Objective
Analyze requirements, define technical architecture (framework, language, methodology, infrastructure), and write comprehensive design specifications to `.agents-playbook/<product-slug>/design.md`.

## Context Required
- **structured_requirements**: The requirements from the requirements phase
- **product_slug**: The unique identifier/slug for the product
- **technical_constraints** (optional): Known technical limitations or constraints
- **technology_preferences** (optional): Preferred technologies or stack

## Instructions

### 1. Architecture Analysis
Based on requirements, determine:
- Most appropriate technology stack (frontend, backend, database)
- Architecture patterns (microservices, monolith, serverless, etc.)
- Development methodology and practices
- Infrastructure and deployment strategy
- Integration requirements
- Security architecture
- Performance and scalability considerations

Conduct a thorough design analysis similar to the `design-architecture` mini-prompt.

### 2. Prepare Output Path
Calculate the absolute output path:
```
.agents-playbook/<product_slug>/design.md
```

Ensure the parent directory exists.

### 2. Structure the Design File

Create a comprehensive design document with the following sections:

```markdown
# Design & Architecture

## Overview
[High-level architectural approach and design philosophy]

## Technology Stack
### Frontend
- **Framework**: [e.g., React, Vue, Next.js]
- **Language**: [e.g., TypeScript, JavaScript]
- **State Management**: [e.g., Redux, Zustand, React Context]
- **Styling**: [e.g., Tailwind CSS, styled-components, CSS Modules]

### Backend
- **Framework**: [e.g., Express, NestJS, FastAPI]
- **Language**: [e.g., Node.js/TypeScript, Python, Go]
- **Database**: [e.g., PostgreSQL, MongoDB, Redis]
- **API Design**: [e.g., REST, GraphQL, gRPC]

### Infrastructure
- **Hosting**: [e.g., Vercel, AWS, GCP]
- **CI/CD**: [e.g., GitHub Actions, CircleCI]
- **Monitoring**: [e.g., Sentry, DataDog]

## Design System
### UI/UX Approach
[Design methodology, principles, and system]

### Component Library
[Planned component architecture and reusability strategy]

### Theming
[Theme system, colors, typography, spacing]

## Architecture Patterns
### System Architecture
[Microservices, monolith, serverless, etc.]

### Code Organization
[Folder structure, module organization]

### Design Patterns
[Key patterns to be used: MVC, MVVM, Clean Architecture, etc.]

## Data Architecture
### Data Models
[Core data entities and relationships]

### Data Flow
[How data moves through the system]

## Integration Architecture
### External APIs
[Third-party services and integrations]

### Authentication/Authorization
[Auth strategy and implementation approach]

## Security Architecture
[Security measures, encryption, data protection]

## Performance Considerations
[Optimization strategies, caching, lazy loading]

## Scalability Plan
[How the system will scale with growth]

## Development Methodology
[Agile, Scrum, Kanban, testing approach, code review process]

## Technical Constraints
[Known limitations, dependencies, technical debt considerations]
```

### 3. Populate Content
- Use architectural decisions from analysis
- Extract relevant information from optional context (technical_constraints, technology_preferences)
- Be specific about technology choices with versions where relevant
- Explain rationale for key decisions
- Include diagrams or ASCII diagrams if helpful
- Reference industry best practices

### 4. Write the File
Write the formatted content to the calculated output path.

### 5. Return Output
Set the output context:
```
design_file_path: .agents-playbook/<product_slug>/design.md
design_specifications: [technical architecture data structure]
```

Store the design specifications in context for use by subsequent steps (design-system, planning).

## Output Format
The file should be:
- Comprehensive technical specification
- Specific technology choices with versions where relevant
- Clear rationale for major decisions
- Actionable for development teams

## Validation
- File created at correct location
- All major architecture areas covered
- Technology stack clearly defined
- Design system documented
- Path stored in context for later reference

