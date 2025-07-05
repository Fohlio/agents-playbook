# Step • Cloud Migration

## Purpose
Migrate applications, data, and infrastructure from on-premises or other cloud environments to target cloud platforms while ensuring security, performance, and cost optimization.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard cloud tools)

**Required Context**:
- Current infrastructure and application architecture
- Target cloud platform and requirements

**Optional Context**:
- Migration timeline and constraints
- Security and compliance requirements
- Performance and availability requirements
- Budget constraints and cost optimization goals

## Validation Logic
```javascript
canExecute() {
  return hasContext('current_infrastructure') &&
         hasContext('target_cloud_platform') &&
         hasCloudAccess() &&
         requiresCloudMigration();
}

requiresCloudMigration() {
  return needsInfrastructureMigration() ||
         needsApplicationMigration() ||
         needsDataMigration() ||
         needsPlatformMigration() ||
         hasCloudNativeRequirements();
}
```

## Process
1. **Assess current state** - Inventory applications, data, and infrastructure components
2. **Plan migration strategy** - Choose migration approach and sequence
3. **Set up cloud environment** - Provision target cloud infrastructure and services
4. **Migrate infrastructure components** - Move networking, security, and foundational services
5. **Migrate applications and data** - Transfer applications, databases, and business data
6. **Test and validate** - Verify functionality, performance, and security in cloud
7. **Optimize and scale** - Optimize for cloud-native features and cost efficiency
8. **Decommission legacy** - Safely shutdown and cleanup old infrastructure

## Inputs
- Current infrastructure inventory and documentation
- Application architecture and dependencies
- Data assets and storage requirements
- Security and compliance requirements
- Migration timeline and business constraints

## Outputs
- Applications and data successfully migrated to cloud
- Cloud infrastructure configured and optimized
- Security controls implemented and validated
- Performance and availability requirements met
- Cost optimization strategies implemented
- Legacy infrastructure safely decommissioned

## Success Criteria
- All applications function correctly in cloud environment
- Data migration completed without loss or corruption
- Performance meets or exceeds current requirements
- Security controls properly implemented and tested
- Cost optimization achieved within budget targets
- Minimal business disruption during migration
- Team trained on cloud operations and management

## Skip Conditions
- Applications already running in target cloud platform
- Migration handled by dedicated cloud migration team
- Using cloud-native applications that don't require migration
- Current infrastructure already meets all requirements

## Migration Strategies

### Lift and Shift (Rehost)
- **VM migration**: Move virtual machines as-is to cloud
- **Minimal changes**: No application code changes required
- **Quick migration**: Fastest migration approach
- **Limited optimization**: Doesn't leverage cloud-native features

### Platform as a Service (Replatform)
- **Managed services**: Use cloud-managed databases and services
- **Minor modifications**: Small changes to leverage cloud features
- **Reduced management**: Less infrastructure to manage
- **Improved scalability**: Better auto-scaling and reliability

### Refactor/Re-architect
- **Cloud-native design**: Redesign for cloud-native architectures
- **Microservices**: Break monoliths into microservices
- **Serverless**: Use serverless functions where appropriate
- **Container orchestration**: Use Kubernetes or managed container services

### Rebuild
- **Complete rewrite**: Build new applications using cloud technologies
- **Modern architecture**: Use latest cloud-native patterns
- **Full optimization**: Maximum leverage of cloud capabilities
- **Highest effort**: Requires significant development time

## Cloud Platforms

### Amazon Web Services (AWS)
- **EC2**: Virtual machine hosting
- **RDS**: Managed database services
- **S3**: Object storage
- **Lambda**: Serverless functions
- **EKS**: Managed Kubernetes

### Microsoft Azure
- **Virtual Machines**: Compute instances
- **SQL Database**: Managed SQL Server
- **Blob Storage**: Object storage
- **Functions**: Serverless computing
- **AKS**: Managed Kubernetes

### Google Cloud Platform (GCP)
- **Compute Engine**: Virtual machines
- **Cloud SQL**: Managed databases
- **Cloud Storage**: Object storage
- **Cloud Functions**: Serverless functions
- **GKE**: Managed Kubernetes

### Multi-Cloud Strategy
- **Vendor diversification**: Avoid vendor lock-in
- **Best-of-breed services**: Use best services from each provider
- **Disaster recovery**: Cross-cloud backup and recovery
- **Complexity management**: Handle increased operational complexity

## Migration Planning

### Assessment Phase
- **Application inventory**: Catalog all applications and their dependencies
- **Infrastructure audit**: Document current infrastructure components
- **Performance baseline**: Establish current performance metrics
- **Security assessment**: Identify security requirements and controls
- **Cost analysis**: Understand current costs and cloud cost projections

### Migration Sequencing
- **Dependency mapping**: Understand application dependencies
- **Risk assessment**: Identify high-risk and low-risk applications
- **Pilot migrations**: Start with low-risk, non-critical applications
- **Wave planning**: Group applications for sequential migration waves
- **Critical path analysis**: Identify bottlenecks and critical dependencies

### Timeline Planning
- **Migration windows**: Plan maintenance windows for each migration
- **Rollback procedures**: Prepare rollback plans for each migration
- **Testing phases**: Schedule testing and validation activities
- **Go-live coordination**: Coordinate business stakeholder involvement
- **Support planning**: Plan for increased support during migration

## Data Migration

### Data Assessment
- **Data inventory**: Catalog all data assets and their locations
- **Data classification**: Classify data by sensitivity and importance
- **Data quality**: Assess data quality and cleanup requirements
- **Compliance requirements**: Identify regulatory data requirements
- **Data relationships**: Map data dependencies and relationships

