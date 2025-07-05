# Step • Database Migration

## Purpose
Execute database schema changes and data migrations safely, ensuring data integrity and minimal downtime during the migration process.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard database tools)

**Required Context**:
- Current database schema and structure
- Target schema requirements or migration plan

**Optional Context**:
- Migration tools and frameworks
- Database backup and rollback procedures
- Performance requirements and constraints
- Data validation requirements

## Validation Logic
```javascript
canExecute() {
  return hasContext('current_database_schema') &&
         hasContext('target_schema') &&
         hasDatabaseAccess() &&
         requiresMigration();
}

requiresMigration() {
  return hasSchemaChanges() ||
         hasDataTransformations() ||
         hasIndexChanges() ||
         hasConstraintChanges() ||
         needsDataMigration();
}
```

## Process
1. **Analyze migration requirements** - Review schema changes, data transformations, and migration scope
2. **Create backup strategy** - Ensure comprehensive backups before migration
3. **Write migration scripts** - Develop forward and backward migration scripts
4. **Test migration in staging** - Validate migration scripts in non-production environment
5. **Plan downtime and rollback** - Schedule migration window and prepare rollback procedures
6. **Execute migration** - Run migration scripts with monitoring and validation
7. **Validate data integrity** - Verify data consistency and application functionality
8. **Document migration results** - Record migration details and any issues encountered

## Inputs
- Current database schema and data model
- Target schema requirements and specifications
- Data mapping and transformation requirements
- Migration constraints (downtime, performance)
- Existing migration tools and frameworks

## Outputs
- Database successfully migrated to target schema
- All data transformed and migrated correctly
- Data integrity validated and confirmed
- Application functionality verified post-migration
- Migration scripts and procedures documented
- Rollback procedures tested and documented

## Success Criteria
- All schema changes applied successfully
- Data migration completed without data loss
- Application functions correctly with new schema
- Performance meets requirements post-migration
- Data integrity constraints maintained
- Rollback procedures verified and available
- Migration time within planned window

## Skip Conditions
- Database already at target schema version
- No schema or data changes required
- Migration handled by dedicated database team
- Using database-as-a-service with automatic migrations

## Migration Types

### Schema Migrations
- **Table creation**: Add new tables to support new features
- **Column changes**: Add, modify, or remove table columns
- **Index management**: Create, modify, or drop database indexes
- **Constraint updates**: Add or modify foreign keys, unique constraints
- **Data type changes**: Modify column data types and precision

### Data Migrations
- **Data transformation**: Convert data formats or structures
- **Data consolidation**: Merge data from multiple sources
- **Data cleanup**: Remove duplicate or invalid data
- **Reference updates**: Update foreign key relationships
- **Historical data migration**: Migrate archived or historical data

### Performance Migrations
- **Index optimization**: Add or modify indexes for performance
- **Partitioning**: Implement table partitioning strategies
- **Denormalization**: Optimize schema for read performance
- **Query optimization**: Improve slow query performance
- **Storage optimization**: Optimize storage layout and compression

## Migration Planning

### Risk Assessment
- **Data loss risks**: Identify potential data loss scenarios
- **Downtime impact**: Assess business impact of downtime
- **Performance impact**: Evaluate migration impact on performance
- **Rollback complexity**: Assess difficulty of rolling back changes
- **Dependency risks**: Identify application and system dependencies

### Migration Strategy
- **Online vs offline**: Determine if migration can run online
- **Phased approach**: Break large migrations into smaller phases
- **Blue-green migration**: Use parallel environment for migration
- **Rolling migration**: Migrate data in batches over time
- **Zero-downtime migration**: Techniques for minimal downtime

### Backup and Recovery
- **Full database backup**: Complete backup before migration
- **Transaction log backup**: Backup transaction logs for point-in-time recovery
- **Schema backup**: Backup current schema structure
- **Test data backup**: Backup test data for rollback testing
- **Backup verification**: Verify backup integrity before migration

## Migration Scripts

### Forward Migration Scripts
- **Schema changes**: DDL scripts for schema modifications
- **Data transformation**: Scripts for data format changes
- **Index creation**: Scripts for new or modified indexes
- **Constraint addition**: Scripts for new constraints
- **Data validation**: Scripts to validate migration success

### Backward Migration Scripts
- **Schema rollback**: Scripts to revert schema changes
- **Data restoration**: Scripts to restore original data format
- **Index rollback**: Scripts to restore original indexes
- **Constraint removal**: Scripts to remove new constraints
- **Cleanup scripts**: Scripts to clean up migration artifacts

### Migration Validation
- **Data count validation**: Verify row counts before and after
- **Data integrity checks**: Verify referential integrity
- **Business rule validation**: Ensure business rules still apply
- **Performance validation**: Verify performance meets requirements
- **Application testing**: Test application functionality

## Database-Specific Considerations

### PostgreSQL Migrations
- **pg_dump/pg_restore**: Use native backup and restore tools
- **ALTER TABLE**: Use for schema modifications
- **VACUUM**: Run after large data changes
- **Transaction safety**: Use transactions for atomic migrations
- **Extension management**: Handle PostgreSQL extensions

