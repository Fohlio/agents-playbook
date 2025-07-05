# Step • Create Project Navigation

## Purpose
Create comprehensive project navigation and context documentation that serves as a reference for all future development work.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Project codebase access
- Project root directory

**Optional Context**:
- Existing documentation
- Team preferences
- Technology stack information

## Validation Logic
```javascript
canExecute() {
  return hasContext('project_codebase') &&
         hasContext('project_root_directory');
}
```

## Process
1. **Analyze project structure** - Map directory organization and file patterns
2. **Identify technology stack** - Document frameworks, tools, and dependencies
3. **Document coding patterns** - Extract common patterns and architectural decisions
4. **Identify anti-patterns** - Document what to avoid based on existing code
5. **Create navigation map** - Build comprehensive project navigation guide
6. **Generate AGENTS.MD** - Create AI agent context file with project specifics
7. **Document key interfaces** - Map important APIs, components, and data flows

## Inputs
- Project directory structure
- Source code files and dependencies
- Configuration files
- Existing documentation
- Package/dependency files

## Outputs
- **AGENTS.MD** - AI agent context and project guide
- **Project Navigation Map** - Directory structure and purpose guide
- **Coding Patterns Guide** - Preferred patterns and architectures
- **Anti-patterns Guide** - What to avoid in this project
- **Technology Stack Documentation** - Tools, frameworks, and versions
- **Key Interfaces Map** - Important APIs and integration points

## Success Criteria
- Complete project structure documented
- Common coding patterns identified and documented
- Anti-patterns clearly defined
- Technology stack fully mapped
- Navigation context usable by future agents
- AGENTS.MD file created and comprehensive

## Skip Conditions
- Project navigation already exists and is up to date
- Very simple project with obvious structure
- Project is being deprecated or migrated

## Project Navigation Structure

### 1. AGENTS.MD Creation
- **Project Overview**: Purpose, scope, and business context
- **Technology Stack**: Languages, frameworks, tools, and versions
- **Architecture Overview**: High-level system design and patterns
- **Directory Structure**: Purpose of each major directory
- **Coding Standards**: Naming conventions and code organization
- **Common Patterns**: Frequently used architectural patterns
- **Anti-patterns**: What to avoid in this codebase
- **Key Files**: Important configuration and entry point files
- **Development Workflow**: How to work with this project
- **Testing Strategy**: How tests are organized and run

### 2. Directory Analysis
- **Source Code Organization**: How code is structured
- **Configuration Management**: Where configs live and how they work
- **Asset Management**: Static files, images, and resources
- **Documentation Location**: Where docs are stored
- **Build and Deploy**: Scripts and pipeline configurations
- **Dependencies**: Third-party libraries and their purposes

### 3. Pattern Recognition
- **Architectural Patterns**: MVC, MVVM, microservices, etc.
- **Design Patterns**: Singleton, factory, observer, etc.
- **Code Organization**: How modules and components are structured
- **Naming Conventions**: File, function, and variable naming
- **Data Flow Patterns**: How data moves through the system
- **Error Handling**: How errors are managed and logged

### 4. Anti-pattern Identification
- **Code Smells**: Problematic patterns to avoid
- **Architecture Issues**: Design problems to prevent
- **Performance Anti-patterns**: What hurts performance
- **Security Issues**: Common security mistakes in this codebase
- **Maintainability Issues**: What makes code hard to maintain

### 5. Technology Stack Mapping
- **Frontend Technologies**: UI frameworks, state management, styling
- **Backend Technologies**: Server frameworks, databases, APIs
- **DevOps Tools**: CI/CD, monitoring, deployment platforms
- **Development Tools**: Linters, formatters, build tools
- **Testing Tools**: Unit, integration, and E2E testing frameworks

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

## Integration with Other Prompts

### Context Reference Pattern
Other mini-prompts should reference this navigation context:

```javascript
// In other mini-prompts' validation logic
canExecute() {
  return hasContext('project_navigation') ||
         hasContext('AGENTS_MD') ||
         skipNavigationRequired();
}
```

### Common Context Dependencies
- **File Structure Understanding**: Reference project navigation for file placement
- **Pattern Compliance**: Use documented patterns for consistency
- **Anti-pattern Avoidance**: Check against known anti-patterns
- **Technology Alignment**: Ensure new code fits existing tech stack

## Notes
- This should be the FIRST step for any new project or agent
- All other mini-prompts should reference this navigation context
- Keep AGENTS.MD updated as project evolves
- Navigation context reduces redundant analysis in other prompts
- Patterns and anti-patterns are project-specific, not generic 