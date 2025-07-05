# Step • Validate Requirements

## Purpose
Verify that the implemented solution meets all specified requirements and acceptance criteria through systematic validation.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- Original requirements and acceptance criteria
- Completed implementation

**Optional Context**:
- Test execution results
- User feedback
- Performance monitoring data
- Stakeholder expectations

## Validation Logic
```javascript
canExecute() {
  return hasContext('original_requirements') &&
         hasContext('completed_implementation');
}
```

## Process
1. **Review original requirements** - Re-examine initial requirements and acceptance criteria
2. **Map implementation to requirements** - Verify each requirement has been addressed
3. **Validate functional requirements** - Confirm all specified functionality works correctly
4. **Validate non-functional requirements** - Check performance, security, and usability requirements
5. **Test acceptance criteria** - Verify all acceptance criteria are met
6. **Gather stakeholder feedback** - Get validation from business stakeholders
7. **Document validation results** - Create comprehensive validation report

## Inputs
- Original requirements document and user stories
- Acceptance criteria and success metrics
- Completed implementation
- Test execution results
- User feedback and stakeholder input

## Outputs
- Requirements validation matrix
- Acceptance criteria verification report
- Gap analysis for any missing functionality
- Stakeholder sign-off documentation
- Recommendations for any improvements needed
- Final validation summary and approval status

## Success Criteria
- All functional requirements verified as implemented
- Non-functional requirements met within acceptable ranges
- Acceptance criteria fully satisfied
- Stakeholder approval obtained
- Any gaps or issues clearly documented
- Clear approval or recommendations for next steps

## Skip Conditions
- Requirements were very simple and obviously met
- Implementation is partial or incomplete
- Stakeholders not available for validation
- Emergency deployment where formal validation is deferred

## Validation Categories

### Functional Requirement Validation
- **Feature Completeness**: All specified features implemented
- **Business Logic**: Rules and workflows work as specified
- **User Interface**: UI meets design and usability requirements
- **Data Processing**: Input/output handling meets specifications
- **Integration**: External connections work as required

### Non-Functional Requirement Validation
- **Performance**: Response times and throughput meet targets
- **Security**: Authentication, authorization, and data protection adequate
- **Usability**: User experience meets expectations
- **Reliability**: System stability and error handling appropriate
- **Scalability**: System can handle expected load and growth

### Acceptance Criteria Validation
- **Definition of Done**: All completion criteria satisfied
- **User Stories**: Each story's acceptance criteria met
- **Business Value**: Solution delivers expected business benefits
- **Quality Standards**: Code quality and maintainability acceptable
- **Deployment Readiness**: Solution ready for production use

### Compliance Validation
- **Regulatory Requirements**: Industry or legal compliance met
- **Company Standards**: Internal policies and standards followed
- **Architecture Guidelines**: Design principles and patterns followed
- **Security Policies**: Security requirements and best practices implemented
- **Documentation Standards**: Required documentation complete

## Validation Techniques

### Requirement Traceability
- Map each requirement to implementation components
- Verify all requirements have been addressed
- Identify any missing or incomplete implementations
- Document any requirement changes or scope adjustments

### Acceptance Testing
- Execute user acceptance test scenarios
- Validate with actual business stakeholders
- Test real-world usage patterns
- Verify business value delivery

### Gap Analysis
- Compare requirements vs actual implementation
- Identify any functionality gaps
- Assess impact of missing features
- Recommend priority for addressing gaps

### Stakeholder Review
- Present implementation to business stakeholders
- Gather feedback on functionality and usability
- Validate against original business needs
- Obtain formal sign-off or approval

## Validation Matrix Template

| Requirement ID | Description | Implementation Status | Test Status | Stakeholder Approval | Notes |
|---|---|---|---|---|---|
| REQ-001 | User login functionality | Complete | Passed | Approved | |
| REQ-002 | Data export feature | Complete | Passed | Pending | Minor UI feedback |
| REQ-003 | Performance <2sec | Partial | Failed | Not tested | Needs optimization |

## Common Validation Scenarios

### Feature Validation
- Test each feature against its specification
- Verify edge cases and error handling
- Validate user workflows and interactions
- Check data integrity and accuracy

### Performance Validation
- Measure actual performance against requirements
- Test under realistic load conditions
- Validate scalability characteristics
- Check resource usage and efficiency

### Security Validation
- Verify authentication and authorization work correctly
- Test data protection and privacy measures
- Validate input sanitization and security controls
- Check for common security vulnerabilities

### Usability Validation
- Test with actual users or stakeholders
- Validate user interface design and interaction
- Check accessibility and responsive design
- Gather feedback on user experience

## Documentation Requirements

### Validation Report Structure
- **Executive Summary**: Overall validation status and key findings
- **Requirement Analysis**: Detailed requirement-by-requirement validation
- **Gap Analysis**: Any missing or incomplete functionality
- **Test Results Summary**: Reference to detailed test results
- **Stakeholder Feedback**: Input from business users and stakeholders
- **Recommendations**: Next steps and improvement suggestions
- **Sign-off**: Formal approval or conditions for approval

### Evidence Documentation
- Screenshots of implemented features
- Test execution results and reports
- Performance measurement data
- User feedback and comments
- Stakeholder approval communications

## Validation Criteria

### Must-Have Requirements
- Critical business functionality implemented
- Core user workflows working correctly
- Essential integrations functional
- Security requirements met
- Data integrity maintained

### Should-Have Requirements
- Important but non-critical features
- Performance targets met
- Usability requirements satisfied
- Documentation complete
- Monitoring and alerting in place

### Could-Have Requirements
- Nice-to-have features
- Advanced functionality
- Optimization improvements
- Enhanced user experience
- Additional integrations

## Common Validation Issues
- Requirements implemented differently than expected
- Performance not meeting specified targets
- User interface not matching design expectations
- Integration issues with external systems
- Security or compliance gaps
- Missing error handling or edge cases

## Notes
- Involve actual stakeholders in validation process
- Don't assume requirements are met without explicit validation
- Document any requirement changes or clarifications discovered
- Balance perfectionism with practical acceptance criteria
- Get formal sign-off before considering validation complete
- Plan for iterative improvement based on validation feedback 