# Database Migration

## Goal
Execute database schema changes and data migrations safely, ensuring data integrity and minimal downtime.

## Context Required
- Current database schema and structure
- Target schema requirements or migration plan
- Database access and migration tools

## Skip When
- Database already at target schema version
- No schema or data changes required
- Migration handled by dedicated database team
- Using database-as-a-service with automatic migrations

## Complexity Assessment
- **Task Complexity**: Very High - requires database expertise and careful data handling

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Migration Types

### Schema Migrations
- **Table creation** - add new tables
- **Column changes** - add, modify, remove columns
- **Index management** - create, modify, drop indexes
- **Constraint updates** - foreign keys, unique constraints
- **Data type changes** - modify column types and precision

### Data Migrations
- **Data transformation** - convert formats or structures
- **Data consolidation** - merge from multiple sources
- **Data cleanup** - remove duplicates or invalid data
- **Reference updates** - update foreign key relationships
- **Historical data migration** - migrate archived data

### Performance Migrations
- **Index optimization** - add/modify indexes for performance
- **Partitioning** - implement table partitioning
- **Denormalization** - optimize for read performance
- **Query optimization** - improve slow queries
- **Storage optimization** - optimize layout and compression

## Migration Strategies

### Online vs Offline
- **Online** - migration while system operational (minimal downtime)
- **Offline** - migration during scheduled downtime (safer, simpler)

### Execution Approaches
- **Big Bang** - complete migration at once
- **Phased** - break into smaller phases
- **Blue-Green** - parallel environment migration
- **Rolling** - migrate data in batches over time

## Key Migration Tasks

### Pre-Migration
- **Risk Assessment** - data loss, downtime, performance, rollback complexity
- **Backup Strategy** - full database, transaction logs, schema backup
- **Script Development** - forward migration, rollback scripts, validation

### Migration Execution
- **Environment Setup** - prepare migration environment
- **Script Execution** - run migration scripts with monitoring
- **Progress Monitoring** - track migration progress and performance
- **Issue Resolution** - handle errors and unexpected issues

### Post-Migration
- **Data Validation** - verify row counts, integrity, business rules
- **Performance Testing** - ensure performance meets requirements
- **Application Testing** - verify application functionality
- **Documentation** - record migration details and lessons learned

## Database-Specific Tools

### PostgreSQL
- pg_dump/pg_restore, ALTER TABLE, VACUUM, transaction safety

### MySQL
- mysqldump, ALTER TABLE, InnoDB considerations, replication impact

### SQL Server
- SQL Server Backup, T-SQL scripts, Agent jobs, Always On

### Oracle
- Data Pump, SQL*Plus scripts, tablespace management, PL/SQL

## Migration Frameworks

### ORM Tools
- Django migrations, Rails migrations, Entity Framework, Sequelize, Alembic

### Dedicated Tools
- Flyway, Liquibase, gh-ost, pt-online-schema-change, pgloader

### Cloud Tools
- AWS DMS, Azure Database Migration Service, Google Cloud Database Migration

## Validation Checklist

### Data Integrity
- Row count verification before/after
- Referential integrity checks
- Constraint validation
- Data type verification

### Functional Validation
- Business rule compliance
- Application functionality testing
- Query performance validation
- User acceptance testing

### Rollback Preparedness
- Rollback scripts tested
- Backup integrity verified
- Rollback procedures documented
- Recovery time estimated

## Success Criteria
- All schema changes applied successfully
- Data migration completed without loss
- Application functions correctly with new schema
- Performance meets requirements
- Data integrity constraints maintained
- Rollback procedures verified
- Migration completed within planned window

## Key Outputs
- Database successfully migrated to target schema
- Data transformed and migrated correctly
- Data integrity validated and confirmed
- Application functionality verified
- Migration scripts and procedures documented
- Rollback procedures tested and available 