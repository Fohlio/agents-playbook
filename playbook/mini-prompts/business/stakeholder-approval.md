# Step • Stakeholder Approval

## Purpose
Obtain formal approval and sign-off from business stakeholders before proceeding with implementation or deployment.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Completed deliverable requiring approval (requirements, design, implementation, etc.)
- Identified stakeholders with approval authority

**Optional Context**:
- Approval criteria and process
- Previous stakeholder feedback
- Business impact assessment
- Risk analysis

## Validation Logic
```javascript
canExecute() {
  return hasContext('deliverable_ready_for_approval') &&
         hasContext('approval_stakeholders');
}
```

## Process
1. **Prepare approval package** - Compile all materials needed for stakeholder review
2. **Schedule stakeholder review** - Arrange meetings or review sessions with key approvers
3. **Present deliverable** - Walk through the solution with stakeholders
4. **Address questions and concerns** - Respond to feedback and clarify any issues
5. **Document approval decisions** - Record formal approval or required changes
6. **Obtain formal sign-off** - Secure written confirmation of approval
7. **Communicate approval status** - Inform project team and relevant parties

## Inputs
- Completed deliverable (requirements, design, implementation, test results, etc.)
- Stakeholder contact information and roles
- Approval criteria and success metrics
- Supporting documentation and evidence
- Business case and impact analysis

## Outputs
- Formal approval documentation
- Stakeholder feedback and comments
- Conditional approval requirements (if any)
- Risk acknowledgment and mitigation agreements
- Next steps and implementation authorization
- Communication plan for approval status

## Success Criteria
- All required stakeholders have reviewed the deliverable
- Formal approval obtained from decision-makers
- Any conditions or requirements clearly documented
- Risks acknowledged and mitigation plans approved
- Clear authorization to proceed with next steps
- Approval documented and communicated to team

## Skip Conditions
- Stakeholders have already provided approval in previous sessions
- Emergency situation where formal approval process is bypassed
- Internal technical decisions that don't require business approval
- Stakeholders are not available and approval is delegated

## Approval Categories

### Requirements Approval
- **Business Requirements**: Functional and non-functional requirements sign-off
- **Scope Definition**: Project boundaries and deliverables approval
- **Success Criteria**: Acceptance criteria and definition of done
- **Budget Authorization**: Financial approval for project costs
- **Timeline Acceptance**: Schedule and milestone agreements

### Design Approval
- **Solution Architecture**: Technical design and approach approval
- **User Interface Design**: UI/UX mockups and user experience approval
- **Integration Design**: External system connections and data flow
- **Security Design**: Security architecture and controls approval
- **Performance Design**: Scalability and performance targets

### Implementation Approval
- **Code Review**: Technical implementation quality and standards
- **Feature Completeness**: All required functionality implemented
- **Quality Assurance**: Testing results and quality metrics
- **Security Validation**: Security testing and vulnerability assessment
- **Performance Validation**: Performance testing and benchmarks

### Deployment Approval
- **Production Readiness**: System ready for live deployment
- **Rollback Plans**: Contingency plans in case of issues
- **Monitoring Setup**: Observability and alerting configuration
- **Support Documentation**: Operational procedures and troubleshooting
- **Training Completion**: User training and change management

## Stakeholder Categories

### Business Stakeholders
- **Product Owner**: Overall product vision and roadmap
- **Business Sponsor**: Financial and strategic oversight
- **End Users**: User acceptance and usability validation
- **Department Heads**: Operational impact and resource allocation
- **Compliance Officers**: Regulatory and policy compliance

### Technical Stakeholders
- **Solution Architect**: Technical design and integration approval
- **Security Team**: Security requirements and risk assessment
- **Operations Team**: Deployment and maintenance readiness
- **Data Team**: Data architecture and governance compliance
- **QA Team**: Quality standards and testing completeness

### External Stakeholders
- **Regulatory Bodies**: Compliance and legal requirements
- **Partner Organizations**: Integration and collaboration impacts
- **Vendor Representatives**: Third-party service and tool validation
- **Audit Teams**: Control and governance compliance
- **Customer Representatives**: External user impact and feedback

## Approval Process Best Practices

### Preparation
- Provide materials in advance for stakeholder review
- Include executive summary for high-level stakeholders
- Prepare specific talking points for each stakeholder group
- Anticipate questions and prepare responses
- Include risk assessment and mitigation plans

### Presentation
- Tailor presentation to stakeholder interests and concerns
- Focus on business value and impact
- Use visual aids and demonstrations when possible
- Allow time for questions and discussion
- Be transparent about limitations and risks

### Documentation
- Record all feedback and decisions
- Document any conditions or requirements for approval
- Capture risk acknowledgments and mitigation agreements
- Obtain written confirmation of approval
- Distribute approval status to relevant parties

### Follow-up
- Address any outstanding issues or conditions
- Provide regular updates on implementation progress
- Schedule check-ins with stakeholders as needed
- Escalate any blockers or concerns quickly
- Maintain stakeholder engagement throughout project

## Approval Documentation Template

### Approval Summary
- **Project/Deliverable**: What is being approved
- **Approval Date**: When approval was granted
- **Approving Stakeholders**: Who provided approval
- **Approval Type**: Conditional or unconditional approval
- **Next Steps**: Authorized actions and timeline

### Stakeholder Feedback
- **Stakeholder Name**: Who provided feedback
- **Feedback Summary**: Key points and concerns raised
- **Resolution**: How feedback was addressed
- **Approval Status**: Approved, approved with conditions, or rejected
- **Additional Comments**: Any other relevant information

### Conditions and Requirements
- **Condition Description**: What must be completed before proceeding
- **Responsible Party**: Who will address the condition
- **Target Date**: When condition must be met
- **Verification Method**: How completion will be validated
- **Impact if Not Met**: Consequences of not meeting condition

## Common Approval Scenarios

### Requirements Sign-off
- Business stakeholders approve functional requirements
- Technical stakeholders approve non-functional requirements
- Compliance team approves regulatory requirements
- Budget approval for project costs and timeline

### Design Approval
- Architecture review and approval
- UI/UX design validation with users
- Security design approval from security team
- Integration design approval from partner systems

### Go-Live Approval
- Production readiness checklist completion
- Performance and security testing results
- Rollback plan and support procedures
- Stakeholder acknowledgment of risks and impacts

### Change Approval
- Scope changes and impact assessment
- Budget and timeline adjustments
- Resource reallocation and priority changes
- Risk assessment for proposed changes

## Notes
- Build stakeholder engagement throughout the project, not just at approval points
- Be transparent about risks and limitations - don't oversell
- Document all decisions and conditions clearly
- Follow up on conditional approvals to ensure conditions are met
- Respect stakeholder time by being well-prepared and focused
- Consider different approval levels for different types of decisions 