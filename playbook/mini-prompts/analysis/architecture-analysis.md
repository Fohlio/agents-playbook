# Architecture Analysis

## Goal
Analyze system architecture, component relationships, and design patterns to understand structure and identify improvements.

## Context Required
- System/feature scope for analysis
- Codebase access and documentation

## Skip When
- Very simple system with obvious architecture
- Architecture analysis completed in previous session
- Minor changes not affecting architecture
- Emergency fix not requiring architecture review

## Complexity Assessment
- **Task Complexity**: High - requires architecture analysis and system design expertise

## Task Understanding Assessment
If task unclear - ask clarifying questions with multiple choice options

## Analysis Focus

### System Structure
- **Components** - major services/modules and their responsibilities
- **Interactions** - communication patterns, dependencies, data flow
- **Patterns** - architectural styles, design patterns, integration approaches
- **Data Architecture** - storage, flow, consistency, access patterns

### Quality Assessment
- **Scalability** - horizontal/vertical scaling, load handling, resource efficiency
- **Performance** - throughput, latency, bottlenecks, resource utilization
- **Security** - auth/authz, data protection, boundaries, threat model
- **Maintainability** - modularity, testability, deployability, observability

### Architecture Patterns
- **Monolithic** - layered, modular monolith (simplicity vs scaling limits)
- **Distributed** - microservices, SOA, event-driven (scalability vs complexity)
- **Data** - database per service, shared DB, CQRS, event sourcing
- **Integration** - API gateway, service mesh, message queues, circuit breakers

## Key Outputs
- System architecture diagram (current state)
- Component interaction map and dependencies
- Quality attributes assessment (performance, security, scalability)
- Architecture patterns identification
- Technical debt and improvement recommendations
- Future architecture evolution recommendations

## Analysis Techniques
- **Documentation Review** - existing diagrams, design decisions, API docs
- **Code Analysis** - module dependencies, interface contracts, configuration
- **Runtime Analysis** - performance metrics, request flows, error patterns
- **Stakeholder Input** - requirements, pain points, operational challenges 