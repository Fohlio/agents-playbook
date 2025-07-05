# Step • Manage Secrets and Credentials

## Purpose
Securely manage, store, and distribute sensitive information including passwords, API keys, certificates, and other credentials across applications and infrastructure.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard security tools)

**Required Context**:
- Application or system requiring credentials
- Security requirements and compliance needs

**Optional Context**:
- Existing secrets management system
- Compliance frameworks (SOC2, HIPAA, PCI DSS)
- Team access requirements
- Audit and rotation policies

## Validation Logic
```javascript
canExecute() {
  return hasContext('application_system') &&
         hasContext('security_requirements') &&
         hasSecretsToManage() &&
         hasSecurityAccess();
}

hasSecretsToManage() {
  return hasPasswords() ||
         hasAPIKeys() ||
         hasCertificates() ||
         hasConnectionStrings() ||
         hasEncryptionKeys();
}
```

## Process
1. **Inventory existing secrets** - Identify all credentials, keys, and sensitive data
2. **Choose secrets management solution** - Select appropriate secrets management platform
3. **Migrate secrets to secure storage** - Move credentials from insecure locations
4. **Implement access controls** - Configure role-based access and permissions
5. **Set up secret rotation** - Implement automatic or scheduled credential rotation
6. **Configure application integration** - Update applications to retrieve secrets securely
7. **Implement audit logging** - Enable logging for all secret access and modifications
8. **Document procedures** - Create documentation for secret management processes

## Inputs
- Inventory of current secrets and credentials
- Security and compliance requirements
- Application architecture and deployment methods
- Team structure and access requirements
- Existing security infrastructure and tools

## Outputs
- Secure secrets management system implemented
- All secrets migrated from insecure storage
- Role-based access controls configured
- Secret rotation policies and procedures
- Applications configured to use secure secret retrieval
- Audit logging and monitoring enabled
- Documentation for secret management procedures

## Success Criteria
- No secrets stored in code, configuration files, or environment variables
- All secrets accessible only through secure secrets management system
- Role-based access controls properly restrict secret access
- Secret rotation working automatically or on schedule
- Audit logs capture all secret access and modifications
- Applications successfully retrieve secrets without hardcoding
- Compliance requirements met for secret handling

## Skip Conditions
- Comprehensive secrets management already implemented
- No sensitive credentials or secrets to manage
- Secrets management handled by dedicated security team
- Only public or non-sensitive configuration data

## Types of Secrets

### Credentials
- **Database passwords**: Connection credentials for databases
- **Service account passwords**: System and service user credentials
- **Admin passwords**: Administrative access credentials
- **User passwords**: Application user authentication data

### API Keys and Tokens
- **Third-party API keys**: External service authentication keys
- **OAuth tokens**: Authorization tokens for API access
- **JWT signing keys**: Keys for token generation and validation
- **Webhook tokens**: Secure tokens for webhook validation

### Certificates and Keys
- **SSL/TLS certificates**: Web server and application certificates
- **Private keys**: Encryption and signing private keys
- **SSH keys**: Server access and deployment keys
- **Code signing certificates**: Application and binary signing certificates

### Connection Strings
- **Database connections**: Complete database connection information
- **Message queue connections**: Messaging system credentials
- **Cache connections**: Redis, Memcached connection details
- **Storage connections**: Object storage access credentials

## Secrets Management Solutions

### Cloud-Native Solutions
- **AWS Secrets Manager**: AWS native secrets management service
- **Azure Key Vault**: Microsoft Azure secrets and key management
- **Google Secret Manager**: Google Cloud Platform secrets management
- **AWS Parameter Store**: Simple configuration and secrets storage

### Third-Party Solutions
- **HashiCorp Vault**: Enterprise-grade secrets management platform
- **CyberArk**: Enterprise privileged access management
- **Azure Key Vault**: Microsoft's cloud key management service
- **1Password Business**: Team-based password and secrets management

