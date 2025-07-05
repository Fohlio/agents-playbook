# Platform Migration

## Goal
Migrate applications between different technology platforms, frameworks, or programming languages while preserving functionality.

## Context Required
- Current platform/technology stack
- Target platform and technology requirements
- Migration timeline and constraints

## Skip When
- Application already on target platform
- Current platform meets all requirements
- Migration handled by dedicated team
- Business case doesn't justify migration effort

## Complexity Assessment
- **Task Complexity**: Very High - requires deep platform knowledge and complex migration coordination

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Migration Types

### Language Migration
- Java ↔ C#, PHP → Node.js, Python 2 → 3
- Legacy → Modern: COBOL → Java, VB.NET → C#

### Framework Migration
- Web: Angular → React, Spring → Express
- ORM: Hibernate → JPA, ActiveRecord → Prisma
- Testing: JUnit → TestNG, Mocha → Jest

### Platform Migration
- OS: Windows → Linux, on-premises → cloud
- Database: Oracle → PostgreSQL, SQL Server → MySQL
- Cloud: AWS → Azure, on-premises → cloud

### Architecture Migration
- Monolith → microservices
- Three-tier → microservices
- SOA → REST APIs
- Synchronous → asynchronous
- Traditional → serverless

## Migration Strategies

### Big Bang Migration
- Replace entire system at once
- Higher risk, faster timeline
- Resource intensive, clear cutover

### Phased Migration
- Incremental approach, migrate in phases
- Lower risk, longer timeline
- Parallel systems, gradual learning

### Strangler Fig Pattern
- Gradually replace old functionality
- Feature-by-feature migration
- Continuous operation, low disruption

### Parallel Run
- Run both systems simultaneously
- Compare outputs for validation
- High confidence, resource intensive

## Assessment Areas

### Current State Analysis
- Technology inventory and dependencies
- Architecture documentation
- Performance baseline
- Technical debt assessment

### Target Platform Evaluation
- Technology comparison and capabilities
- Compatibility assessment
- Learning curve and team requirements
- Ecosystem and community support

### Risk Assessment
- Technical, business, resource risks
- Timeline and integration challenges
- Mitigation strategies

## Key Migration Tasks

### Code Migration
- **Automated**: code generators, syntax converters, dependency analyzers
- **Manual**: careful rewriting, logic preservation, testing

### Data Migration
- Schema mapping and data type conversion
- Query syntax adaptation
- Stored procedure migration
- Data validation and integrity

### Integration Migration
- API endpoint updates
- Authentication/authorization changes
- Third-party service adaptations
- Monitoring and logging setup

### Testing & Validation
- Functional testing on new platform
- Performance benchmarking
- Integration testing
- User acceptance testing

## Success Criteria
- All business functionality works correctly
- Performance meets or exceeds benchmarks
- Data integrity maintained
- Integration points function correctly
- Team proficient with new platform
- Migration completed within timeline

## Key Outputs
- Application successfully migrated to target platform
- All functionality preserved and validated
- New platform architecture documentation
- Migration guide and lessons learned
- Team training completed 