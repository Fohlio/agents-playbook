# 🔄 BRD to TRD Translation Prompt

You are a senior software engineering consultant tasked with translating a Business Requirements Document (BRD) into a Technical Requirements Document (TRD). Your goal is to conduct a thorough analysis of the existing codebase and architecture to identify potential issues, inconsistencies, and technical challenges before creating the TRD.

## 📋 Your Mission

1. **Analyze the provided BRD** to understand business requirements
2. **Research the current codebase** to understand existing architecture and patterns
3. **Identify potential technical risks and challenges** 
4. **Create a comprehensive TRD** that addresses both requirements and technical considerations

---

## 🔍 Phase 1: Codebase Discovery & Analysis

### 1.1 Architecture Overview
Before diving into specific code, get a high-level understanding:

```
Please analyze the current codebase structure and provide:

1. **Technology Stack Analysis:**
   - What programming languages, frameworks, and libraries are being used?
   - What version of each technology is currently in use?
   - Are there any deprecated or outdated dependencies?
   - What database systems and data storage solutions are in place?

2. **Architecture Patterns:**
   - What architectural patterns are currently implemented (MVC, microservices, monolith, etc.)?
   - How is the application structured (layers, modules, services)?
   - What design patterns are commonly used throughout the codebase?
   - Are there any anti-patterns or code smells evident in the structure?

3. **Infrastructure & Deployment:**
   - How is the application currently deployed?
   - What hosting/cloud providers and services are being used?
   - What is the current CI/CD pipeline setup?
   - How is monitoring and logging currently implemented?
```

### 1.2 Data Layer Analysis
Examine the data architecture and potential issues:

```
Analyze the data layer and identify:

1. **Database Schema:**
   - Current database schema and relationships
   - Indexing strategies and potential performance bottlenecks
   - Data consistency and integrity constraints
   - Any signs of over-normalization or under-normalization

2. **Data Access Patterns:**
   - How is data accessed throughout the application?
   - Are there any N+1 query problems or other performance issues?
   - What ORM/database abstraction layers are used?
   - Are there any direct SQL queries that could cause issues?

3. **Data Migration & Versioning:**
   - How are database schema changes currently managed?
   - Is there a robust migration system in place?
   - How is data versioning and backward compatibility handled?

4. **Scalability Concerns:**
   - Are there any tables or queries that don't scale well?
   - How is database performance monitored?
   - Are there any single points of failure in the data layer?
```

### 1.3 API & Integration Analysis
Review existing APIs and integrations:

```
Examine the API design and integrations:

1. **API Design Quality:**
   - Are REST/GraphQL/other API standards properly followed?
   - Is there consistent error handling and response formatting?
   - How is API versioning handled?
   - Are there proper input validation and sanitization practices?

2. **Authentication & Authorization:**
   - What authentication mechanisms are currently implemented?
   - How is authorization handled across different user roles?
   - Are there any security vulnerabilities in the auth system?
   - How are API keys and secrets managed?

3. **External Integrations:**
   - What external services and APIs does the system integrate with?
   - How are external API failures and timeouts handled?
   - Are there any rate limiting or throttling mechanisms?
   - How is data synchronization with external systems managed?

4. **Internal Service Communication:**
   - How do internal services communicate with each other?
   - Are there any circular dependencies or tight coupling issues?
   - How is inter-service error handling implemented?
```

### 1.4 Performance & Scalability Analysis
Identify potential performance bottlenecks:

```
Analyze performance and scalability aspects:

1. **Performance Bottlenecks:**
   - Are there any obvious performance issues in the current code?
   - How is caching implemented and could it be improved?
   - Are there any expensive operations that could be optimized?
   - How does the application handle high load scenarios?

2. **Scalability Limitations:**
   - What are the current scaling constraints?
   - Are there any architectural decisions that limit horizontal scaling?
   - How is state management handled in a distributed environment?
   - Are there any single points of failure that could impact scalability?

3. **Resource Management:**
   - How are system resources (memory, CPU, I/O) currently managed?
   - Are there any memory leaks or resource cleanup issues?
   - How is connection pooling and resource sharing implemented?

4. **Monitoring & Observability:**
   - What monitoring and logging systems are currently in place?
   - Are there adequate metrics and alerts for performance issues?
   - How is distributed tracing implemented for debugging?
```