### Open Source Options
- **HashiCorp Vault (OSS)**: Open source version of Vault
- **Bitwarden**: Open source password management
- **KeePass**: Local password database management
- **Pass**: Unix password manager using GPG

## Secret Storage Best Practices

### Storage Security
- **Encryption at rest**: All secrets encrypted when stored
- **Encryption in transit**: Secure communication protocols
- **Access logging**: Track all secret access and modifications
- **Regular backups**: Secure backup and recovery procedures

### Access Control
- **Least privilege**: Minimum necessary access to secrets
- **Role-based access**: Access based on job functions and responsibilities
- **Time-limited access**: Temporary access for specific tasks
- **Multi-factor authentication**: Additional security for administrative access

### Secret Rotation
- **Automatic rotation**: Scheduled rotation for supported services
- **Manual rotation**: Process for rotating non-automated secrets
- **Zero-downtime rotation**: Rotation without service interruption
- **Rollback procedures**: Ability to revert to previous secrets if needed

## Application Integration

### Development Environment
- **Local development**: Secure secret access for developers
- **Development databases**: Non-production credentials
- **Testing environments**: Isolated secrets for testing
- **CI/CD integration**: Secure secret injection in build pipelines

### Production Environment
- **Runtime secret retrieval**: Applications fetch secrets at startup or runtime
- **Secure caching**: Temporary secure storage of retrieved secrets
- **Error handling**: Graceful handling of secret retrieval failures
- **Performance optimization**: Efficient secret retrieval without impact

### Container Integration
- **Init containers**: Retrieve secrets before application startup
- **Sidecar containers**: Dedicated containers for secret management
- **Volume mounts**: Secure mounting of secrets as files
- **Environment injection**: Secure injection of secrets as environment variables

## Secret Rotation Strategies

### Automatic Rotation
- **Database credentials**: Automatic rotation with database provider APIs
- **API keys**: Automated rotation through service provider APIs
- **Certificates**: Automatic renewal and deployment of SSL certificates
- **System passwords**: Scheduled rotation of service account passwords

### Manual Rotation
- **Third-party services**: Manual rotation for unsupported services
- **Legacy systems**: Manual processes for older systems
- **Emergency rotation**: Rapid rotation in case of compromise
- **Compliance-driven rotation**: Rotation based on policy requirements

## Audit and Compliance

### Audit Logging
- **Access logs**: Who accessed which secrets when
- **Modification logs**: Changes to secrets and configurations
- **Failed access attempts**: Security monitoring and alerting
- **Administrative actions**: Management and configuration changes

### Compliance Requirements
- **Data retention**: Log retention policies for compliance
- **Access reviews**: Regular review of secret access permissions
- **Segregation of duties**: Separation of secret management responsibilities
- **Evidence collection**: Documentation for compliance audits

## Emergency Procedures

### Compromise Response
- **Immediate rotation**: Quick rotation of compromised secrets
- **Access revocation**: Immediate removal of compromised access
- **Impact assessment**: Determine scope of potential compromise
- **Incident documentation**: Record details for security analysis

### Disaster Recovery
- **Backup restoration**: Recovery of secrets from secure backups
- **Service continuity**: Maintaining service during secret system outages
- **Communication procedures**: Coordinating recovery efforts
- **Testing procedures**: Regular testing of emergency procedures

## Team Training and Procedures

### Developer Training
- **Secure coding practices**: Never hardcode secrets in applications
- **Secret retrieval**: Proper methods for accessing secrets
- **Local development**: Secure practices for development environments
- **Incident reporting**: Procedures for reporting potential compromises

### Operations Training
- **Secret management procedures**: Day-to-day management tasks
- **Rotation procedures**: Manual and automated rotation processes
- **Monitoring and alerting**: Recognizing and responding to issues
- **Emergency procedures**: Response to security incidents

## Notes
- Never store secrets in code repositories or configuration files
- Use different secrets for different environments (dev/test/prod)
- Implement the principle of least privilege for secret access
- Regularly audit and review secret access permissions
- Test secret rotation and recovery procedures regularly
- Keep secrets management system itself highly secure and available 