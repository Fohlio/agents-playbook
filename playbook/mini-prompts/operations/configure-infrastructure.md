# Step • Configure Infrastructure

## Purpose
Set up, configure, and manage infrastructure components including servers, networks, storage, and cloud resources for optimal performance and security.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard infrastructure tools)

**Required Context**:
- Infrastructure requirements and specifications
- Target environment (cloud, on-premise, hybrid)

**Optional Context**:
- Existing infrastructure setup
- Compliance and security requirements
- Performance and scalability requirements
- Budget and cost constraints

## Validation Logic
```javascript
canExecute() {
  return hasContext('infrastructure_requirements') &&
         hasContext('target_environment') &&
         hasInfrastructureAccess() &&
         requiresInfrastructureSetup();
}

requiresInfrastructureSetup() {
  return needsNewInfrastructure() ||
         needsInfrastructureChanges() ||
         needsConfigurationUpdates() ||
         needsOptimization();
}
```

## Process
1. **Analyze infrastructure requirements** - Review compute, storage, network, and security needs
2. **Design infrastructure architecture** - Plan component layout, networking, and integrations
3. **Provision infrastructure resources** - Create servers, networks, storage, and cloud resources
4. **Configure networking and security** - Set up firewalls, VPNs, load balancers, and access controls
5. **Install and configure software** - Set up operating systems, middleware, and required software
6. **Implement monitoring and logging** - Configure infrastructure monitoring and log collection
7. **Test infrastructure setup** - Validate functionality, performance, and security
8. **Document infrastructure configuration** - Create documentation and diagrams

## Inputs
- Infrastructure requirements and specifications
- Application architecture and dependencies
- Security and compliance requirements
- Performance and availability requirements
- Budget constraints and cost considerations

## Outputs
- Fully configured infrastructure environment
- Network architecture with proper security controls
- Configured servers with required software and settings
- Load balancing and high availability setup
- Monitoring and alerting infrastructure
- Infrastructure documentation and diagrams
- Configuration management setup

## Success Criteria
- All infrastructure components provisioned and configured correctly
- Network connectivity and security controls working as designed
- Performance meets requirements under expected load
- High availability and disaster recovery mechanisms in place
- Monitoring provides visibility into infrastructure health
- Configuration is documented and reproducible
- Security controls meet compliance requirements

## Skip Conditions
- Infrastructure already properly configured and operational
- Infrastructure managed by dedicated infrastructure team
- Using managed services that don't require manual configuration
- Only application-level changes needed

## Infrastructure Components

### Compute Resources
- **Virtual machines**: Configure CPU, memory, and storage specifications
- **Containers**: Set up container orchestration and resource limits
- **Serverless functions**: Configure function runtime and resource allocation
- **Auto-scaling**: Set up automatic scaling based on demand

### Storage Systems
- **Block storage**: Configure high-performance storage for databases
- **Object storage**: Set up scalable storage for files and backups
- **File systems**: Configure shared storage for application data
- **Backup storage**: Implement automated backup and retention policies

### Networking
- **Virtual networks**: Create isolated network segments
- **Subnets**: Configure network segmentation and routing
- **Load balancers**: Distribute traffic across multiple instances
- **CDN**: Configure content delivery for global performance

### Security Infrastructure
- **Firewalls**: Configure network-level security rules
- **WAF**: Set up web application firewalls
- **VPN**: Configure secure remote access
- **Identity management**: Set up authentication and authorization

## Cloud Infrastructure Configuration

### AWS Configuration
- **EC2 instances**: Configure compute instances with appropriate instance types
- **VPC**: Set up Virtual Private Cloud with subnets and routing
- **RDS**: Configure managed database instances
- **S3**: Set up object storage with appropriate access policies
- **IAM**: Configure identity and access management

### Azure Configuration
- **Virtual machines**: Configure compute resources in Azure
- **Virtual networks**: Set up networking and subnets
- **Azure SQL**: Configure managed database services
- **Blob storage**: Set up object storage
- **Azure AD**: Configure identity and access management

