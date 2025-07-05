# Step • Platform Migration

## Purpose
Migrate applications and systems between different technology platforms, frameworks, or programming languages while preserving functionality and improving capabilities.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard development tools)

**Required Context**:
- Current platform/technology stack
- Target platform and technology requirements

**Optional Context**:
- Migration timeline and constraints
- Performance and scalability requirements
- Team skill sets and training needs
- Integration requirements with existing systems

## Validation Logic
```javascript
canExecute() {
  return hasContext('current_platform') &&
         hasContext('target_platform') &&
         hasDevelopmentAccess() &&
         requiresPlatformMigration();
}

requiresPlatformMigration() {
  return hasTechnologyChanges() ||
         needsFrameworkUpgrade() ||
         needsLanguageMigration() ||
         hasArchitectureChanges() ||
         needsPlatformModernization();
}
```

## Process
1. **Assess current platform** - Analyze existing technology stack, architecture, and dependencies
2. **Design target architecture** - Plan new platform architecture and technology choices
3. **Create migration strategy** - Develop phased approach for platform migration
4. **Set up development environment** - Prepare development tools and infrastructure
5. **Migrate core components** - Transfer business logic and core functionality
6. **Migrate data and integrations** - Update data access and external integrations
7. **Test and validate** - Ensure functionality and performance in new platform
8. **Deploy and transition** - Deploy to production and complete platform transition

## Inputs
- Current application architecture and codebase
- Technology stack assessment and dependencies
- Target platform requirements and specifications
- Business requirements and functional specifications
- Performance and scalability requirements

## Outputs
- Application successfully migrated to target platform
- All functionality preserved and validated
- Performance requirements met or exceeded
- New platform architecture documentation
- Migration guide and lessons learned
- Team training completed for new platform

## Success Criteria
- All business functionality works correctly on new platform
- Performance meets or exceeds current benchmarks
- Data integrity maintained throughout migration
- Integration points function correctly
- Team proficient with new platform technologies
- Migration completed within timeline and budget
- Legacy platform safely decommissioned

## Skip Conditions
- Application already on target platform
- Current platform meets all requirements
- Migration handled by dedicated modernization team
- Business case doesn't justify migration effort

## Migration Types

### Language Migration
- **Java to C#**: Enterprise application migrations
- **PHP to Node.js**: Web application modernization
- **Python 2 to Python 3**: Version upgrade migrations
- **Legacy to modern languages**: COBOL to Java, VB.NET to C#
- **Scripting language changes**: Perl to Python, shell to PowerShell

### Framework Migration
- **Web framework changes**: Angular to React, Spring to Express
- **ORM migrations**: Hibernate to JPA, ActiveRecord to Prisma
- **Testing framework changes**: JUnit to TestNG, Mocha to Jest
- **Build tool migrations**: Maven to Gradle, Webpack to Vite
- **Dependency injection**: Spring to Guice, Unity to Autofac

### Platform Migration
- **Operating system changes**: Windows to Linux, on-premises to cloud
- **Database platform changes**: Oracle to PostgreSQL, SQL Server to MySQL
- **Application server changes**: Tomcat to JBoss, IIS to Apache
- **Cloud platform changes**: AWS to Azure, on-premises to cloud
- **Container platform changes**: Docker to Podman, Docker Swarm to Kubernetes

### Architecture Migration
- **Monolith to microservices**: Breaking up monolithic applications
- **Three-tier to microservices**: Modernizing traditional architectures
- **SOA to REST APIs**: Service architecture modernization
- **Synchronous to asynchronous**: Event-driven architecture adoption
- **Traditional to serverless**: Function-as-a-Service migration

## Platform Assessment

### Current State Analysis
- **Technology inventory**: Catalog all technologies, frameworks, and tools
- **Architecture documentation**: Document current system architecture
- **Dependency analysis**: Map dependencies between components
- **Performance baseline**: Establish current performance metrics
- **Technical debt assessment**: Identify areas needing improvement

### Target Platform Evaluation
- **Technology comparison**: Compare current vs target technologies
- **Capability analysis**: Assess new platform capabilities and limitations
- **Compatibility assessment**: Evaluate integration compatibility
- **Learning curve**: Assess team learning requirements
- **Ecosystem evaluation**: Review available tools and community support

