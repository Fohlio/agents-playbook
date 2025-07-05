# Step • Architecture Analysis

## Purpose
Analyze system architecture, component relationships, and design decisions to understand overall system structure and identify improvement opportunities.

## Prerequisites
**Required MCP Servers**: 
- None (uses standard coding agent tools)

**Required Context**:
- System or feature scope for analysis
- Access to codebase and documentation

**Optional Context**:
- Existing architecture documentation
- Performance monitoring data
- Deployment and infrastructure information
- Business requirements and constraints

## Validation Logic
```javascript
canExecute() {
  return hasContext('system_scope') &&
         hasContext('codebase_access');
}
```

## Process
1. **Map system components** - Identify all major components and their responsibilities
2. **Analyze component interactions** - Understand how components communicate and depend on each other
3. **Review architectural patterns** - Identify patterns, styles, and design decisions
4. **Assess data architecture** - Analyze data flow, storage, and management
5. **Evaluate scalability and performance** - Review architectural support for scale and performance
6. **Examine security architecture** - Assess security design and implementation
7. **Document architectural findings** - Create comprehensive architecture analysis

## Inputs
- System codebase and documentation
- Existing architecture diagrams (if available)
- Deployment and infrastructure information
- Performance and monitoring data
- Business requirements and constraints

## Outputs
- System architecture diagram (current state)
- Component interaction map
- Data flow and architecture documentation
- Architectural pattern analysis
- Scalability and performance assessment
- Security architecture review
- Technical debt and improvement recommendations
- Future architecture recommendations

## Success Criteria
- Complete understanding of system architecture
- All major components and interactions identified
- Architectural patterns and decisions documented
- Scalability and performance characteristics understood
- Security architecture thoroughly assessed
- Clear recommendations for improvements
- Future evolution path outlined

## Skip Conditions
- System is very simple with obvious architecture
- Architecture analysis was completed in previous session
- Only minor changes that don't affect architecture
- Emergency fix where architecture review is not needed

## Analysis Dimensions

### Component Architecture
- **Service Boundaries**: How functionality is divided into services/modules
- **Component Responsibilities**: What each component does and owns
- **Interface Design**: How components expose functionality to others
- **Deployment Units**: How components are packaged and deployed
- **Lifecycle Management**: How components are created, updated, and destroyed

### Integration Architecture
- **Communication Patterns**: Synchronous vs asynchronous communication
- **Data Exchange**: How data is shared between components
- **Protocol Standards**: HTTP, messaging, events, etc.
- **API Design**: RESTful, GraphQL, RPC patterns
- **Error Handling**: How failures are handled across component boundaries

### Data Architecture
- **Data Storage**: Databases, file systems, caches, etc.
- **Data Flow**: How data moves through the system
- **Data Consistency**: ACID properties, eventual consistency, transactions
- **Data Access Patterns**: CRUD operations, queries, aggregations
- **Data Security**: Encryption, access control, data privacy

### Scalability Architecture
- **Horizontal Scaling**: How system scales across multiple instances
- **Vertical Scaling**: How system utilizes increased resources
- **Load Distribution**: Load balancers, sharding, partitioning
- **Caching Strategy**: What is cached and at what layers
- **Resource Management**: CPU, memory, storage, network utilization

### Security Architecture
- **Authentication**: How users and services are identified
- **Authorization**: How access control is implemented
- **Data Protection**: Encryption at rest and in transit
- **Security Boundaries**: Trust zones and security perimeters
- **Threat Model**: What threats the architecture protects against

## Architectural Patterns Analysis

### Monolithic Patterns
- **Layered Architecture**: Presentation, business, data layers
- **Modular Monolith**: Well-organized modules within single deployment
- **Advantages**: Simplicity, consistency, easy deployment
- **Disadvantages**: Scaling limitations, technology lock-in

### Distributed Patterns
- **Microservices**: Small, independent, loosely coupled services
- **Service-Oriented Architecture (SOA)**: Enterprise service integration
- **Event-Driven Architecture**: Asynchronous event-based communication
- **Advantages**: Scalability, technology diversity, fault isolation
- **Disadvantages**: Complexity, network latency, data consistency

### Data Patterns
- **Database per Service**: Each service owns its data
- **Shared Database**: Multiple services access common database
- **CQRS**: Command Query Responsibility Segregation
- **Event Sourcing**: Store events rather than current state

### Integration Patterns
- **API Gateway**: Single entry point for external requests
- **Service Mesh**: Infrastructure layer for service communication
- **Message Queues**: Asynchronous message-based communication
- **Circuit Breaker**: Fault tolerance for external service calls

## Quality Attributes Assessment

### Performance
- **Throughput**: Requests handled per unit time
- **Latency**: Response time for individual requests
- **Resource Utilization**: CPU, memory, storage, network usage
- **Bottlenecks**: System constraints limiting performance

### Reliability
- **Availability**: System uptime and accessibility
- **Fault Tolerance**: Ability to handle component failures
- **Recovery**: How quickly system recovers from failures
- **Data Integrity**: Consistency and accuracy of data

### Scalability
- **Elastic Scaling**: Automatic scaling based on load
- **Load Handling**: Maximum load system can handle
- **Resource Efficiency**: How well resources are utilized
- **Growth Potential**: Ability to handle future growth

### Maintainability
- **Modularity**: How well system is broken into manageable pieces
- **Testability**: How easy it is to test system components
- **Deployability**: How easy it is to deploy changes
- **Observability**: How well system behavior can be monitored

### Security
- **Confidentiality**: Protection of sensitive data
- **Integrity**: Prevention of unauthorized data modification
- **Availability**: Protection against denial of service
- **Auditability**: Ability to track and audit actions

## Analysis Techniques

### Architecture Documentation Review
- Study existing architecture diagrams and documentation
- Review design decision records and rationale
- Examine API documentation and contracts
- Analyze deployment and infrastructure descriptions

### Code Structure Analysis
- Map code organization to architectural components
- Identify dependency relationships between modules
- Analyze interface definitions and contracts
- Review configuration and deployment scripts

### Runtime Behavior Analysis
- Monitor system behavior under load
- Trace request flows through system components
- Analyze performance metrics and bottlenecks
- Observe error handling and recovery patterns

### Stakeholder Interviews
- Understand business requirements and constraints
- Learn about operational challenges and pain points
- Gather insights about future requirements
- Identify non-functional requirements

## Documentation Format
- **Architecture Overview**: High-level system description
- **Component Catalog**: Detailed component descriptions
- **Interaction Diagrams**: How components communicate
- **Data Flow Diagrams**: How data moves through system
- **Quality Attribute Analysis**: Performance, security, scalability assessment
- **Pattern Analysis**: Architectural patterns identified
- **Issues and Recommendations**: Problems found and suggested improvements
- **Future Vision**: Recommended evolution path

## Common Architecture Issues
- **Tight Coupling**: Components too dependent on each other
- **Shared Database**: Multiple services accessing same database
- **Distributed Monolith**: Microservices with monolithic characteristics
- **API Versioning**: Poor handling of API evolution
- **Data Consistency**: Inconsistent data across services
- **Performance Bottlenecks**: Single points of failure or slowness

## Notes
- Focus on understanding the "why" behind architectural decisions
- Consider both current requirements and future evolution needs
- Balance theoretical best practices with practical constraints
- Document assumptions and areas needing further investigation
- Consider operational aspects like monitoring, deployment, and maintenance 