# Data Transformation

## Goal
Transform data formats, structures, and schemas to enable migration between systems, improve data quality, or meet new business requirements.

## Context Required
- Source data format and structure
- Target data format and requirements
- Data mapping and transformation rules

## Skip When
- Data already in target format and structure
- No transformation required for current use case
- Transformation handled by dedicated data engineering team
- Using tools that handle transformation automatically

## Complexity Assessment
- **Task Complexity**: High - requires data engineering and transformation expertise

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Transformation Types

### Format Transformation
- **File format conversion** - CSV ↔ JSON ↔ XML ↔ YAML
- **Data encoding changes** - UTF-8 ↔ ASCII, character set conversions
- **Compression changes** - compressed ↔ uncompressed formats
- **Binary conversions** - binary ↔ text ↔ structured formats
- **Protocol changes** - API format changes, message format updates

### Structure Transformation
- **Schema changes** - modify table structures and relationships
- **Nested ↔ flat** - convert between hierarchical and flat structures
- **Column mapping** - map source columns to target columns
- **Table restructuring** - combine or split tables and entities
- **Data normalization** - normalize/denormalize data structures

### Data Type Transformation
- **Type conversion** - string ↔ numeric, date format changes
- **Precision changes** - modify decimal precision or numeric ranges
- **Unit conversion** - convert units of measurement
- **Currency conversion** - convert between different currencies
- **Timezone conversion** - convert timestamps between timezones

### Data Enrichment
- **Lookup enrichment** - add data from reference tables
- **Calculated fields** - create derived fields from source data
- **Data standardization** - standardize formats and values
- **Address normalization** - standardize address formats
- **Data classification** - add classification tags and metadata

## Data Quality Management

### Data Profiling
- Data discovery and pattern analysis
- Quality assessment and relationship analysis
- Metadata extraction and documentation

### Data Cleaning
- **Duplicate removal** - identify and remove duplicate records
- **Data standardization** - standardize formats and values
- **Null value handling** - handle missing and null values
- **Outlier detection** - identify and handle data outliers
- **Format correction** - fix formatting inconsistencies

### Data Validation
- **Completeness** - ensure all required data present
- **Accuracy** - verify data accuracy against business rules
- **Consistency** - ensure data consistency across sources
- **Integrity** - verify referential integrity constraints
- **Business rules** - ensure data meets business requirements

## Transformation Tools

### ETL Platforms
- Apache Airflow, Talend, Pentaho, Informatica, Microsoft SSIS

### Programming Languages
- **Python** - pandas, NumPy for data manipulation
- **R** - statistical computing and data analysis
- **SQL** - database transformation and manipulation
- **Scala** - Apache Spark for big data processing

### Big Data Tools
- Apache Spark, Kafka, NiFi, Beam, Hadoop ecosystem

### Cloud Services
- AWS Glue, Azure Data Factory, Google Cloud Dataflow, Amazon EMR

## Key Transformation Tasks

### Design Phase
- **Field mapping** - map source fields to target fields
- **Transformation rules** - define data transformation logic
- **Default values** - specify defaults for missing data
- **Conditional logic** - implement conditional transformation rules
- **Lookup tables** - define reference data for enrichment

### Implementation Phase
- **Batch processing** - process data in optimal batch sizes
- **Parallel processing** - use multiple threads for performance
- **Memory management** - optimize memory usage for large datasets
- **Incremental processing** - process only changed data
- **Error handling** - implement error detection and recovery

### Validation Phase
- **Data integrity checks** - verify transformation accuracy
- **Performance validation** - ensure performance requirements met
- **Business rule validation** - verify business rules compliance
- **Error analysis** - analyze and resolve transformation errors
- **Quality metrics** - measure data quality improvements

## Common Scenarios

### Database Migration
- Schema transformation and data type mapping
- Constraint and index migration
- Stored procedure conversion

### API Integration
- Message format transformation (REST ↔ SOAP ↔ GraphQL)
- Authentication mapping and protocol conversion
- Rate limiting and error code mapping

### Legacy System Migration
- Legacy format to modern structure conversion
- Data modernization and quality improvement
- System integration and compatibility

## Success Criteria
- All data transformed according to target specifications
- Data quality meets defined standards
- Transformation completes within performance requirements
- No data loss or corruption during transformation
- Validation rules pass for all transformed data
- Business rules properly implemented
- Documentation complete for future maintenance

## Key Outputs
- Data successfully transformed to target format
- Data quality validated and confirmed
- Transformation scripts and procedures documented
- Data validation reports and metrics
- Error handling and exception reports
- Performance metrics and optimization recommendations 