### Risk Assessment
- **Technical risks**: Identify potential technical challenges
- **Business risks**: Assess impact on business operations
- **Resource risks**: Evaluate team capacity and skills
- **Timeline risks**: Identify schedule and deadline risks
- **Integration risks**: Assess third-party integration challenges

## Migration Strategies

### Big Bang Migration
- **Complete replacement**: Replace entire system at once
- **Higher risk**: Significant risk if migration fails
- **Faster timeline**: Shorter overall migration period
- **Resource intensive**: Requires significant upfront effort
- **Clear cutover**: Definitive transition point

### Phased Migration
- **Incremental approach**: Migrate system in phases
- **Lower risk**: Reduced risk through gradual transition
- **Longer timeline**: Extended migration period
- **Parallel systems**: Run old and new systems simultaneously
- **Gradual learning**: Team learns new platform incrementally

### Strangler Fig Pattern
- **Gradual replacement**: Gradually replace old functionality
- **Feature-by-feature**: Migrate individual features independently
- **Continuous operation**: System remains operational throughout
- **Evolutionary approach**: Organic growth of new platform
- **Low disruption**: Minimal impact on users

### Parallel Run
- **Dual systems**: Run both old and new systems simultaneously
- **Result comparison**: Compare outputs for validation
- **Risk mitigation**: Fallback to old system if needed
- **Resource intensive**: Requires running both systems
- **High confidence**: Thorough validation before cutover

## Technology-Specific Considerations

### Programming Language Migration
- **Syntax differences**: Handle language syntax variations
- **Library migration**: Find equivalent libraries and frameworks
- **Performance characteristics**: Understand performance differences
- **Memory management**: Handle different memory models
- **Concurrency models**: Adapt to different threading models

### Database Migration
- **Schema differences**: Handle database schema variations
- **Query syntax**: Adapt SQL queries for target database
- **Data type mapping**: Map data types between databases
- **Performance optimization**: Optimize for target database features
- **Stored procedure migration**: Convert database procedures

### Framework Migration
- **Architectural patterns**: Adapt to framework architectural patterns
- **Configuration changes**: Update configuration approaches
- **API differences**: Handle framework API variations
- **Plugin ecosystem**: Migrate to new framework plugins
- **Testing approaches**: Adapt testing strategies for new framework

### Cloud Platform Migration
- **Service mapping**: Map services between cloud providers
- **API differences**: Handle cloud provider API variations
- **Deployment models**: Adapt deployment approaches
- **Monitoring tools**: Migrate to new monitoring solutions
- **Cost models**: Understand new pricing structures

## Code Migration Approaches

### Automated Migration
- **Code generators**: Use tools to generate equivalent code
- **Syntax converters**: Automatically convert syntax differences
- **Dependency analyzers**: Identify and map dependencies
- **Testing automation**: Automated test case generation
- **Validation tools**: Automatically validate migration results

### Manual Migration
- **Code rewriting**: Manually rewrite code for new platform
- **Architecture redesign**: Redesign for new platform patterns
- **Optimization opportunities**: Improve code during migration
- **Best practices adoption**: Implement platform best practices
- **Quality improvements**: Address technical debt during migration

### Hybrid Approach
- **Tool-assisted migration**: Use tools where possible, manual where needed
- **Critical path focus**: Manual attention for critical components
- **Quality checkpoints**: Manual review of automated migrations
- **Incremental refinement**: Iterative improvement of migration
- **Risk-based approach**: Higher attention for higher-risk components

## Testing and Validation

### Functional Testing
- **Feature parity**: Ensure all features work identically
- **User acceptance testing**: Validate user experience
- **Integration testing**: Test all integration points
- **Regression testing**: Ensure no functionality is lost
- **Edge case testing**: Test boundary conditions and edge cases

### Performance Testing
- **Baseline comparison**: Compare performance with original system
- **Load testing**: Test under expected production load
- **Stress testing**: Test beyond normal operating conditions
- **Scalability testing**: Validate scaling characteristics
- **Resource utilization**: Monitor CPU, memory, and I/O usage

