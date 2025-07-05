# Step • Backup and Recovery

## Purpose
Implement comprehensive backup and disaster recovery procedures to protect against data loss, ensure business continuity, and meet recovery time and point objectives.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard backup tools)

**Required Context**:
- System architecture and critical data assets
- Recovery requirements (RTO/RPO)

**Optional Context**:
- Existing backup infrastructure
- Compliance and regulatory requirements
- Available backup storage options
- Disaster scenarios and risk assessment

## Validation Logic
```javascript
canExecute() {
  return hasContext('system_architecture') &&
         hasContext('recovery_requirements') &&
         hasCriticalDataAssets() &&
         hasBackupAccess();
}

hasCriticalDataAssets() {
  return hasDatabases() ||
         hasApplicationData() ||
         hasConfigurationData() ||
         hasUserGeneratedContent() ||
         hasBusinessCriticalFiles();
}
```

## Process
1. **Assess backup requirements** - Identify critical data, RTO/RPO requirements, and compliance needs
2. **Design backup strategy** - Plan backup types, frequencies, and retention policies
3. **Implement data backups** - Set up automated backups for databases and application data
4. **Configure system backups** - Back up configurations, code, and infrastructure state
5. **Set up backup monitoring** - Monitor backup success and validate backup integrity
6. **Create recovery procedures** - Document and test recovery processes
7. **Test disaster recovery** - Regularly test full disaster recovery scenarios
8. **Maintain backup documentation** - Keep recovery procedures and contact information current

## Inputs
- Inventory of critical data and systems
- Recovery time objective (RTO) and recovery point objective (RPO)
- Compliance and regulatory backup requirements
- Available backup storage infrastructure
- Risk assessment and disaster scenarios

## Outputs
- Comprehensive backup strategy implemented
- Automated backup processes for all critical data
- Tested recovery procedures and documentation
- Backup monitoring and alerting configured
- Disaster recovery plan with defined procedures
- Regular backup testing and validation processes

## Success Criteria
- All critical data backed up according to defined schedule
- Backup integrity verified through regular testing
- Recovery procedures tested and documented
- RTO and RPO objectives consistently met
- Backup monitoring provides early warning of issues
- Team trained on recovery procedures and contacts
- Compliance requirements met for data protection

## Skip Conditions
- Comprehensive backup and recovery already implemented
- Data is not critical or easily replaceable
- Backup and recovery managed by dedicated team
- System uses fully managed services with built-in backup

## Backup Types and Strategies

### Full Backup
- **Complete data copy**: Back up entire dataset or system
- **Recovery simplicity**: Fastest recovery time from single backup
- **Storage intensive**: Requires most storage space and time
- **Frequency**: Weekly or monthly for large datasets

### Incremental Backup
- **Changed data only**: Back up only data changed since last backup
- **Storage efficient**: Minimal storage space and backup time
- **Recovery complexity**: Requires base backup plus all incremental backups
- **Frequency**: Daily or hourly for frequent data changes

### Differential Backup
- **Changes since full**: Back up all changes since last full backup
- **Balanced approach**: Balance between storage and recovery complexity
- **Recovery moderate**: Requires full backup plus latest differential
- **Frequency**: Daily backups with weekly full backups

### Snapshot Backup
- **Point-in-time copy**: Instant snapshot of data at specific moment
- **Fast creation**: Minimal impact on running systems
- **Storage dependent**: Requires snapshot-capable storage systems
- **Use cases**: Database backups and system state preservation

## Data Categories

### Database Backups
- **Transactional consistency**: Ensure ACID properties during backup
- **Online backups**: Backup without stopping database services
- **Transaction log backups**: Capture incremental changes for point-in-time recovery
- **Cross-region replication**: Geographic distribution for disaster recovery

### Application Data
- **User-generated content**: Files, documents, and media uploaded by users
- **Configuration data**: Application settings, preferences, and customizations
- **Session data**: User sessions and temporary application state
- **Cache data**: Consider if cache data needs backup or can be regenerated

### System Configuration
- **Operating system configuration**: System settings and configurations
- **Application configuration**: Application-specific settings and parameters
- **Network configuration**: Firewall rules, load balancer settings, DNS records
- **Infrastructure as code**: Terraform, CloudFormation, and automation scripts

### Code and Artifacts
- **Source code**: Application source code and version history
- **Build artifacts**: Compiled applications, Docker images, and packages
- **Deployment scripts**: Automation scripts and deployment configurations
- **Documentation**: Technical documentation and operational procedures

## Backup Infrastructure

### Storage Options
- **Local storage**: On-site backup storage for fast recovery
- **Cloud storage**: Remote cloud storage for geographic distribution
- **Hybrid approach**: Combination of local and cloud storage
- **Tape storage**: Long-term archival storage for compliance

