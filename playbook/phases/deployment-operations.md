# Phase • Deployment & Operations

## Purpose
Deploy the validated solution to production environment with proper monitoring, documentation, and operational procedures.

## Steps Sequence
1. **prepare-deployment-environment** - Configure production environment and dependencies [conditional: if environment setup required]
2. **deploy-with-monitoring** - Execute deployment with comprehensive monitoring and rollback capability
3. **setup-alerts-monitoring** - Configure monitoring, alerts, and observability [conditional: if monitoring required]
4. **verify-production-deployment** - Validate deployment success and functionality in production
5. **update-documentation** - Update operational documentation and runbooks
6. **setup-backup-recovery** - Configure backup and disaster recovery procedures [conditional: if data persistence]
7. **train-operations-team** - Transfer knowledge to operations/support team [conditional: if team handover required]
8. **create-rollback-plan** - Document rollback procedures and test rollback capability

## Phase Prerequisites
- **Context**: Tested and validated implementation ready for deployment
- **MCP Servers**: None required for basic deployment
- **Optional**: Deployment pipeline access, monitoring tools, production environment access

## Phase Success Criteria
- Successful deployment to production environment
- All production health checks passing
- Monitoring and alerting configured and functional
- Documentation updated and accessible
- Rollback plan tested and verified
- Operations team trained (if applicable)
- Production validation completed
- Performance metrics within acceptable ranges

## Skip Conditions
- Development/testing environment only (no production deployment)
- Configuration-only changes that don't require formal deployment
- Documentation-only updates
- Emergency rollback situation

## Validation Logic
```javascript
canExecutePhase() {
  return hasContext('validated_implementation') &&
         hasContext('production_environment') &&
         requiresDeployment();
}

shouldSkipPhase() {
  return isDevelopmentOnly() ||
         isDocumentationOnly() ||
         isConfigurationOnly() ||
         hasContext('already_deployed');
}

requiresDeployment() {
  return hasCodeChanges() ||
         hasInfrastructureChanges() ||
         hasConfigurationChanges() ||
         isNewFeatureRelease();
}
```

## Expected Duration
**Simple**: 1-2 hours  
**Standard**: 4-8 hours  
**Complex**: 1-2 days

## Outputs
- Production deployment completed successfully
- Deployment checklist with all items verified
- Monitoring dashboards configured
- Alert rules configured and tested
- Updated operational documentation
- Rollback plan documented and tested
- Performance baseline established
- Incident response procedures updated
- Knowledge transfer documentation (if applicable)
- Post-deployment validation report
- Go-live communication to stakeholders

## Notes
- Plan deployment during low-traffic periods when possible
- Always have a tested rollback plan before deploying
- Monitor system closely for the first 24-48 hours after deployment
- Use blue-green or canary deployment strategies for critical systems
- Coordinate with operations team and communicate deployment schedule
- Document any deployment issues and lessons learned
- Consider gradual rollout for high-risk changes 