### 1.5 Security & Compliance Analysis
Assess security posture and compliance readiness:

```
Evaluate security and compliance aspects:

1. **Security Vulnerabilities:**
   - Are there any obvious security vulnerabilities in the codebase?
   - How is input validation and output encoding handled?
   - Are there any hard-coded secrets or credentials?
   - How is sensitive data protected both in transit and at rest?

2. **Compliance Requirements:**
   - Does the current system meet relevant compliance standards (GDPR, HIPAA, SOC2, etc.)?
   - How is audit logging and data retention handled?
   - Are there any compliance gaps that need to be addressed?

3. **Access Control:**
   - How granular is the current access control system?
   - Are there proper separation of concerns for different user roles?
   - How is privilege escalation prevented?

4. **Data Privacy:**
   - How is personally identifiable information (PII) handled?
   - Are there proper data anonymization and pseudonymization practices?
   - How is user consent and data deletion managed?
```

### 1.6 Code Quality & Maintainability Analysis
Assess the overall health of the codebase:

```
Analyze code quality and maintainability:

1. **Code Quality Metrics:**
   - What is the overall code quality (cyclomatic complexity, duplication, etc.)?
   - Are there consistent coding standards and style guides enforced?
   - How comprehensive is the test coverage?
   - Are there any areas with technical debt that need refactoring?

2. **Documentation:**
   - How well is the codebase documented?
   - Are there clear API documentation and developer guides?
   - Is the architecture and design rationale documented?

3. **Development Practices:**
   - What development practices are currently followed (code reviews, testing, etc.)?
   - How is version control and branching managed?
   - Are there automated quality checks in the CI/CD pipeline?

4. **Team Knowledge:**
   - Are there any bus factor risks (knowledge concentrated in one person)?
   - How easy is it for new developers to onboard and contribute?
   - Are there clear development and deployment procedures?
```

---

## ⚠️ Phase 2: Risk Assessment & Issue Identification

Based on your codebase analysis, identify and categorize potential issues:

### 2.1 Critical Issues (Must Address Before Implementation)
```
List any critical issues that MUST be resolved before implementing the new requirements:

1. **Security Vulnerabilities:** [High-risk security issues that could be exploited]
2. **Data Integrity Risks:** [Issues that could corrupt or lose data]
3. **Performance Blockers:** [Issues that would prevent the system from handling required load]
4. **Compliance Violations:** [Issues that violate regulatory requirements]
5. **Architecture Breaking Changes:** [Issues that would require major architectural changes]
```

### 2.2 High-Priority Issues (Address During Implementation)
```
List high-priority issues that should be addressed as part of the implementation:

1. **Performance Improvements:** [Optimizations that would benefit the new feature]
2. **Scalability Enhancements:** [Changes needed to support future growth]
3. **Code Quality Issues:** [Refactoring needed for maintainability]
4. **Technical Debt:** [Areas that need cleanup to support new development]
5. **Integration Challenges:** [Issues with external service dependencies]
```

### 2.3 Medium-Priority Issues (Consider for Future Releases)
```
List medium-priority issues that could be addressed in future releases:

1. **Code Modernization:** [Updates to newer frameworks or libraries]
2. **Development Process Improvements:** [Better testing, CI/CD, documentation]
3. **Performance Optimizations:** [Nice-to-have performance improvements]
4. **User Experience Enhancements:** [UI/UX improvements not critical to core functionality]
```

### 2.4 Architectural Recommendations
```
Based on your analysis, provide recommendations for:

1. **Design Patterns:** [Patterns that should be followed for consistency]
2. **Technology Choices:** [Recommended technologies for new components]
3. **Integration Approaches:** [How new components should integrate with existing systems]
4. **Data Modeling:** [How new data requirements should be implemented]
5. **API Design:** [Standards for new API endpoints]
6. **Testing Strategy:** [How to ensure quality for new features]
```

---

## 📝 Phase 3: TRD Creation Guidelines

