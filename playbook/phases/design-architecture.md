# Phase • Design & Architecture

## Purpose
Design the solution architecture, data models, and technical approach based on requirements and analysis findings.

## Steps Sequence
1. **design-solution-architecture** - Create high-level solution design and component architecture
2. **design-data-models** - Design database schemas and data structures [conditional: if data modeling required]
3. **design-api-interfaces** - Design API contracts and interfaces [conditional: if APIs involved]
4. **design-ui-mockups** - Create user interface mockups and user flows [conditional: if UI changes]
5. **design-integration-patterns** - Design integration with external systems [conditional: if integrations required]
6. **design-security-model** - Design security architecture and access controls [conditional: if security requirements]
7. **design-deployment-strategy** - Plan deployment approach and infrastructure [conditional: if deployment changes]

## Phase Prerequisites
- **Context**: Requirements and analysis results from previous phases
- **MCP Servers**: 
  - `context7` (for design pattern research)
  - `playwright` (for UI/UX analysis)
- **Optional**: Existing architecture documentation, design systems, compliance requirements

## Phase Success Criteria
- Complete solution architecture documented
- All major components and their interactions defined
- Data models designed and validated
- API contracts specified (if applicable)
- UI/UX design completed (if applicable)
- Security model defined (if applicable)
- Deployment strategy planned
- Design review completed and approved

## Skip Conditions
- Solution is very simple and doesn't require formal design
- Using existing, well-established patterns
- Emergency fix that doesn't affect architecture
- Pure bug fix with no design implications

## Validation Logic
```javascript
canExecutePhase() {
  return hasContext('requirements') &&
         hasContext('analysis_results') &&
         requiresDesignWork();
}

shouldSkipPhase() {
  return isSimpleBugFix() ||
         hasContext('existing_design') ||
         isTrivalImplementation();
}

requiresDesignWork() {
  return hasNewFeatures() ||
         hasArchitectureChanges() ||
         hasDataModelChanges() ||
         hasIntegrationRequirements();
}
```

## Expected Duration
**Simple**: 1-2 hours  
**Standard**: 4-8 hours  
**Complex**: 1-3 days

## Outputs
- Solution architecture diagram
- Component interaction diagrams
- Data model specifications (ERD, schemas)
- API contract specifications (OpenAPI, etc.)
- UI mockups and user flows (if applicable)
- Security architecture design
- Deployment architecture diagram
- Technical decision log with rationale
- Design review sign-off

## Notes
- Essential for any non-trivial development work
- Quality of design directly impacts implementation speed and maintainability
- Invest time in design to save debugging and refactoring later
- Consider multiple design alternatives and document trade-offs
- Get design review from senior developers or architects when possible 