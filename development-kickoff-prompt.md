# Development Kickoff Prompt

**Purpose**: Systematic approach to starting development based on existing TRD  
**Use Case**: When you have a complete TRD and ready to begin implementation  
**Timeline**: Project kickoff to completion (days-weeks)  
**Output**: Working implementation with tests and documentation

## 🚀 Phase 1: Pre-Development Setup

### Step 1.1: MCP Tools Verification
Before starting development, verify access to required MCP tools:

```
Check availability of the following MCP tools:
- Context7 (semantic search, codebase analysis)
- GitHub (repository management, PR creation)
- Playwright (browser automation, E2E testing)

If any tools are unavailable, document limitations:
- Without Context7: Manual codebase exploration required
- Without GitHub: Manual git operations needed
- Without Playwright: Limited automated testing capabilities

Alert user about any missing tools and their impact on development process.
```

### Step 1.2: TRD Analysis and Clarification
1. **Read the provided TRD thoroughly**
2. **Analyze scope and complexity**
3. **Identify any unclear requirements**
4. **Ask clarifying questions** if needed:
   - Technical implementation details
   - Business logic edge cases
   - Integration requirements
   - Performance expectations
   - Security considerations

## 🔄 Phase 2: Development Planning

### Step 2.1: Feature Breakdown Assessment
Evaluate if the TRD contains multiple features:

**Single Feature**: Proceed directly to implementation
**Multiple Features**: Propose phase-based approach:
1. **Identify logical feature groups**
2. **Prioritize by business value and dependencies**
3. **Create vertical slices** for each phase:
   - Include frontend, backend, and data layer changes
   - Ensure each phase delivers working functionality
   - Minimize inter-phase dependencies

### Step 2.2: Phase Planning
For each phase, define:
- **Scope**: What specific functionality will be delivered
- **Success Criteria**: How to measure completion
- **Testing Strategy**: How the phase will be validated
- **Dependencies**: What must be completed first

## 🛠️ Phase 3: Implementation Cycle

### Step 3.1: Development Process
For each phase/feature:

1. **Codebase Analysis** (if Context7 available):
   - Understand existing architecture
   - Identify relevant files and patterns
   - Check for similar implementations

2. **Implementation**:
   - Follow established code patterns
   - Implement backend logic first
   - Add frontend components
   - Ensure proper error handling

3. **Code Review**:
   - Self-review for code quality
   - Check against TRD requirements
   - Verify security best practices

### Step 3.2: Phase Completion Testing
After each phase implementation:

**AI Test Strategy Implementation**:
1. **Unit Testing**: Test individual components
2. **Integration Testing**: Test component interactions
3. **User Acceptance Testing** (if Playwright available):
   - Create automated E2E test scenarios
   - Test critical user journeys
   - Validate business requirements

**Manual Testing Checklist**:
- [ ] Core functionality works as specified
- [ ] Error cases are handled gracefully
- [ ] Performance meets expectations
- [ ] Security requirements are satisfied
- [ ] Integration points function correctly

## 📝 Phase 4: Documentation and Closure

### Step 4.1: TRD Closure
Upon project completion:

1. **Update TRD status**: Mark as "Implemented"
2. **Add implementation notes**:
   - Key technical decisions made
   - Deviations from original plan (if any)
   - Known limitations or future considerations
3. **Link to relevant code/PRs**

### Step 4.2: README Updates
Update project README with:
- **Brief feature description** (1-2 sentences)
- **Link to TRD** for detailed specifications
- **Usage instructions** if user-facing
- **Technical notes** for developers

Example README section:
```markdown
## Recent Updates

### [Feature Name] - [Date]
Brief description of what was implemented.
See [TRD-XXX](link-to-trd) for detailed specifications.
```

### Step 4.3: Test Suite Completion
Ensure comprehensive test coverage:

1. **Unit Tests**:
   - All new functions/methods
   - Edge cases and error conditions
   - Mock external dependencies

2. **Integration Tests**:
   - API endpoints
   - Database operations
   - Third-party integrations

3. **E2E Tests** (if Playwright available):
   - Critical user workflows
   - Cross-browser compatibility
   - Performance benchmarks

## 🔄 Continuous Process Guidelines

### Quality Gates
Before proceeding to next phase:
- [ ] All tests pass
- [ ] Code review completed
- [ ] Performance benchmarks met
- [ ] Security review passed
- [ ] Documentation updated

### Communication Checkpoints
- **Phase Start**: Confirm scope and approach
- **Mid-Phase**: Update on progress and blockers
- **Phase End**: Demo functionality and gather feedback

### Risk Management
Monitor and address:
- **Technical Debt**: Refactor as needed
- **Scope Creep**: Refer back to TRD for boundaries
- **Performance Issues**: Address immediately
- **Security Concerns**: Never defer security fixes

## 🎯 Success Criteria

Project is considered complete when:
- [ ] All TRD requirements implemented
- [ ] Full test suite passing
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Performance benchmarks met
- [ ] Security requirements satisfied
- [ ] User acceptance criteria met

---

*This prompt ensures systematic, quality-focused development with proper testing and documentation at each step.* 