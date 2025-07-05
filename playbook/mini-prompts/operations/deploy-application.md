# Deploy Application

## Goal
Deploy applications to target environments with proper configuration, health checks, and rollback capabilities.

## Context Required
- Application build artifacts or source code
- Target environment specifications and access
- Deployment configuration

## Skip When
- Application already deployed and running correctly
- No deployment needed (config-only changes)
- Target environment not ready or accessible

## Complexity Assessment
- **Task Complexity**: Medium - requires deployment expertise and environment management

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Deployment Strategies
- **Blue-Green** - parallel env, test, switch traffic, keep old for rollback
- **Rolling** - gradually replace instances, monitor health, rollback if issues
- **Canary** - small subset first, monitor metrics, gradual or full rollback
- **Recreate** - stop current, deploy new, start (accepts downtime)

## Environment Types
- **Development** - fast deployment, minimal checks, experimental features
- **Staging** - mirror production process, comprehensive testing, performance tests
- **Production** - maximum safety, comprehensive checks, gradual rollout, change management

## Key Tasks
1. **Validate prerequisites** - environment access, credentials, artifacts
2. **Prepare environment** - ensure target ready and configured
3. **Execute deployment** - deploy using appropriate strategy
4. **Health checks** - readiness, liveness, dependencies, performance
5. **Configuration** - apply environment-specific settings and secrets
6. **Validation** - smoke tests, functionality checks
7. **Monitoring** - performance, errors, logs, infrastructure

## Deployment Types
- **Container** - build/tag images, push to registry, rolling update
- **Serverless** - package/upload functions, update configs, test endpoints
- **Database** - migrations, procedures, backup, verify integrity
- **Static Assets** - upload to CDN, update URLs, clear caches

## Success Criteria
- Application deployed and accessible
- All health checks passing
- Configuration properly applied
- Monitoring and logging functional
- Rollback procedure available

## Rollback Strategy
- Keep previous version available
- Document rollback triggers
- Test rollback procedures regularly
- Automate rollback where possible 