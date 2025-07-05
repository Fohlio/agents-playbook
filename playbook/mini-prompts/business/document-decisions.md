# Step • Document Decisions

## Purpose
Capture and document key technical and business decisions made during the project for future reference and knowledge preservation.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Completed project phase or major decisions made
- Decision outcomes and rationale

**Optional Context**:
- Previous decision documentation
- Stakeholder input and feedback
- Alternative options considered
- Impact assessment results

## Validation Logic
```javascript
canExecute() {
  return hasContext('decisions_made') &&
         hasContext('decision_rationale');
}
```

## Process
1. **Identify key decisions** - Catalog all significant technical and business decisions made
2. **Gather decision context** - Collect background information and constraints that influenced decisions
3. **Document alternatives considered** - Record options that were evaluated but not chosen
4. **Capture decision rationale** - Explain why specific decisions were made
5. **Assess decision impact** - Document consequences and implications of decisions
6. **Create decision records** - Format decisions in standard template for future reference
7. **Share and archive documentation** - Distribute to stakeholders and store in knowledge base

## Inputs
- Project decisions and outcomes
- Meeting notes and discussion records
- Alternative solutions and trade-off analyses
- Stakeholder input and requirements
- Technical constraints and considerations

## Outputs
- Architecture Decision Records (ADRs)
- Business Decision Documentation
- Trade-off analysis summaries
- Decision impact assessments
- Lessons learned documentation
- Knowledge base updates

## Success Criteria
- All significant decisions documented with clear rationale
- Alternative options and trade-offs captured
- Decision impact and consequences understood
- Documentation accessible to future team members
- Knowledge preserved for similar future decisions
- Stakeholders informed of decision outcomes

## Skip Conditions
- Only trivial decisions with no long-term impact were made
- Decisions are well-documented elsewhere
- Emergency situation where documentation is deferred
- Decisions are temporary and will be revisited soon

## Decision Categories

### Technical Decisions
- **Architecture Decisions**: System design and structure choices
- **Technology Stack**: Programming languages, frameworks, and tools
- **Integration Patterns**: How systems connect and communicate
- **Data Architecture**: Database design and data flow decisions
- **Security Approach**: Authentication, authorization, and protection methods

### Business Decisions
- **Feature Prioritization**: What features to build first
- **Scope Changes**: Additions or removals from project scope
- **Resource Allocation**: Team assignments and budget decisions
- **Timeline Adjustments**: Schedule changes and milestone updates
- **Risk Mitigation**: How to address identified risks

### Process Decisions
- **Development Methodology**: Agile, waterfall, or hybrid approaches
- **Quality Assurance**: Testing strategies and quality gates
- **Deployment Strategy**: How and when to release changes
- **Communication Plan**: How to keep stakeholders informed
- **Change Management**: How to handle scope and requirement changes

### Design Decisions
- **User Experience**: Interface design and interaction patterns
- **Performance Optimization**: Speed and efficiency trade-offs
- **Scalability Approach**: How to handle growth and load
- **Maintainability**: Code organization and documentation standards
- **Accessibility**: How to support users with disabilities

## Decision Documentation Template

### Decision Record Structure
- **Decision ID**: Unique identifier for tracking
- **Decision Title**: Clear, descriptive title
- **Status**: Proposed, Accepted, Superseded, or Deprecated
- **Date**: When the decision was made
- **Stakeholders**: Who was involved in the decision
- **Context**: Background and situation leading to decision
- **Decision**: What was decided
- **Rationale**: Why this decision was made
- **Consequences**: Expected outcomes and implications
- **Alternatives**: Other options considered and why they were rejected

### Architecture Decision Record (ADR) Example
```
# ADR-001: Use Microservices Architecture

## Status
Accepted

## Context
We need to design a scalable system that can handle growth and allow 
independent team development.

## Decision
We will use a microservices architecture with API gateway pattern.

## Rationale
- Enables independent scaling of components
- Allows teams to work independently
- Supports technology diversity
- Improves fault isolation

## Consequences
- Increased complexity in deployment and monitoring
- Network latency between services
- Need for distributed system expertise
- More complex testing scenarios

## Alternatives Considered
- Monolithic architecture: Simpler but less scalable
- Modular monolith: Better than pure monolith but still coupled
```

## Documentation Best Practices

### Clarity and Completeness
- Use clear, jargon-free language
- Provide sufficient context for future readers
- Include specific examples and scenarios
- Document assumptions and constraints
- Explain technical terms and concepts

### Traceability and Versioning
- Use unique identifiers for each decision
- Link to related decisions and documents
- Track decision evolution over time
- Version control decision documents
- Maintain decision history and changes

### Accessibility and Discoverability
- Store in centralized, searchable location
- Use consistent formatting and templates
- Tag decisions by category and topic
- Create index or catalog of decisions
- Make accessible to all team members

### Review and Maintenance
- Schedule periodic review of decisions
- Update status when decisions are superseded
- Mark deprecated decisions clearly
- Learn from decision outcomes
- Improve decision-making process based on results

## Common Decision Scenarios

### Technology Selection
- Programming language and framework choices
- Database and storage technology decisions
- Third-party service and tool selections
- Cloud provider and infrastructure decisions
- Monitoring and observability tool choices

### Architecture Patterns
- Microservices vs monolithic architecture
- Synchronous vs asynchronous communication
- Event-driven vs request-response patterns
- Caching strategies and implementation
- Security architecture and patterns

### Business Process Changes
- Workflow automation decisions
- User access and permission models
- Data governance and compliance approaches
- Integration with existing systems
- Change management and migration strategies

### Quality and Performance Trade-offs
- Performance vs maintainability balance
- Security vs usability considerations
- Cost vs feature richness decisions
- Time to market vs technical debt trade-offs
- Standardization vs flexibility choices

## Knowledge Management Integration

### Knowledge Base Updates
- Add new insights and lessons learned
- Update best practices and guidelines
- Create reusable decision templates
- Build decision-making frameworks
- Share expertise across teams

### Training and Onboarding
- Use decisions as training materials
- Include in new team member onboarding
- Create case studies from decision outcomes
- Build institutional knowledge
- Prevent repeated mistakes

### Future Project Reference
- Provide templates for similar decisions
- Offer precedents for future choices
- Share lessons learned and outcomes
- Build organizational memory
- Improve decision quality over time

## Notes
- Document decisions soon after they're made while context is fresh
- Focus on decisions that will impact future work or team members
- Include both successful and unsuccessful decision outcomes
- Use decisions as learning opportunities for the team
- Balance documentation effort with decision importance
- Make decision records living documents that evolve with understanding 