### MySQL Migrations
- **mysqldump**: Use for backup and restore
- **ALTER TABLE**: Schema modification statements
- **InnoDB considerations**: Handle InnoDB-specific features
- **Replication impact**: Consider master-slave replication
- **Character set handling**: Manage character encoding changes

### SQL Server Migrations
- **SQL Server Backup**: Use native backup features
- **T-SQL scripts**: Use Transact-SQL for migrations
- **Agent jobs**: Schedule and monitor migration jobs
- **Always On considerations**: Handle availability groups
- **Full-text indexing**: Manage full-text index migrations

### Oracle Migrations
- **Data Pump**: Use for large data migrations
- **SQL*Plus scripts**: Execute migration scripts
- **Tablespace management**: Handle storage considerations
- **PL/SQL procedures**: Use for complex data transformations
- **Oracle-specific features**: Handle Oracle-specific functionality

## Migration Tools and Frameworks

### ORM Migration Tools
- **Django migrations**: Python Django framework migrations
- **Rails migrations**: Ruby on Rails migration system
- **Entity Framework**: .NET Entity Framework migrations
- **Sequelize**: Node.js ORM migration tools
- **Alembic**: SQLAlchemy migration tool for Python

### Database-Specific Tools
- **Flyway**: Database migration tool for multiple databases
- **Liquibase**: Open source database migration tool
- **gh-ost**: GitHub's online schema migration tool
- **pt-online-schema-change**: Percona toolkit for MySQL
- **pgloader**: PostgreSQL data loading tool

### Cloud Migration Tools
- **AWS Database Migration Service**: AWS DMS for cloud migrations
- **Azure Database Migration Service**: Microsoft Azure migration service
- **Google Cloud Database Migration**: GCP migration tools
- **Cloud SQL Proxy**: Secure cloud database connections

## Testing and Validation

### Pre-Migration Testing
- **Test environment setup**: Create replica of production environment
- **Migration rehearsal**: Run full migration process in test
- **Performance testing**: Validate migration performance
- **Rollback testing**: Test rollback procedures
- **Application testing**: Verify application compatibility

### Post-Migration Validation
- **Data integrity verification**: Ensure all data migrated correctly
- **Performance monitoring**: Monitor database performance
- **Application functionality**: Test all application features
- **User acceptance testing**: Validate business functionality
- **Monitoring setup**: Ensure monitoring systems work correctly

### Automated Testing
- **Unit tests**: Test individual migration scripts
- **Integration tests**: Test end-to-end migration process
- **Data validation tests**: Automated data integrity checks
- **Performance benchmarks**: Automated performance validation
- **Regression tests**: Ensure existing functionality unchanged

## Downtime Management

### Minimizing Downtime
- **Online schema changes**: Use tools that support online operations
- **Read-only mode**: Put application in read-only mode during migration
- **Maintenance windows**: Schedule migrations during low-traffic periods
- **Batch processing**: Migrate data in small batches
- **Parallel processing**: Use multiple threads for data migration

### Communication Plan
- **Stakeholder notification**: Inform all affected stakeholders
- **Maintenance announcements**: Communicate planned downtime
- **Status updates**: Provide regular updates during migration
- **Issue escalation**: Clear escalation procedures for problems
- **Post-migration communication**: Confirm successful completion

## Performance Considerations

### Migration Performance
- **Bulk operations**: Use bulk insert/update operations
- **Index management**: Drop indexes before large data changes
- **Parallel processing**: Use multiple connections for large migrations
- **Batch size optimization**: Find optimal batch sizes for operations
- **Resource monitoring**: Monitor CPU, memory, and I/O during migration

### Post-Migration Performance
- **Index rebuilding**: Rebuild indexes after data migration
- **Statistics updates**: Update database statistics
- **Query plan refresh**: Refresh cached query plans
- **Performance tuning**: Optimize queries for new schema
- **Monitoring setup**: Implement performance monitoring

## Common Migration Challenges

### Data Quality Issues
- **Duplicate data**: Handle duplicate records during migration
- **Data format inconsistencies**: Standardize data formats
- **Missing required data**: Handle null values in required fields
- **Referential integrity**: Maintain foreign key relationships
- **Character encoding**: Handle character set conversions

### Technical Challenges
- **Large dataset migrations**: Handle very large data volumes
- **Complex transformations**: Manage complex data transformations
- **Cross-database migrations**: Migrate between different database types
- **Version compatibility**: Handle database version differences
- **Custom extensions**: Migrate custom functions and procedures

## Rollback Procedures

### Rollback Planning
- **Rollback triggers**: Define conditions requiring rollback
- **Rollback procedures**: Document step-by-step rollback process
- **Rollback testing**: Test rollback procedures before migration
- **Data preservation**: Ensure rollback doesn't lose new data
- **Time constraints**: Define maximum time for rollback decision

### Rollback Execution
- **Stop application**: Halt application access to database
- **Restore backup**: Restore from pre-migration backup
- **Apply changes**: Apply any changes made since backup
- **Validate rollback**: Verify system functions correctly
- **Resume operations**: Restart application and resume normal operations

## Notes
- Always test migrations thoroughly in staging environment first
- Have a rollback plan ready before starting any migration
- Monitor system performance closely during and after migration
- Document all migration steps and decisions for future reference
- Consider using migration tools appropriate for your database and framework
- Plan for adequate time and resources for large migrations 