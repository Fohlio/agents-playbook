# Feature Analysis

## Goal
Analyze existing feature functionality, architecture, and implementation to understand current state and identify opportunities for improvement or modification.

**📁 Document Location**: Create feature analysis reports in `docs/planning/` directory.

## Context Required
- Feature scope and boundaries definition
- Access to relevant codebase

## Context Gathering
If you don't have the required context, gather it by:
- **Feature scope**: Ask user which specific feature or functionality to analyze
- **Codebase access**: Use file system tools to locate feature-related code
- **Feature boundaries**: Identify what components/modules are part of the feature
- **Analysis goals**: Understand if focusing on performance, architecture, user experience, or technical debt

## Skip When
- Feature is very simple with obvious implementation
- Analysis was completed in previous session
- Feature doesn't exist yet (new feature development)
- Analysis scope is limited to bug fix only

## Complexity Assessment
- **Task Complexity**: High - requires deep feature analysis and architecture understanding

## Analysis Dimensions

### Functional Analysis
- **Core Functionality** - what the feature does and key use cases
- **User Flows** - how users interact with the feature
- **Business Logic** - rules, validation, and processing logic
- **Data Flow** - inputs, transformations, and outputs
- **Integration Points** - how it connects with other system components

### Technical Analysis
- **Architecture** - component structure and design patterns
- **Implementation Quality** - code organization, patterns, and practices
- **Performance** - speed, efficiency, and resource usage
- **Security** - authentication, authorization, and data protection
- **Error Handling** - exception management and edge case handling

### User Experience Analysis
- **Usability** - ease of use and user interface design
- **Accessibility** - compliance with accessibility standards
- **Performance Perception** - loading times and responsiveness
- **Error Messages** - clarity and helpfulness of error communication

## Analysis Process
1. **Map Feature Scope** - identify all components and touchpoints
2. **Document Current State** - how the feature works today
3. **Identify Patterns** - architectural and implementation patterns used
4. **Assess Quality** - evaluate performance, security, and maintainability
5. **Find Opportunities** - areas for improvement or optimization

## Key Deliverables
- **Feature Overview** - comprehensive description of current functionality
- **Architecture Diagram** - visual representation of feature components
- **Quality Assessment** - strengths, weaknesses, and improvement areas
- **Technical Debt** - specific issues and recommendations
- **Enhancement Opportunities** - potential improvements and their impact

## Analysis Tools
- Code exploration and documentation tools
- Performance monitoring and profiling
- Security scanning and vulnerability assessment
- User experience testing and analytics
- Architecture visualization tools

## Success Criteria
- Complete understanding of feature scope and implementation
- Clear documentation of current architecture and data flows
- Identified opportunities for improvement with priority and effort estimates
- Actionable recommendations aligned with business and technical goals