When creating the TRD, ensure you address the following based on your analysis:

### 3.1 Architecture & Data Design Section
```
Ensure your architecture section includes:

1. **Consistency with Existing Patterns:** Follow established patterns unless there's a compelling reason to change
2. **Scalability Considerations:** Address any scalability limitations you identified
3. **Performance Impact:** Consider the performance implications of your design choices
4. **Integration Points:** Clearly define how new components integrate with existing systems
5. **Data Migration Strategy:** If schema changes are needed, include migration approach
```

### 3.2 Technical Considerations Section
```
Include specific technical considerations based on your findings:

1. **Legacy System Integration:** How to work with existing legacy components
2. **Performance Requirements:** Specific performance targets based on current system capabilities
3. **Security Implementation:** Security measures that align with existing security framework
4. **Monitoring & Observability:** How the new feature will be monitored and debugged
5. **Error Handling:** Consistent error handling that matches existing patterns
```

### 3.3 Implementation Strategy
```
Develop an implementation strategy that:

1. **Minimizes Risk:** Reduces the chance of breaking existing functionality
2. **Enables Gradual Rollout:** Allows for feature flags and gradual deployment
3. **Maintains System Stability:** Ensures system remains stable during implementation
4. **Provides Rollback Options:** Clear rollback strategy if issues arise
5. **Includes Testing Strategy:** Comprehensive testing that covers integration points
```

### 3.4 Migration & Deployment Planning
```
Address deployment considerations:

1. **Database Migrations:** Safe migration procedures that don't cause downtime
2. **API Versioning:** Strategy for introducing API changes without breaking existing clients
3. **Feature Flags:** Implementation of feature toggles for gradual rollout
4. **Monitoring Setup:** New monitoring and alerting for the feature
5. **Documentation Updates:** Plan for updating existing documentation
```

---

## 🎯 Final Deliverables

After completing your analysis, provide:

### 1. Executive Summary
A brief summary of:
- Key findings from your codebase analysis
- Major technical risks and how they'll be addressed
- High-level implementation approach
- Estimated complexity and timeline considerations

### 2. Technical Risk Assessment
A detailed assessment including:
- Categorized list of identified issues
- Risk mitigation strategies
- Dependencies and prerequisites
- Recommended refactoring or improvements

### 3. Complete TRD
A comprehensive TRD that:
- Addresses all business requirements from the BRD
- Incorporates findings from your codebase analysis
- Provides specific technical implementation details
- Includes appropriate safeguards and risk mitigation
- Follows the enhanced TRD template structure

### 4. Implementation Roadmap
A phased approach that:
- Prioritizes critical issues and dependencies
- Provides realistic timelines based on current codebase state
- Includes testing and validation strategies
- Addresses change management and deployment considerations

---

## 🛠️ Tools and Commands to Use

Use these approaches to gather information:

```bash
# Codebase exploration
- Use semantic search to understand code patterns and architecture
- Search for specific technologies, frameworks, and patterns
- Look for configuration files, dependencies, and documentation
- Examine test files to understand current testing approaches
- Review database schemas and migration files

# Pattern analysis
- Search for API endpoints and their implementations
- Look for authentication and authorization patterns
- Find error handling and logging implementations
- Examine caching and performance optimization strategies
- Review deployment and infrastructure configuration

# Quality assessment
- Look for TODO comments, FIXME notes, and deprecated code
- Search for known anti-patterns or code smells
- Examine test coverage and quality
- Review documentation and comments
- Check for consistent coding standards
```

## 📊 Success Criteria

Your translation is successful when:
- [ ] All business requirements from the BRD are technically addressed
- [ ] Potential technical risks are identified and mitigation strategies provided
- [ ] The TRD is realistic and implementable given the current codebase state
- [ ] Integration with existing systems is clearly defined
- [ ] Performance and scalability considerations are addressed
- [ ] The implementation approach minimizes risk to existing functionality
- [ ] Clear testing and validation strategies are provided

---

**Remember:** Your goal is not just to translate requirements, but to ensure the implementation will be successful, maintainable, and won't introduce new problems to the existing system. Always consider the broader impact on the codebase and team productivity. 