### Google Cloud Configuration
- **Compute Engine**: Configure virtual machine instances
- **VPC**: Set up Virtual Private Cloud networking
- **Cloud SQL**: Configure managed database instances
- **Cloud Storage**: Set up object storage buckets
- **Cloud IAM**: Configure identity and access management

## Configuration Management

### Infrastructure as Code
- **Terraform**: Define infrastructure using declarative configuration
- **CloudFormation**: AWS-native infrastructure as code
- **ARM templates**: Azure Resource Manager templates
- **Ansible**: Configuration management and automation

### Configuration Standards
- **Naming conventions**: Consistent resource naming patterns
- **Tagging strategies**: Resource organization and cost tracking
- **Environment separation**: Clear boundaries between dev/test/prod
- **Version control**: Track all infrastructure configuration changes

## Performance Optimization

### Compute Optimization
- Right-size instances based on actual usage patterns
- Use appropriate instance types for workload characteristics
- Configure CPU and memory limits for containers
- Implement auto-scaling for variable workloads

### Storage Optimization
- Choose appropriate storage types for performance requirements
- Configure storage IOPS and throughput for database workloads
- Implement storage tiering for cost optimization
- Set up appropriate backup and retention policies

### Network Optimization
- Configure load balancing for optimal traffic distribution
- Set up CDN for global content delivery
- Optimize network routing and bandwidth allocation
- Implement caching strategies to reduce network traffic

## Security Configuration

### Network Security
- **Firewall rules**: Restrict traffic to necessary ports and protocols
- **Network segmentation**: Isolate different application tiers
- **VPN configuration**: Secure remote access channels
- **DDoS protection**: Configure protection against distributed attacks

### Access Control
- **Role-based access**: Implement least privilege principles
- **Multi-factor authentication**: Require MFA for administrative access
- **API security**: Configure API gateways and rate limiting
- **Certificate management**: Implement SSL/TLS certificates

### Data Security
- **Encryption at rest**: Configure storage encryption
- **Encryption in transit**: Ensure all communications are encrypted
- **Key management**: Secure storage and rotation of encryption keys
- **Data backup**: Implement secure backup and recovery procedures

## High Availability and Disaster Recovery

### High Availability
- **Multi-zone deployment**: Distribute resources across availability zones
- **Load balancing**: Distribute traffic across healthy instances
- **Health checks**: Automatic detection and replacement of failed instances
- **Database clustering**: Configure database high availability

### Disaster Recovery
- **Backup strategies**: Regular backups with tested restore procedures
- **Cross-region replication**: Replicate critical data across regions
- **Failover procedures**: Automated or manual failover to secondary site
- **Recovery testing**: Regular testing of disaster recovery procedures

## Monitoring and Alerting

### Infrastructure Monitoring
- Configure monitoring for CPU, memory, disk, and network
- Set up alerts for resource utilization thresholds
- Monitor infrastructure performance and availability
- Track infrastructure costs and usage patterns

### Logging Configuration
- Set up centralized logging for all infrastructure components
- Configure log rotation and retention policies
- Implement log analysis and alerting
- Ensure logs include security and audit information

## Cost Optimization
- **Resource tagging**: Track costs by project, environment, and team
- **Reserved instances**: Use reservations for predictable workloads
- **Spot instances**: Use spot instances for non-critical workloads
- **Auto-scaling**: Scale resources based on actual demand
- **Resource cleanup**: Regularly clean up unused resources

## Documentation and Procedures
- **Architecture diagrams**: Visual representation of infrastructure
- **Configuration documentation**: Detailed configuration settings
- **Operational procedures**: Step-by-step operational tasks
- **Emergency procedures**: Incident response and recovery procedures
- **Change management**: Process for infrastructure changes

## Notes
- Use infrastructure as code for consistency and reproducibility
- Implement security controls from the beginning, not as an afterthought
- Plan for scalability and growth from the initial design
- Regular review and optimization of infrastructure configuration
- Ensure backup and disaster recovery procedures are tested regularly
- Monitor costs continuously and optimize for efficiency 