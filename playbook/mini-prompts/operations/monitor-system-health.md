# Step • Monitor System Health

## Purpose
Establish comprehensive monitoring and observability for applications and infrastructure to detect issues proactively and maintain system reliability.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard monitoring tools)

**Required Context**:
- Running application or system
- System architecture and components

**Optional Context**:
- Existing monitoring setup
- Performance baselines and SLAs
- Alert escalation procedures
- Incident response playbooks

## Validation Logic
```javascript
canExecute() {
  return hasContext('running_system') &&
         hasContext('system_architecture') &&
         requiresMonitoring() &&
         hasMonitoringAccess();
}

requiresMonitoring() {
  return isProductionSystem() ||
         hasPerformanceRequirements() ||
         hasAvailabilityRequirements() ||
         needsProactiveAlerts();
}
```

## Process
1. **Assess monitoring requirements** - Identify critical metrics, SLAs, and monitoring scope
2. **Set up infrastructure monitoring** - Monitor servers, containers, networks, and resources
3. **Implement application monitoring** - Track application performance, errors, and usage
4. **Configure log aggregation** - Centralize and analyze application and system logs
5. **Create dashboards and visualizations** - Build monitoring dashboards for different audiences
6. **Set up alerting and notifications** - Configure alerts for critical issues and thresholds
7. **Test monitoring and alerts** - Validate monitoring setup and alert delivery
8. **Document monitoring procedures** - Create runbooks and monitoring documentation

## Inputs
- Application and infrastructure architecture
- Performance requirements and SLAs
- Critical business metrics and KPIs
- Existing monitoring tools and infrastructure
- Team notification preferences and escalation procedures

## Outputs
- Comprehensive monitoring setup for all system components
- Real-time dashboards showing system health and performance
- Automated alerting for critical issues and threshold breaches
- Centralized log aggregation and analysis
- Monitoring documentation and runbooks
- Performance baselines and trend analysis

## Success Criteria
- All critical system components monitored with appropriate metrics
- Dashboards provide clear visibility into system health
- Alerts trigger appropriately for actual issues without false positives
- Mean time to detection (MTTD) meets requirements
- Monitoring data helps with troubleshooting and capacity planning
- Team receives notifications through preferred channels
- Historical data available for trend analysis

## Skip Conditions
- Comprehensive monitoring already in place and functioning
- System too simple to warrant detailed monitoring
- Monitoring setup is handled by infrastructure team
- Only temporary or development system

## Monitoring Categories

### Infrastructure Monitoring
- **CPU utilization**: Track processor usage across all systems
- **Memory usage**: Monitor RAM consumption and availability
- **Disk space**: Track storage usage and I/O performance
- **Network**: Monitor bandwidth, latency, and connectivity
- **Container metrics**: CPU, memory, and network for containerized apps

### Application Monitoring
- **Response times**: Track API and page load performance
- **Throughput**: Monitor requests per second and concurrent users
- **Error rates**: Track 4xx and 5xx errors, exceptions, and failures
- **Business metrics**: Monitor key business KPIs and conversion rates
- **User experience**: Track real user monitoring and synthetic checks

### Security Monitoring
- **Authentication failures**: Monitor failed login attempts
- **Access patterns**: Track unusual access patterns or privilege escalation
- **Security events**: Monitor firewall blocks, intrusion attempts
- **Compliance metrics**: Track adherence to security policies
- **Vulnerability scanning**: Regular security assessment results

### Database Monitoring
- **Query performance**: Track slow queries and execution times
- **Connection pool**: Monitor database connections and pool usage
- **Replication lag**: Track data synchronization across replicas
- **Storage usage**: Monitor database size and growth trends
- **Lock contention**: Identify blocking queries and deadlocks

## Alert Configuration

### Alert Severity Levels
- **Critical**: Immediate response required (system down, data loss)
- **Warning**: Requires attention within defined timeframe
- **Info**: Informational alerts for awareness and trending

### Alert Thresholds
- Set thresholds based on baseline performance data
- Use multiple thresholds to avoid alert fatigue
- Configure escalation for unacknowledged critical alerts
- Implement intelligent alerting to reduce false positives

### Notification Channels
- **Immediate**: SMS, phone calls for critical alerts
- **Standard**: Email, Slack for warnings and info alerts
- **Escalation**: Manager notification for unresolved critical issues
- **Status pages**: Public communication for customer-facing issues

## Dashboard Design

### Executive Dashboard
- High-level system health overview
- Key business metrics and SLAs
- Current incidents and their impact
- System availability and performance trends

### Operations Dashboard
- Detailed system metrics and performance
- Recent alerts and their status
- Infrastructure utilization and capacity
- Deployment and change tracking

### Development Dashboard
- Application performance metrics
- Error rates and recent errors
- Performance across different environments
- Code deployment and rollback tracking

### Business Dashboard
- User engagement and conversion metrics
- Revenue and transaction monitoring
- Customer experience indicators
- Business process performance

## Log Management

### Log Collection
- **Application logs**: Errors, warnings, and business events
- **System logs**: Operating system and infrastructure events
- **Access logs**: Web server and API request logs
- **Security logs**: Authentication and authorization events
- **Audit logs**: Compliance and change tracking

### Log Analysis
- **Error pattern detection**: Identify recurring issues
- **Performance analysis**: Track request flows and timing
- **Security monitoring**: Detect suspicious activities
- **Business intelligence**: Extract business insights from logs
- **Root cause analysis**: Correlate events across systems

## Monitoring Tools and Technologies

### Open Source Options
- **Prometheus + Grafana**: Metrics collection and visualization
- **ELK Stack**: Elasticsearch, Logstash, Kibana for log analysis
- **Jaeger**: Distributed tracing for microservices
- **Nagios**: Traditional infrastructure monitoring

### Cloud Provider Solutions
- **AWS CloudWatch**: Comprehensive AWS service monitoring
- **Azure Monitor**: Microsoft Azure monitoring and analytics
- **Google Cloud Monitoring**: GCP infrastructure and application monitoring

### SaaS Solutions
- **Datadog**: Full-stack monitoring and analytics
- **New Relic**: Application performance monitoring
- **Splunk**: Log analysis and security monitoring
- **PagerDuty**: Incident management and alerting

## Performance Baselines

### Establishing Baselines
- Collect performance data over representative time periods
- Account for seasonal and cyclical variations
- Document normal operating ranges for key metrics
- Update baselines as system evolves and scales

### Trend Analysis
- Track performance trends over time
- Identify gradual degradation or improvement
- Predict capacity needs based on growth trends
- Correlate performance with business activities

## Incident Response Integration
- Automatically create incidents for critical alerts
- Include relevant monitoring data in incident reports
- Track mean time to resolution (MTTR) metrics
- Use monitoring data for post-incident analysis

## Notes
- Start with basic monitoring and expand over time
- Focus on metrics that directly impact user experience
- Regularly review and tune alert thresholds
- Use monitoring data to inform capacity planning decisions
- Ensure monitoring system itself is highly available
- Train team members on dashboard usage and alert response 