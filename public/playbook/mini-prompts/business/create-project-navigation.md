# Create Project Navigation

## Goal
Create comprehensive project navigation and context documentation that serves as a reference for all future development work.

**📁 Document Location**: Create AGENTS.MD and navigation documents in `docs/planning/` directory.

## Context Required
- Project codebase access
- Project root directory

## Skip When
- Project navigation already exists and is up to date
- Very simple project with obvious structure
- Project is being deprecated or migrated

## Complexity Assessment
- **Task Complexity**: High - requires comprehensive project analysis and documentation skills

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Project Navigation Structure

### 1. AGENTS.MD Creation
- **Project Overview** - purpose, scope, and business context
- **Technology Stack** - languages, frameworks, tools, and versions
- **Architecture Overview** - high-level system design and patterns
- **Directory Structure** - purpose of each major directory
- **Coding Standards** - naming conventions and code organization
- **Common Patterns** - frequently used architectural patterns
- **Anti-patterns** - what to avoid in this codebase
- **Key Files** - important configuration and entry point files
- **Development Workflow** - how to work with this project
- **Testing Strategy** - how tests are organized and run

### 2. Directory Analysis
- **Source Code Organization** - how code is structured
- **Configuration Management** - where configs live and how they work
- **Asset Management** - static files, images, and resources
- **Documentation Location** - where docs are stored
- **Build and Deploy** - scripts and pipeline configurations
- **Dependencies** - third-party libraries and their purposes

### 3. Pattern Recognition
- **Architectural Patterns** - MVC, MVVM, microservices, etc.
- **Design Patterns** - singleton, factory, observer, etc.
- **Code Organization** - how modules and components are structured
- **Naming Conventions** - file, function, and variable naming
- **Data Flow Patterns** - how data moves through the system
- **Error Handling** - how errors are managed and logged

### 4. Anti-pattern Identification
- **Code Smells** - problematic patterns to avoid
- **Architecture Issues** - design problems to prevent
- **Performance Anti-patterns** - what hurts performance
- **Security Issues** - common security mistakes in this codebase
- **Maintainability Issues** - what makes code hard to maintain

### 5. Technology Stack Mapping
- **Frontend Technologies** - UI frameworks, state management, styling
- **Backend Technologies** - server frameworks, databases, APIs
- **DevOps Tools** - CI/CD, monitoring, deployment platforms
- **Development Tools** - linters, formatters, build tools
- **Testing Tools** - unit, integration, and E2E testing frameworks

## Key Tasks
1. **Analyze project structure** - map directory organization and file patterns
2. **Identify technology stack** - document frameworks, tools, and dependencies
3. **Document coding patterns** - extract common patterns and architectural decisions
4. **Identify anti-patterns** - document what to avoid based on existing code
5. **Create navigation map** - build comprehensive project navigation guide
6. **Generate AGENTS.MD** - create AI agent context file with project specifics
7. **Document key interfaces** - map important APIs, components, and data flows

## AGENTS.MD Template

```markdown
# AI Agent Context for [Project Name]

## Project Overview
- **Purpose**: What this project does
- **Technology**: Primary tech stack
- **Architecture**: High-level design approach

## Quick Navigation
- **Entry Points**: Main application files
- **Key Directories**: Purpose of each major folder
- **Configuration**: Where settings and configs live
- **Tests**: How testing is organized

## Coding Patterns (✅ DO)
- **File Organization**: How to structure new files
- **Naming Conventions**: How to name functions, files, variables
- **Component Patterns**: How to create new components/modules
- **Data Handling**: How to manage state and data flow
- **Error Handling**: How to handle errors and logging

## Anti-patterns (❌ AVOID)
- **Code Organization**: Bad structuring patterns seen in this project
- **Performance**: Known performance bottlenecks to avoid
- **Security**: Security anti-patterns specific to this project
- **Architecture**: Design patterns that cause problems here

## Key Interfaces
- **APIs**: Important endpoints and their purposes
- **Components**: Major UI components and their usage
- **Services**: Core business logic services
- **Data Models**: Important data structures and schemas

## Development Workflow
- **Setup**: How to get started with development
- **Building**: How to build and run the project
- **Testing**: How to run tests and add new ones
- **Deployment**: How code gets deployed

## Tech Stack Details
- **Languages**: Programming languages and versions
- **Frameworks**: Major frameworks and their configurations
- **Databases**: Data storage solutions and schemas
- **External Services**: Third-party integrations and APIs
```

## Success Criteria
- Complete project structure documented
- Common coding patterns identified and documented
- Anti-patterns clearly defined
- Technology stack fully mapped
- Navigation context usable by future agents
- AGENTS.MD file created and comprehensive

## Key Outputs
- **AGENTS.MD** - AI agent context and project guide
- **Project Navigation Map** - directory structure and purpose guide
- **Coding Patterns Guide** - preferred patterns and architectures
- **Anti-patterns Guide** - what to avoid in this project
- **Technology Stack Documentation** - tools, frameworks, and versions
- **Key Interfaces Map** - important APIs and integration points 