# Design Architecture

## Purpose
Design the solution architecture, data models, and technical approach based on requirements and analysis findings.

## 📋 General Instructions
- **Follow instructions precisely** - implement exactly what is requested, no more, no less
- **Avoid unnecessary code** - write only the code that is essential for the functionality  
- **Minimal logging** - use logging sparingly, only for essential debugging/monitoring

## Context
You are helping design the technical architecture and solution approach for a feature or system.

## Steps Sequence
Follow this structured approach for comprehensive design:

1. **design-solution-architecture** - Create high-level solution design and component architecture
2. **design-data-models** - Design database schemas and data structures [conditional: if data modeling required]
3. **design-api-interfaces** - Design API contracts and interfaces [conditional: if APIs involved]
4. **design-ui-mockups** - Create user interface mockups and user flows [conditional: if UI changes]
5. **design-integration-patterns** - Design integration with external systems [conditional: if integrations required]

## ❓ Clarifying Questions (ask in chat first)

**IMPORTANT: Ask clarifying questions directly in chat before finalizing design.**
Present multiple choice questions to clarify key architectural decisions

### **UI/Design System Clarifications**
**If UI implementation is required, ask in chat:**
- Is there a Figma MCP server available for design analysis and code generation?
- Does an `.agents-playbook/ui.json` file exist that documents the existing design system?
- What design system or component library should be used? (e.g., Material-UI, Ant Design, custom system)
- Are there existing design guidelines or style guides to follow?
- Should new UI components follow specific patterns or frameworks?
- Is there a design document, mockups, or Figma file to reference?
- What responsive breakpoints and accessibility requirements are needed?

## Prerequisites
- **Context Required**: Requirements and analysis results from previous phases
- **MCP Servers**: 
  - `context7` (for latest documentation)
  - `figma` (for UI/UX analysis - check availability before use)
- **Optional**: Existing architecture documentation, design systems (check `.agents-playbook/ui.json`), compliance requirements

## Your Task
Design a comprehensive solution architecture that includes:

1. **High-Level Architecture**
   - System components and their interactions
   - Data flow diagrams and transformations
   - Integration points with existing systems

2. **Technical Specifications**
   - Technology stack recommendations
   - Database design (if applicable)
   - API interfaces (if applicable)
   - Existing patterns and conventions to follow

3. **Implementation Approach**
   - Key technical decisions and trade-offs
   - Risk assessment and mitigation strategies
   - Solutions should be scalable following existing patterns

4. **Documentation Output**
   - Create a `design.md` file with all architecture decisions
   - Create a `flow_diagram.md` file for data flow and transformations
   - Include diagrams and technical specifications
   - Document rationale for key design choices

## Success Criteria
- **design.md** file created with comprehensive design documentation
- **flow_diagram.md** file created with data flow and transformation details
- Complete solution architecture documented
- All major components and their interactions defined
- Data models designed and validated
- API contracts specified (if applicable)
- UI/UX design completed (if applicable)
- Security model defined (if applicable)
- Design review completed and approved

## Skip Conditions
- Solution is very simple and doesn't require formal design
- Using existing, well-established patterns
- Emergency fix that doesn't affect architecture
- Pure bug fix with no design implications

## Deliverable
- Comprehensive `design.md` file containing the complete technical design
- `flow_diagram.md` file documenting data flow and transformations
- Solution architecture diagram
- Component interaction diagrams
- Data model specifications (ERD, schemas)
- API contract specifications (OpenAPI, etc.)
- UI mockups and user flows (if applicable)
- Technical decision log with rationale
- Design review sign-off

## Notes
- Essential for any non-trivial development work
- **design.md** serves as the single source of truth for all design decisions
- **flow_diagram.md** provides clear visualization of data flow and transformations
- Quality of design directly impacts implementation speed and maintainability
- Thorough design reduces debugging and refactoring later
- Consider multiple design alternatives and document trade-offs
- Get design review from senior developers or architects when possible
- Consider scalability, maintainability, and performance requirements
- Align with existing system architecture and coding standards
