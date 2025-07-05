# Step • Gather Requirements

## Purpose
Collect comprehensive business requirements from stakeholders to ensure solution meets business needs and objectives.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Project or feature scope definition
- Stakeholder identification

**Optional Context**:
- Existing business documentation
- Previous requirements
- Business process documentation
- User personas and roles

## Validation Logic
```javascript
canExecute() {
  return hasContext('project_scope') &&
         hasContext('stakeholders_identified');
}
```

## Process
1. **Identify key stakeholders** - Map all relevant business stakeholders and their interests
2. **Conduct stakeholder interviews** - Gather requirements through structured discussions
3. **Analyze business processes** - Understand current workflows and pain points
4. **Document functional requirements** - Capture what the solution needs to do
5. **Define non-functional requirements** - Identify quality, performance, and constraint requirements
6. **Prioritize requirements** - Establish must-have vs nice-to-have features
7. **Validate and confirm requirements** - Review with stakeholders for accuracy and completeness

## Inputs
- Project scope and objectives
- Stakeholder contact information
- Existing business documentation
- Current system information
- Business process descriptions

## Outputs
- Comprehensive requirements document
- Stakeholder analysis and roles
- Business process maps
- Functional requirements list
- Non-functional requirements specification
- Requirements priority matrix
- Assumptions and constraints documentation

## Success Criteria
- All key stakeholders interviewed and their needs understood
- Business requirements clearly documented and validated
- Requirements prioritized by business value
- Acceptance criteria defined for each requirement
- Conflicts and dependencies identified and resolved
- Stakeholder sign-off on requirements documentation

## Skip Conditions
- Requirements are already well-documented and validated
- Project scope is very limited and requirements are obvious
- Emergency situation where requirements gathering is deferred
- Technical-only project with no business requirement changes

## Requirement Categories

### Functional Requirements
- **Core Features**: Primary functionality the system must provide
- **User Workflows**: Step-by-step processes users need to complete
- **Business Rules**: Logic and validation rules the system must enforce
- **Data Requirements**: Information the system must capture, store, and process
- **Integration Requirements**: Connections with other systems or services

### Non-Functional Requirements
- **Performance**: Response time, throughput, and capacity requirements
- **Security**: Authentication, authorization, and data protection needs
- **Usability**: User experience and accessibility requirements
- **Reliability**: Availability, fault tolerance, and recovery requirements
- **Scalability**: Growth and load handling requirements

### Business Constraints
- **Budget Limitations**: Financial constraints and cost considerations
- **Timeline Requirements**: Delivery deadlines and milestone dates
- **Resource Constraints**: Available team members and skills
- **Technology Constraints**: Required or preferred technology stack
- **Regulatory Requirements**: Compliance and legal obligations

### Stakeholder Requirements
- **End Users**: People who will directly use the system
- **Business Owners**: People responsible for business outcomes
- **IT Operations**: People responsible for system maintenance
- **Compliance Officers**: People responsible for regulatory compliance
- **External Partners**: Third parties that integrate with the system

## Requirements Gathering Techniques

### Stakeholder Interviews
- Prepare structured questionnaires
- Focus on business goals and pain points
- Ask open-ended questions to explore needs
- Document assumptions and constraints
- Follow up on unclear or conflicting information

### Business Process Analysis
- Map current state processes
- Identify inefficiencies and bottlenecks
- Define desired future state
- Document process variations and exceptions
- Understand decision points and approvals

### User Story Development
- Write requirements as user stories
- Include persona, goal, and benefit
- Define acceptance criteria for each story
- Estimate relative complexity or effort
- Group related stories into epics or themes

### Requirements Workshops
- Facilitate collaborative requirements sessions
- Use techniques like brainstorming and affinity mapping
- Resolve conflicts and inconsistencies in real-time
- Build consensus on priorities and scope
- Document decisions and rationale

## Documentation Standards

### Requirement Structure
- **Requirement ID**: Unique identifier for tracking
- **Description**: Clear, concise statement of the requirement
- **Rationale**: Why this requirement is needed
- **Priority**: Must-have, should-have, could-have, won't-have
- **Acceptance Criteria**: How to verify the requirement is met
- **Dependencies**: Other requirements this depends on
- **Assumptions**: Underlying assumptions made

### User Story Format
```
As a [persona/role]
I want [goal/desire]
So that [benefit/value]

Acceptance Criteria:
- Given [context]
- When [action]
- Then [outcome]
```

### Business Rules Documentation
- **Rule ID**: Unique identifier
- **Rule Description**: Clear statement of the business rule
- **Conditions**: When the rule applies
- **Actions**: What happens when conditions are met
- **Exceptions**: Special cases or overrides

## Common Requirements Categories

### User Management
- User registration and authentication
- Role-based access control
- User profile management
- Password reset and security
- User activity tracking

### Data Management
- Data input and validation
- Data storage and retrieval
- Data export and reporting
- Data backup and recovery
- Data privacy and security

### Workflow Management
- Process automation
- Approval workflows
- Task assignment and tracking
- Notification and alerts
- Audit trails and history

### Integration Requirements
- API integrations
- Data synchronization
- Single sign-on (SSO)
- Third-party service connections
- Legacy system integration

### Reporting and Analytics
- Standard reports
- Ad-hoc query capabilities
- Dashboard and visualizations
- Key performance indicators (KPIs)
- Data export capabilities

## Quality Criteria for Requirements

### Clear and Unambiguous
- Use precise language without jargon
- Avoid vague terms like "user-friendly" or "fast"
- Define specific criteria and measurements
- Include examples when helpful
- Review for multiple interpretations

### Complete and Comprehensive
- Cover all aspects of the functionality
- Include both positive and negative scenarios
- Address edge cases and exceptions
- Consider integration and dependencies
- Include non-functional aspects

### Consistent and Compatible
- Use consistent terminology throughout
- Ensure requirements don't contradict each other
- Align with business objectives and constraints
- Compatible with existing systems and processes
- Follow established standards and conventions

### Verifiable and Testable
- Include specific acceptance criteria
- Define measurable success metrics
- Consider how requirements will be tested
- Include test data and scenarios
- Enable validation and verification

## Notes
- Invest time upfront in thorough requirements gathering
- Involve all relevant stakeholders early and often
- Document assumptions and get them validated
- Expect requirements to evolve and plan for change management
- Balance detail with flexibility for implementation decisions
- Use visual aids and prototypes to clarify complex requirements 