### Compatibility Testing
- **Browser compatibility**: Test web applications across browsers
- **Operating system compatibility**: Test across target OS versions
- **Integration compatibility**: Test with external systems
- **Data format compatibility**: Verify data format handling
- **Version compatibility**: Test with different platform versions

## Data Migration Considerations

### Data Format Changes
- **Schema evolution**: Adapt data schema for new platform
- **Data type mapping**: Map data types appropriately
- **Encoding changes**: Handle character encoding differences
- **Serialization changes**: Update data serialization formats
- **Validation rules**: Implement data validation for new platform

### Data Synchronization
- **Cutover strategies**: Plan data cutover approaches
- **Synchronization tools**: Use appropriate data sync tools
- **Incremental updates**: Handle ongoing data changes
- **Conflict resolution**: Resolve data conflicts during migration
- **Rollback procedures**: Plan data rollback if needed

### Data Integrity
- **Validation procedures**: Implement comprehensive data validation
- **Checksums**: Use checksums to verify data integrity
- **Audit trails**: Maintain audit trails during migration
- **Backup strategies**: Comprehensive backup before migration
- **Recovery procedures**: Plan for data recovery scenarios

## Team Preparation

### Skill Development
- **Training programs**: Provide comprehensive platform training
- **Certification**: Pursue relevant platform certifications
- **Mentoring**: Pair experienced developers with learning team members
- **Documentation**: Create platform-specific documentation
- **Best practices**: Establish coding standards for new platform

### Knowledge Transfer
- **Architecture sessions**: Share new platform architecture knowledge
- **Code reviews**: Implement thorough code review processes
- **Pair programming**: Use pair programming for knowledge sharing
- **Brown bag sessions**: Regular informal learning sessions
- **External training**: Engage external trainers and consultants

### Change Management
- **Communication plan**: Keep team informed throughout migration
- **Feedback channels**: Establish channels for team feedback
- **Support resources**: Provide adequate support during transition
- **Success metrics**: Define and track migration success metrics
- **Recognition**: Recognize team achievements during migration

## Risk Mitigation

### Technical Risks
- **Proof of concepts**: Build POCs for risky technical areas
- **Spike solutions**: Investigate complex technical challenges
- **Fallback plans**: Prepare technical fallback options
- **Expert consultation**: Engage platform experts as needed
- **Regular assessments**: Continuously assess technical progress

### Business Risks
- **Business continuity**: Ensure business operations continue
- **User communication**: Keep users informed of changes
- **Training support**: Provide user training for changes
- **Rollback procedures**: Prepare business rollback procedures
- **Success metrics**: Track business impact metrics

### Project Risks
- **Timeline management**: Monitor and manage project timeline
- **Resource allocation**: Ensure adequate resources available
- **Scope management**: Control scope creep during migration
- **Quality gates**: Implement quality checkpoints
- **Risk monitoring**: Continuously monitor and assess risks

## Post-Migration Activities

### Performance Optimization
- **Performance tuning**: Optimize for new platform characteristics
- **Monitoring setup**: Implement comprehensive monitoring
- **Capacity planning**: Plan for future capacity needs
- **Cost optimization**: Optimize costs for new platform
- **Scalability testing**: Validate scaling approaches

### Knowledge Consolidation
- **Documentation updates**: Update all technical documentation
- **Lessons learned**: Document migration lessons learned
- **Best practices**: Establish new platform best practices
- **Training materials**: Create ongoing training materials
- **Support procedures**: Update support and maintenance procedures

### Legacy Cleanup
- **Legacy system shutdown**: Safely decommission old systems
- **Data archival**: Archive historical data appropriately
- **License cleanup**: Cancel unnecessary software licenses
- **Infrastructure cleanup**: Decommission old infrastructure
- **Documentation cleanup**: Remove outdated documentation

## Notes
- Plan migration carefully with thorough analysis and preparation
- Invest in team training and skill development early
- Implement comprehensive testing at every stage
- Maintain business continuity throughout migration process
- Document all decisions and lessons learned for future reference
- Consider using migration tools and experts for complex migrations 