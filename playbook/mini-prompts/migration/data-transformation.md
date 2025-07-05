# Step • Data Transformation

## Purpose
Transform data formats, structures, and schemas to enable migration between systems, improve data quality, or meet new business requirements.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard data processing tools)

**Required Context**:
- Source data format and structure
- Target data format and requirements

**Optional Context**:
- Data mapping and transformation rules
- Data quality requirements and validation rules
- Performance requirements and constraints
- Compliance and regulatory requirements

## Validation Logic
```javascript
canExecute() {
  return hasContext('source_data_format') &&
         hasContext('target_data_format') &&
         hasDataAccess() &&
         requiresTransformation();
}

requiresTransformation() {
  return hasFormatChanges() ||
         hasStructureChanges() ||
         needsDataCleaning() ||
         needsDataEnrichment() ||
         hasSchemaChanges();
}
```

## Process
1. **Analyze data requirements** - Understand source and target data formats and structures
2. **Design transformation logic** - Create mapping rules and transformation procedures
3. **Implement data validation** - Set up data quality checks and validation rules
4. **Develop transformation scripts** - Create automated transformation processes
5. **Test transformation process** - Validate transformation with sample data
6. **Execute data transformation** - Run transformation on production data
7. **Validate transformed data** - Verify data quality and completeness
8. **Document transformation process** - Record transformation logic and procedures

## Inputs
- Source data in current format and structure
- Target data format and schema requirements
- Data mapping and transformation rules
- Data quality requirements and validation criteria
- Business rules and data enrichment requirements

## Outputs
- Data successfully transformed to target format
- Data quality validated and confirmed
- Transformation scripts and procedures documented
- Data validation reports and metrics
- Error handling and exception reports
- Performance metrics and optimization recommendations

## Success Criteria
- All data transformed according to target specifications
- Data quality meets defined standards and requirements
- Transformation process completes within performance requirements
- No data loss or corruption during transformation
- Validation rules pass for all transformed data
- Business rules properly implemented in transformed data
- Documentation complete for future maintenance

## Skip Conditions
- Data already in target format and structure
- No transformation required for current use case
- Transformation handled by dedicated data engineering team
- Using tools that handle transformation automatically

## Transformation Types

### Format Transformation
- **File format conversion**: CSV to JSON, XML to YAML, etc.
- **Data encoding changes**: UTF-8 to ASCII, character set conversions
- **Compression changes**: Compressed to uncompressed formats
- **Binary conversions**: Binary to text or structured formats
- **Protocol changes**: API format changes, message format updates

### Structure Transformation
- **Schema changes**: Modify table structures and relationships
- **Nested to flat**: Convert nested data to flat structures
- **Flat to nested**: Convert flat data to hierarchical structures
- **Column mapping**: Map source columns to target columns
- **Table restructuring**: Combine or split tables and entities

### Data Type Transformation
- **Type conversion**: String to numeric, date format changes
- **Precision changes**: Modify decimal precision or numeric ranges
- **Unit conversion**: Convert units of measurement
- **Currency conversion**: Convert between different currencies
- **Timezone conversion**: Convert timestamps between timezones

### Data Enrichment
- **Lookup enrichment**: Add data from reference tables
- **Calculated fields**: Create derived fields from source data
- **Data standardization**: Standardize formats and values
- **Address normalization**: Standardize address formats
- **Data classification**: Add classification tags and metadata

## Data Quality Management

### Data Profiling
- **Data discovery**: Understand source data characteristics
- **Pattern analysis**: Identify data patterns and anomalies
- **Quality assessment**: Assess data completeness and accuracy
- **Relationship analysis**: Understand data relationships and dependencies
- **Metadata extraction**: Extract and document data metadata

### Data Cleaning
- **Duplicate removal**: Identify and remove duplicate records
- **Data standardization**: Standardize formats and values
- **Null value handling**: Handle missing and null values
- **Outlier detection**: Identify and handle data outliers
- **Format correction**: Fix formatting inconsistencies

### Data Validation
- **Completeness checks**: Ensure all required data is present
- **Accuracy validation**: Verify data accuracy against business rules
- **Consistency checks**: Ensure data consistency across sources
- **Integrity validation**: Verify referential integrity constraints
- **Business rule validation**: Ensure data meets business requirements

## Transformation Tools and Technologies

### ETL Tools
- **Apache Airflow**: Workflow orchestration for data pipelines
- **Talend**: Comprehensive data integration platform
- **Pentaho**: Open source data integration tools
- **Informatica**: Enterprise data integration platform
- **Microsoft SSIS**: SQL Server Integration Services

### Programming Languages
- **Python**: pandas, NumPy for data manipulation
- **R**: Statistical computing and data analysis
- **SQL**: Database transformation and manipulation
- **Scala**: Apache Spark for big data processing
- **Java**: Enterprise data processing applications

### Big Data Tools
- **Apache Spark**: Distributed data processing framework
- **Apache Kafka**: Stream processing and data pipelines
- **Apache NiFi**: Data flow automation and management
- **Apache Beam**: Unified batch and stream processing
- **Hadoop ecosystem**: MapReduce, Hive, Pig for big data

