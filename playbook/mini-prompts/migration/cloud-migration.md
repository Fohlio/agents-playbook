# Cloud Migration

## Goal
Migrate applications, data, and infrastructure from on-premises or other cloud environments to target cloud platforms ensuring security, performance, and cost optimization.

## Context Required
- Current infrastructure and application architecture
- Target cloud platform and requirements
- Migration timeline and constraints
- Security and compliance requirements

## Skip When
- Applications already running in target cloud platform
- Migration handled by dedicated cloud migration team
- Using cloud-native applications that don't require migration
- Current infrastructure already meets all requirements

## Complexity Assessment
- **Task Complexity**: Very High - requires cloud expertise and complex infrastructure coordination

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Migration Strategies

### Lift and Shift (Rehost)
- Move VMs as-is to cloud
- Minimal changes, quick migration
- Limited cloud optimization

### Platform as a Service (Replatform)
- Use cloud-managed databases and services
- Minor modifications to leverage cloud features
- Reduced management, improved scalability

### Refactor/Re-architect
- Redesign for cloud-native architectures
- Microservices, serverless, containers
- Maximum cloud optimization

### Rebuild
- Complete rewrite using cloud technologies
- Modern architecture, full optimization
- Highest effort, maximum benefit

## Cloud Platforms

### Amazon Web Services (AWS)
- EC2 (VMs), RDS (databases), S3 (storage), Lambda (serverless), EKS (Kubernetes)

### Microsoft Azure
- Virtual Machines, SQL Database, Blob Storage, Functions, AKS

### Google Cloud Platform (GCP)
- Compute Engine, Cloud SQL, Cloud Storage, Cloud Functions, GKE

### Multi-Cloud
- Vendor diversification, best-of-breed services
- Disaster recovery, increased complexity

## Migration Phases

### Assessment
- Application inventory and dependencies
- Infrastructure audit and performance baseline
- Security requirements and cost analysis

### Planning
- Dependency mapping and risk assessment
- Pilot migrations with low-risk applications
- Wave planning and timeline coordination

### Execution
- Infrastructure migration (networking, security)
- Application and data migration
- Testing and validation
- Optimization and scaling

## Data Migration

### Methods
- **Online**: migrate while systems operational
- **Offline**: migrate during downtime
- **Hybrid**: combination approach
- **Incremental**: migrate in phases
- **Real-time**: continuous synchronization

### Validation
- Data integrity and consistency checks
- Performance and compliance verification
- Business logic validation
- Backup and recovery testing

## Security & Network

### Network Setup
- Virtual networks and subnets
- On-premises connectivity
- Load balancers and DNS migration
- CDN configuration

### Security Controls
- Identity and access management
- Network security groups and firewalls
- Data encryption (rest and transit)
- Key management and compliance

### Monitoring
- Application and infrastructure monitoring
- Security event monitoring
- Log aggregation and alerting

## Success Criteria
- All applications function correctly in cloud
- Data migration completed without loss
- Performance meets or exceeds requirements
- Security controls properly implemented
- Cost optimization achieved
- Minimal business disruption
- Team trained on cloud operations

## Key Outputs
- Applications and data successfully migrated
- Cloud infrastructure configured and optimized
- Security controls implemented and validated
- Performance requirements met
- Cost optimization strategies implemented
- Legacy infrastructure decommissioned 