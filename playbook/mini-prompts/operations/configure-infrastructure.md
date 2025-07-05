# Configure Infrastructure

## Goal
Set up, configure, and manage infrastructure components including servers, networks, storage, and cloud resources for optimal performance and security.

## Context Required
- Infrastructure requirements and specifications
- Target environment (cloud, on-premise, hybrid)

## Skip When
- Infrastructure already properly configured and operational
- Infrastructure managed by dedicated infrastructure team
- Using managed services that don't require manual configuration
- Only application-level changes needed

## Complexity Assessment
- **Task Complexity**: Very High - requires infrastructure architecture and operations expertise

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Infrastructure Components

### Compute Resources
- **Virtual machines** - configure CPU, memory, and storage specifications
- **Containers** - set up container orchestration and resource limits
- **Serverless functions** - configure function runtime and resource allocation
- **Auto-scaling** - set up automatic scaling based on demand

### Storage Systems
- **Block storage** - configure high-performance storage for databases
- **Object storage** - set up scalable storage for files and backups
- **File systems** - configure shared storage for application data
- **Backup storage** - implement automated backup and retention policies

### Networking
- **Virtual networks** - create isolated network segments
- **Subnets** - configure network segmentation and routing
- **Load balancers** - distribute traffic across multiple instances
- **CDN** - configure content delivery for global performance

### Security Infrastructure
- **Firewalls** - configure network-level security rules
- **WAF** - set up web application firewalls
- **VPN** - configure secure remote access
- **Identity management** - set up authentication and authorization

## Cloud Infrastructure Configuration

### AWS Configuration
- **EC2 instances** - configure compute instances with appropriate instance types
- **VPC** - set up Virtual Private Cloud with subnets and routing
- **RDS** - configure managed database instances
- **S3** - set up object storage with appropriate access policies
- **IAM** - configure identity and access management

### Azure Configuration
- **Virtual machines** - configure compute resources in Azure
- **Virtual networks** - set up networking and subnets
- **Azure SQL** - configure managed database services
- **Blob storage** - set up object storage
- **Azure AD** - configure identity and access management

### Google Cloud Configuration
- **Compute Engine** - configure virtual machine instances
- **VPC** - set up Virtual Private Cloud networking
- **Cloud SQL** - configure managed database instances
- **Cloud Storage** - set up object storage buckets
- **Cloud IAM** - configure identity and access management

## Configuration Management

### Infrastructure as Code
- **Terraform** - define infrastructure using declarative configuration
- **CloudFormation** - AWS-native infrastructure as code
- **ARM templates** - Azure Resource Manager templates
- **Ansible** - configuration management and automation

### Configuration Standards
- **Naming conventions** - consistent resource naming patterns
- **Tagging strategies** - resource organization and cost tracking
- **Environment separation** - clear boundaries between dev/test/prod
- **Version control** - track all infrastructure configuration changes

## Key Tasks
1. **Analyze infrastructure requirements** - review compute, storage, network, and security needs
2. **Design infrastructure architecture** - plan component layout, networking, and integrations
3. **Provision infrastructure resources** - create servers, networks, storage, and cloud resources
4. **Configure networking and security** - set up firewalls, VPNs, load balancers, and access controls
5. **Install and configure software** - set up operating systems, middleware, and required software
6. **Implement monitoring and logging** - configure infrastructure monitoring and log collection
7. **Test infrastructure setup** - validate functionality, performance, and security
8. **Document infrastructure configuration** - create documentation and diagrams

## Security Configuration

### Network Security
- **Firewall rules** - restrict traffic to necessary ports and protocols
- **Network segmentation** - isolate different application tiers
- **VPN configuration** - secure remote access channels
- **DDoS protection** - configure protection against distributed attacks

### Access Control
- **Role-based access** - implement least privilege principles
- **Multi-factor authentication** - require MFA for administrative access
- **API security** - configure API gateways and rate limiting
- **Certificate management** - implement SSL/TLS certificates

### Data Security
- **Encryption at rest** - configure storage encryption
- **Encryption in transit** - ensure all communications are encrypted
- **Key management** - secure storage and rotation of encryption keys
- **Data backup** - implement secure backup and recovery procedures

## High Availability and Disaster Recovery

### High Availability
- **Multi-zone deployment** - distribute resources across availability zones
- **Load balancing** - distribute traffic across healthy instances
- **Health checks** - automatic detection and replacement of failed instances
- **Database clustering** - configure database high availability

### Disaster Recovery
- **Backup strategies** - regular backups with tested restore procedures
- **Cross-region replication** - replicate critical data across regions
- **Failover procedures** - automated or manual failover to secondary site
- **Recovery testing** - regular testing of disaster recovery procedures

## Success Criteria
- All infrastructure components provisioned and configured correctly
- Network connectivity and security controls working as designed
- Performance meets requirements under expected load
- High availability and disaster recovery mechanisms in place
- Monitoring provides visibility into infrastructure health
- Configuration is documented and reproducible
- Security controls meet compliance requirements

## Key Outputs
- Fully configured infrastructure environment
- Network architecture with proper security controls
- Configured servers with required software and settings
- Load balancing and high availability setup
- Monitoring and alerting infrastructure
- Infrastructure documentation and diagrams
- Configuration management setup 