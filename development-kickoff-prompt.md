# Development Kickoff Prompt

**Purpose**: Systematic approach to starting development based on existing TRD  
**Use Case**: When you have a complete TRD and ready to begin implementation  
**Output**: Working implementation with tests and documentation

## 📋 Step 0: Create Development Checklist

**Create temporary checklist file** in the same directory as the TRD:
- Filename: `[TRD-name]-dev-checklist.md`
- Mark each phase as completed during development
- Mark each implementation phase as completed during development
- Delete after completion

**Template**:
```markdown
# [Feature Name] Development Checklist

- [ ] Phase 1: Pre-Development Setup
- [ ] Phase 2: Implementation Planning
- [ ] Phase 3: Implementation
- [ ] Phase 4: Documentation & Completion
```

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

### Step 1.2: TRD Analysis and Complexity Assessment
1. **Read the provided TRD thoroughly**
2. **Assess implementation complexity**:

#### Complexity Classification:
**Simple Implementation** (< 3 files, established patterns):
- Basic CRUD operations
- UI component additions
- Configuration changes
- Bug fixes with clear scope

**Standard Implementation** (3-10 files, some new patterns):
- New feature with frontend/backend
- API integrations
- Database schema changes
- Multi-component features

**Complex Implementation** (10+ files, architectural changes):
- New system integrations
- Performance optimizations
- Security implementations
- Cross-cutting concerns

3. **Identify any unclear requirements** and ask clarifying questions if needed

## 🔄 Phase 2: Implementation Planning & Automation Setup

### Step 2.1: Automated Analysis (if Context7 available)
**Leverage automated codebase analysis**:
- Search for similar existing implementations
- Identify relevant patterns and conventions
- Find related test files and testing patterns
- Locate configuration files and deployment patterns
- Check for existing error handling approaches

### Step 2.2: Implementation Strategy
Based on complexity assessment:

**For Simple Implementation**:
- Direct implementation following existing patterns
- Extend existing tests
- Minimal documentation updates

**For Standard Implementation**:
- Break into logical implementation phases
- Create comprehensive tests
- Update relevant documentation
- Plan integration testing

**For Complex Implementation**:
- Design implementation phases
- Plan architectural considerations
- Design comprehensive testing strategy
- Plan documentation and migration strategy

### Step 2.3: Automated Testing Strategy
**Leverage existing automation**:
- **Run existing test suites** to understand current coverage
- **Use CI/CD pipelines** for automated quality checks
- **Leverage static analysis** tools for code quality
- **Set up automated monitoring** for new functionality

## 🛠️ Phase 3: Implementation

### Step 3.1: Development Process
**Follow automated development workflow**:

1. **Automated Codebase Analysis**:
   - Use semantic search to understand existing architecture
   - Identify relevant files and patterns to follow
   - Check for similar implementations to reference

2. **Implementation**:
   - Follow established code patterns and conventions
   - Implement backend logic first, then frontend
   - Ensure proper error handling and logging
   - Use existing configuration and deployment patterns

3. **Automated Validation**:
   - Run automated tests continuously
   - Use linting and formatting tools
   - Leverage static analysis for quality checks
   - Check performance impact if relevant

### Step 3.2: Testing Implementation
**Automated Testing Approach**:

1. **Unit Testing**: Test individual components using existing test patterns
2. **Integration Testing**: Test component interactions and API endpoints
3. **E2E Testing** (if Playwright available):
   - Automate critical user journeys
   - Test cross-browser functionality
   - Validate business requirements automatically

**Test Automation**:
- Use existing test frameworks and patterns
- Extend existing test suites where possible
- Automate regression testing for existing functionality
- Set up automated performance monitoring

## 📝 Phase 4: Documentation & Completion

### Step 4.1: Automated Documentation Updates
**Leverage automation for documentation**:
- Update API documentation if interfaces changed
- Generate code documentation from comments
- Update configuration documentation if settings changed
- Link to implementation commits/PRs

### Step 4.2: Simple Closure Process
**Essential completion steps**:
1. **Update TRD status**: Mark relevant sections as "Implemented"
2. **Add brief implementation notes**:
   - Key technical decisions made
   - Any deviations from original plan
   - Links to relevant code changes
3. **Update README** with feature summary and usage (if user-facing)

### Step 4.3: Automated Quality Validation
**Final automated checks**:
- All automated tests pass
- Code quality metrics meet standards
- Security scans pass
- Performance benchmarks maintained
- Documentation builds successfully

## 🎯 Success Criteria

Implementation is complete when:
- [ ] All TRD requirements implemented and working
- [ ] Automated test suite passing with appropriate coverage
- [ ] Code follows established patterns and quality standards
- [ ] Documentation updated (API docs, README, code comments)
- [ ] Feature integrates properly with existing system
- [ ] Automated monitoring/alerting in place (if applicable)

**Focus**: Leverage automation and existing patterns to implement features efficiently while maintaining code quality and system stability. 