### Backup Tools
- **Database-native tools**: Built-in backup utilities for databases
- **File system tools**: rsync, tar, and file-level backup utilities
- **Enterprise backup solutions**: Veeam, Commvault, and comprehensive platforms
- **Cloud backup services**: AWS Backup, Azure Backup, Google Cloud Backup

### Security Considerations
- **Encryption at rest**: Encrypt all backup data in storage
- **Encryption in transit**: Secure data transmission during backup
- **Access controls**: Restrict access to backup data and systems
- **Immutable backups**: Prevent backup data from being modified or deleted

## Recovery Procedures

### Recovery Types
- **File-level recovery**: Restore specific files or directories
- **Database recovery**: Restore databases to specific point in time
- **System recovery**: Complete system restoration from backup
- **Disaster recovery**: Full infrastructure and data recovery

### Recovery Testing
- **Regular testing**: Scheduled testing of recovery procedures
- **Partial recovery**: Test recovery of specific components or data
- **Full disaster simulation**: Complete disaster recovery testing
- **Documentation updates**: Update procedures based on test results

### Recovery Time Optimization
- **Recovery prioritization**: Identify critical systems for priority recovery
- **Parallel recovery**: Recover multiple systems simultaneously
- **Recovery automation**: Automate recovery procedures where possible
- **Warm standby**: Maintain standby systems for faster recovery

## Disaster Recovery Planning

### Risk Assessment
- **Natural disasters**: Earthquakes, floods, fires, and weather events
- **Human errors**: Accidental deletion, configuration mistakes
- **Cyber attacks**: Ransomware, data corruption, system compromise
- **Infrastructure failures**: Hardware failures, network outages, power loss

### Recovery Site Options
- **Hot site**: Fully equipped site ready for immediate operation
- **Warm site**: Partially equipped site requiring setup time
- **Cold site**: Basic facilities requiring full equipment installation
- **Cloud-based DR**: Cloud infrastructure for disaster recovery

### Communication Plan
- **Emergency contacts**: Key personnel and their contact information
- **Communication channels**: Primary and backup communication methods
- **Status updates**: Regular updates to stakeholders during recovery
- **Media relations**: Public communication strategy if necessary

## Monitoring and Alerting

### Backup Monitoring
- **Backup job status**: Monitor success and failure of backup jobs
- **Backup integrity**: Verify backup data integrity and completeness
- **Storage utilization**: Monitor backup storage capacity and usage
- **Performance monitoring**: Track backup duration and throughput

### Alert Configuration
- **Failure alerts**: Immediate notification of backup failures
- **Capacity warnings**: Alert before storage capacity limits
- **Performance degradation**: Alert on unusually slow backups
- **Integrity issues**: Alert on backup verification failures

### Reporting
- **Backup reports**: Regular reports on backup status and trends
- **Compliance reporting**: Documentation for regulatory compliance
- **Capacity planning**: Reports for backup storage planning
- **Recovery metrics**: Track RTO and RPO achievement

## Compliance and Regulatory Requirements

### Data Retention
- **Legal requirements**: Meet legal data retention requirements
- **Business requirements**: Retain data for business needs
- **Disposal procedures**: Secure disposal of expired backup data
- **Audit trails**: Maintain records of backup and disposal activities

### Geographic Requirements
- **Data sovereignty**: Comply with data residency requirements
- **Cross-border transfers**: Manage international data transfer restrictions
- **Regional compliance**: Meet region-specific regulatory requirements
- **Encryption standards**: Use approved encryption methods

## Best Practices

### Backup Strategy
- **3-2-1 rule**: 3 copies of data, 2 different media types, 1 offsite
- **Regular validation**: Regularly test backup integrity and recoverability
- **Automation**: Automate backup processes to reduce human error
- **Documentation**: Maintain current documentation of procedures

### Security
- **Principle of least privilege**: Limit access to backup systems
- **Segregation of duties**: Separate backup administration from data access
- **Audit logging**: Log all backup and recovery activities
- **Regular updates**: Keep backup software and systems updated

### Performance
- **Off-peak scheduling**: Schedule backups during low-usage periods
- **Bandwidth management**: Limit backup impact on network performance
- **Compression**: Use compression to reduce backup size and time
- **Deduplication**: Eliminate duplicate data to optimize storage

## Cost Optimization
- **Tiered storage**: Use appropriate storage tiers for different backup ages
- **Lifecycle policies**: Automatically move older backups to cheaper storage
- **Compression and deduplication**: Reduce storage costs through optimization
- **Regular cleanup**: Remove unnecessary or expired backups

## Notes
- Recovery is more important than backup - test recovery procedures regularly
- Document all procedures and keep contact information current
- Consider automation to reduce human error in critical processes
- Plan for different disaster scenarios and recovery priorities
- Regularly review and update backup and recovery strategies
- Train team members on recovery procedures and emergency contacts 