### Cloud Services
- **AWS Glue**: Serverless ETL service
- **Azure Data Factory**: Cloud data integration service
- **Google Cloud Dataflow**: Stream and batch data processing
- **Amazon EMR**: Managed big data platform
- **Azure Databricks**: Analytics platform for big data

## Transformation Design

### Mapping Design
- **Field mapping**: Map source fields to target fields
- **Transformation rules**: Define data transformation logic
- **Default values**: Specify default values for missing data
- **Conditional logic**: Implement conditional transformation rules
- **Lookup tables**: Define reference data for enrichment

### Error Handling
- **Error detection**: Identify and categorize transformation errors
- **Error logging**: Log all errors with detailed information
- **Error recovery**: Implement recovery procedures for errors
- **Exception handling**: Handle edge cases and exceptions
- **Data quarantine**: Isolate problematic data for review

### Performance Optimization
- **Batch processing**: Process data in optimal batch sizes
- **Parallel processing**: Use multiple threads for transformation
- **Memory management**: Optimize memory usage for large datasets
- **Incremental processing**: Process only changed data
- **Index optimization**: Optimize database indexes for performance

## Specific Transformation Scenarios

### Database Migration
- **Schema transformation**: Convert between different database schemas
- **Data type mapping**: Map data types between database systems
- **Constraint migration**: Transfer foreign keys and constraints
- **Index migration**: Recreate indexes in target database
- **Stored procedure conversion**: Convert database procedures

### API Integration
- **Message format transformation**: Convert between API formats
- **Protocol conversion**: Convert between REST, SOAP, GraphQL
- **Authentication mapping**: Map authentication mechanisms
- **Rate limiting**: Handle different rate limiting requirements
- **Error code mapping**: Map error codes between systems

### Legacy System Migration
- **Mainframe data conversion**: Convert mainframe data formats
- **Fixed-width to delimited**: Convert fixed-width files
- **COBOL copybook processing**: Handle COBOL data structures
- **Character encoding**: Handle legacy character encodings
- **Binary format conversion**: Convert proprietary binary formats

### Real-time Processing
- **Stream processing**: Transform streaming data in real-time
- **Event transformation**: Transform event formats and structures
- **Message routing**: Route messages based on content
- **Data filtering**: Filter data based on business rules
- **Aggregation**: Aggregate streaming data for analytics

## Testing and Validation

### Unit Testing
- **Function testing**: Test individual transformation functions
- **Data validation testing**: Test validation rules and logic
- **Error handling testing**: Test error scenarios and edge cases
- **Performance testing**: Test transformation performance
- **Integration testing**: Test end-to-end transformation process

### Data Testing
- **Sample data testing**: Test with representative data samples
- **Edge case testing**: Test with boundary and edge case data
- **Volume testing**: Test with production-volume data
- **Stress testing**: Test under high load conditions
- **Regression testing**: Ensure changes don't break existing logic

### Validation Procedures
- **Record count validation**: Verify record counts match expectations
- **Data integrity checks**: Verify data relationships and constraints
- **Business rule validation**: Ensure business rules are correctly applied
- **Performance benchmarks**: Validate performance meets requirements
- **Quality metrics**: Measure and report data quality metrics

## Monitoring and Maintenance

### Process Monitoring
- **Job monitoring**: Monitor transformation job execution
- **Performance monitoring**: Track transformation performance metrics
- **Error monitoring**: Monitor and alert on transformation errors
- **Data quality monitoring**: Continuously monitor data quality
- **Resource monitoring**: Monitor system resource usage

### Maintenance Activities
- **Logic updates**: Update transformation logic for new requirements
- **Performance tuning**: Optimize transformation performance
- **Error resolution**: Resolve and prevent transformation errors
- **Documentation updates**: Keep transformation documentation current
- **Testing updates**: Update test cases for new requirements

### Compliance and Auditing
- **Audit trails**: Maintain logs of all transformation activities
- **Data lineage**: Track data lineage through transformation process
- **Compliance reporting**: Generate reports for regulatory compliance
- **Change management**: Document and approve transformation changes
- **Version control**: Maintain version control for transformation logic

## Security and Privacy

### Data Protection
- **Data encryption**: Encrypt sensitive data during transformation
- **Access controls**: Implement appropriate access controls
- **Data masking**: Mask sensitive data in non-production environments
- **Privacy compliance**: Ensure compliance with privacy regulations
- **Secure transport**: Use secure protocols for data transfer

### Sensitive Data Handling
- **PII protection**: Protect personally identifiable information
- **Data anonymization**: Anonymize data where appropriate
- **Consent management**: Handle data consent requirements
- **Right to be forgotten**: Implement data deletion capabilities
- **Cross-border transfers**: Handle international data transfer requirements

## Notes
- Plan transformation carefully with thorough data analysis
- Implement comprehensive data validation and quality checks
- Test transformation thoroughly with representative data
- Monitor transformation performance and optimize as needed
- Document transformation logic for future maintenance and updates
- Consider data security and privacy requirements throughout the process 