### Migration Methods
- **Online migration**: Migrate data while systems remain operational
- **Offline migration**: Migrate during scheduled downtime
- **Hybrid migration**: Combination of online and offline methods
- **Incremental migration**: Migrate data in phases or batches
- **Real-time replication**: Continuous data synchronization

### Data Validation
- **Data integrity checks**: Verify data consistency after migration
- **Performance validation**: Ensure data access performance
- **Compliance verification**: Confirm regulatory compliance
- **Business validation**: Verify business logic still functions
- **Backup verification**: Ensure backup and recovery capabilities

## Network and Security Migration

### Network Architecture
- **Virtual networks**: Set up cloud virtual networks and subnets
- **Connectivity**: Establish connections to on-premises networks
- **Load balancing**: Configure load balancers and traffic distribution
- **DNS migration**: Migrate DNS records and resolution
- **CDN setup**: Configure content delivery networks

### Security Controls
- **Identity management**: Migrate user accounts and access controls
- **Network security**: Configure firewalls and security groups
- **Data encryption**: Implement encryption at rest and in transit
- **Key management**: Set up cloud key management services
- **Compliance controls**: Implement required compliance measures

### Monitoring and Logging
- **Application monitoring**: Set up application performance monitoring
- **Infrastructure monitoring**: Monitor cloud infrastructure health
- **Security monitoring**: Implement security event monitoring
- **Log aggregation**: Centralize log collection and analysis
- **Alerting**: Configure alerts for critical events and thresholds

## Application Migration

### Application Assessment
- **Architecture analysis**: Understand current application architecture
- **Dependency mapping**: Map application dependencies and integrations
- **Performance requirements**: Document performance and scalability needs
- **Security requirements**: Identify application security requirements
- **Compliance needs**: Understand regulatory compliance requirements

### Migration Approaches
- **Container migration**: Containerize applications for cloud deployment
- **API migration**: Update APIs and service integrations
- **Database migration**: Migrate application databases
- **Configuration migration**: Transfer application configurations
- **Integration migration**: Update third-party integrations

### Testing and Validation
- **Functional testing**: Verify all application features work correctly
- **Performance testing**: Validate performance under expected load
- **Security testing**: Test security controls and access management
- **Integration testing**: Verify all system integrations function
- **User acceptance testing**: Validate business user requirements

## Cost Optimization

### Cost Planning
- **Cost modeling**: Project cloud costs for different scenarios
- **Reserved instances**: Plan for reserved instance purchases
- **Spot instances**: Identify opportunities for spot instance usage
- **Auto-scaling**: Implement auto-scaling to optimize costs
- **Resource tagging**: Implement cost tracking and allocation

### Optimization Strategies
- **Right-sizing**: Size instances appropriately for workloads
- **Storage optimization**: Use appropriate storage tiers and lifecycle policies
- **Network optimization**: Optimize data transfer and bandwidth usage
- **Service optimization**: Use managed services to reduce operational costs
- **Monitoring and alerts**: Set up cost monitoring and budget alerts

## Risk Management

### Migration Risks
- **Data loss**: Risk of data corruption or loss during migration
- **Downtime**: Extended outages during migration activities
- **Performance degradation**: Reduced performance in cloud environment
- **Security vulnerabilities**: New security risks in cloud environment
- **Cost overruns**: Higher than expected cloud costs

### Risk Mitigation
- **Backup strategies**: Comprehensive backup before migration
- **Rollback plans**: Detailed rollback procedures for each migration
- **Pilot testing**: Test migrations with non-critical applications first
- **Performance monitoring**: Continuous monitoring during migration
- **Cost controls**: Implement cost monitoring and governance

## Post-Migration Activities

### Optimization
- **Performance tuning**: Optimize applications for cloud environment
- **Cost optimization**: Continuously optimize cloud costs
- **Security hardening**: Implement additional security measures
- **Automation**: Automate operational tasks and deployments
- **Scaling optimization**: Optimize auto-scaling configurations

### Operations
- **Monitoring setup**: Implement comprehensive monitoring
- **Backup configuration**: Set up cloud backup and disaster recovery
- **Patch management**: Implement cloud patch management processes
- **Access management**: Ongoing user access management
- **Compliance monitoring**: Continuous compliance monitoring

### Knowledge Transfer
- **Team training**: Train operations team on cloud technologies
- **Documentation**: Create operational documentation for cloud environment
- **Process updates**: Update operational processes for cloud
- **Best practices**: Establish cloud operational best practices
- **Continuous improvement**: Regular review and optimization

## Compliance and Governance

### Regulatory Compliance
- **Data residency**: Ensure data remains in required geographic regions
- **Privacy regulations**: Comply with GDPR, CCPA, and other privacy laws
- **Industry standards**: Meet industry-specific compliance requirements
- **Audit requirements**: Implement audit trails and reporting
- **Data retention**: Implement required data retention policies

### Cloud Governance
- **Resource governance**: Implement cloud resource governance policies
- **Cost governance**: Establish cost management and budgeting processes
- **Security governance**: Implement security policies and controls
- **Compliance monitoring**: Continuous compliance monitoring and reporting
- **Risk management**: Ongoing risk assessment and management

## Notes
- Plan migration carefully with detailed assessment and testing
- Start with low-risk applications to gain experience
- Implement comprehensive backup and rollback procedures
- Monitor costs continuously and optimize regularly
- Train team on cloud technologies and best practices
- Consider using cloud migration services and partners for complex migrations 