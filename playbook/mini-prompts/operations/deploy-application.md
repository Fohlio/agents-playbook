# Step • Deploy Application

## Purpose
Deploy applications and systems to target environments with proper configuration, health checks, and rollback capabilities.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard deployment tools)

**Required Context**:
- Application build artifacts or source code
- Target environment specifications
- Deployment configuration

**Optional Context**:
- Infrastructure provisioning details
- Previous deployment configurations
- Rollback procedures
- Health check endpoints

## Validation Logic
```javascript
canExecute() {
  return hasContext('application_artifacts') &&
         hasContext('target_environment') &&
         hasDeploymentConfiguration() &&
         hasRequiredAccess();
}

hasRequiredAccess() {
  return hasEnvironmentCredentials() ||
         hasDeploymentPermissions() ||
         hasInfrastructureAccess();
}
```

## Process
1. **Validate deployment prerequisites** - Check environment access, credentials, and artifacts
2. **Prepare deployment environment** - Ensure target environment is ready and configured
3. **Run pre-deployment checks** - Verify system health and dependencies
4. **Execute deployment** - Deploy application using appropriate deployment strategy
5. **Perform health checks** - Validate application is running correctly
6. **Update configuration** - Apply environment-specific settings and secrets
7. **Run post-deployment validation** - Execute smoke tests and functionality checks
8. **Document deployment** - Record deployment details and any issues encountered

## Inputs
- Application build artifacts (binaries, Docker images, packages)
- Environment configuration and specifications
- Deployment manifests or scripts
- Access credentials and permissions
- Health check and validation procedures

## Outputs
- Successfully deployed application in target environment
- Application running with correct configuration
- Health checks passing and monitoring active
- Deployment documentation and logs
- Rollback procedures documented (if not already available)
- Environment-specific configuration applied

## Success Criteria
- Application deployed and accessible in target environment
- All health checks and smoke tests passing
- Configuration properly applied for the environment
- Monitoring and logging functional
- Performance within expected parameters
- No critical errors in deployment logs
- Rollback procedure tested and documented

## Skip Conditions
- Application already deployed and running correctly
- No deployment needed (configuration-only changes)
- Target environment not ready or accessible
- Critical dependencies not available

## Deployment Strategies

### Blue-Green Deployment
- Deploy to parallel environment (green)
- Test thoroughly before switching traffic
- Switch traffic from current (blue) to new (green)
- Keep blue environment for quick rollback

### Rolling Deployment
- Gradually replace instances with new version
- Monitor health during rollout
- Roll back if issues detected
- Suitable for applications with multiple instances

### Canary Deployment
- Deploy to small subset of users/instances
- Monitor metrics and user feedback
- Gradually increase traffic to new version
- Full rollout or rollback based on results

### Recreate Deployment
- Stop current version completely
- Deploy new version
- Start new version
- Accepts downtime but simpler process

## Environment-Specific Considerations

### Development Environment
- Focus on fast deployment and easy rollback
- Minimal health checks and validation
- Allow experimental features and configurations
- Automated deployment from development branches

### Staging Environment
- Mirror production deployment process
- Comprehensive testing and validation
- Performance testing under load
- Full integration testing with production-like data

### Production Environment
- Maximum safety and reliability measures
- Comprehensive health checks and monitoring
- Gradual rollout strategies preferred
- Immediate rollback capabilities
- Change management and approval processes

## Common Deployment Tasks

### Container Deployment
- Build and tag Docker images
- Push to container registry
- Update container orchestration configs
- Rolling update of container instances

### Serverless Deployment
- Package and upload function code
- Update function configurations
- Test function endpoints
- Monitor function metrics and logs

### Database Deployment
- Run database migrations
- Update stored procedures and functions
- Backup database before changes
- Verify data integrity after deployment

### Static Asset Deployment
- Upload assets to CDN or web server
- Update asset URLs and references
- Clear caches and update DNS
- Verify asset accessibility

## Health Check Implementation
- **Readiness checks**: Application ready to receive traffic
- **Liveness checks**: Application running and responsive
- **Dependency checks**: External services and databases accessible
- **Performance checks**: Response times within acceptable limits
- **Feature checks**: Core functionality working correctly

## Rollback Procedures
- Keep previous version available for quick rollback
- Document rollback triggers and decision criteria
- Test rollback procedures regularly
- Automate rollback where possible
- Communicate rollback procedures to team

## Security Considerations
- Secure credential management and access controls
- Network security and firewall configurations
- SSL/TLS certificate management
- Security scanning of deployed artifacts
- Compliance with security policies and standards

## Monitoring and Observability
- Application performance monitoring
- Error tracking and alerting
- Log aggregation and analysis
- Infrastructure monitoring
- User experience monitoring

## Notes
- Always have a rollback plan before deployment
- Test deployment procedures in staging environment first
- Monitor key metrics closely during and after deployment
- Document any issues or deviations for future reference
- Consider maintenance windows for critical production deployments
- Communicate deployment status to stakeholders 