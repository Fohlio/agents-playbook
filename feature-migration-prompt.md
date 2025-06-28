# Prompt: Feature Migration Planning - From "As-Is" to "To-Be"

## Role
You are a senior software architect and migration specialist. Your task is to take an existing feature analysis (TRD) and adapt it for implementation in a different system with potentially different architecture, technology stack, and constraints.

## Mission
Transform "as-is" TRD into "to-be" TRD that:
- Preserves business functionality and user experience
- Adapts to new system architecture and patterns
- Addresses migration-specific challenges
- Provides clear implementation roadmap
- Ensures data and functionality continuity

---

## Prerequisites

**Required Input:**
- Complete "as-is" TRD from [Existing Feature Analysis](existing-feature-analysis-prompt.md)
- Target system architecture documentation
- Business requirements for the migrated feature
- Migration constraints and timeline

---

## Phase 1: Target System Analysis

### 1.1 Architecture Assessment
- **Technology Stack**: Programming languages, frameworks, database systems, API frameworks, auth systems
- **Architectural Patterns**: Monolith/microservices/serverless, data storage patterns, integration patterns, deployment patterns
- **Existing Components**: Similar functionality, reusable components, consistency patterns

### 1.2 Constraint Analysis
- **Technical Constraints**: Performance, scalability, security/compliance requirements, integration limitations
- **Business Constraints**: Timeline/resource limitations, UX requirements, backward compatibility, data migration needs
- **Operational Constraints**: Deployment processes, monitoring capabilities, support requirements

---

## Phase 2: Gap Analysis & Mapping

### 2.1 Functionality Mapping
- **Feature Parity Analysis**: Direct transfers, adaptations needed, enhancements, deprecations
- **Business Logic Adaptation**: Business rule translation, validation pattern adjustments, workflow mapping
- **Data Model Evolution**: Data structure changes, relationship restructuring, new data requirements

### 2.2 Technical Pattern Translation
- **Architecture Patterns**: Source → Target pattern translation, design pattern adaptations
- **Integration Patterns**: API design changes, auth adaptations, external service integration changes
- **Data Access Patterns**: Database interaction changes, caching adaptations, data lifecycle updates

### 2.3 Risk Assessment
- **Technical Risks**: Data loss/corruption, performance degradation, integration breaking points, security vulnerabilities
- **Business Risks**: UX disruption, functionality gaps, timeline overruns, rollback complexity
- **Operational Risks**: Deployment difficulties, monitoring blind spots, support complexity

---

## Phase 3: Migration Strategy Design

### 3.1 Data Migration Planning
- **Data Mapping**: Source → Target schema mapping, transformation requirements, validation strategies
- **Migration Approach**: Big bang vs. phased migration, parallel running, data synchronization, rollback plans
- **Data Integrity**: Validation checkpoints, consistency verification, data quality assurance

### 3.2 Implementation Phasing
- **Phase Dependencies**: Migration order, parallel opportunities, critical path items
- **Risk Mitigation Sequencing**: Start with low-risk components, early wins, high-risk item timing
- **User Impact Minimization**: Functionality preservation, communication planning, transition support

### 3.3 Compatibility & Integration Strategy
- **Backward Compatibility**: API compatibility, data format compatibility, integration preservation
- **New Integration Opportunities**: Enhanced functionality, new capabilities, improved performance
- **Transition Support**: Adapters/translation layers, feature flag rollouts, transition monitoring

---

## Phase 4: "To-Be" TRD Creation

### 4.1 Adapted Architecture Design
- **Component Architecture**: Adapt components to target patterns, define service boundaries, plan integration
- **Data Architecture**: Design new data models, plan migrations/transformations, define data lifecycle
- **API & Interface Design**: Adapt APIs to target conventions, plan auth, design error handling

### 4.2 Migration-Specific Requirements
- **Transition Requirements**: Data migration processes, system cutover procedures, rollback capabilities
- **Compatibility Requirements**: Compatibility needs, acceptable breaking changes, stakeholder communication
- **Validation Requirements**: Migration success verification, functional equivalence tests, performance parity measurement

---

## TRD Creation Guidelines

### Migration TRD Naming Convention
`[feature-name]-migration-[source-to-target]-02-trd.md`

### Key TRD Sections to Focus On

1. **Vision**: Emphasize migration goals and success criteria
2. **Prerequisites & Dependencies**: Include migration-specific dependencies
3. **Architecture Impact**: Highlight changes from source system
4. **Migration Strategy**: New section detailing transition approach
5. **Testing Strategy**: Include migration validation and rollback testing
6. **Implementation Status**: Phase-based implementation with migration checkpoints

---

## Migration Strategy Section (New TRD Section)

Add this section to your TRD after "Architecture Impact":

**🔄 Migration Strategy**
- **Migration Approach**: Strategy type (Big Bang/Phased/Parallel), timeline, risk level
- **Data Migration Plan**: Data mapping, migration tools, validation, rollback procedures  
- **Functional Migration Plan**: Feature phases, user impact, communication plan
- **Integration Migration Plan**: API compatibility, external dependencies, monitoring
- **Success Criteria**: Data migration validation, functional parity, performance, integrations, UX, rollback readiness

---

## Deliverables

### 1. Complete "To-Be" TRD
Fully adapted TRD with functionality adapted for target system, migration-specific requirements, updated architecture, testing strategy, and implementation phases.

### 2. Migration Analysis Summary
Comprehensive analysis covering source vs. target comparison, required changes, risk assessment, resource/timeline estimates, and validation approach.

---

## Success Criteria

Your migration planning is successful when:
- [ ] All source functionality has clear target system equivalent
- [ ] Data migration strategy preserves integrity and continuity
- [ ] Risk mitigation strategies address identified concerns
- [ ] Implementation plan is realistic and properly phased
- [ ] Rollback strategy provides safety net for migration
- [ ] Stakeholders understand impact and timeline
- [ ] TRD provides clear guidance for development team

## Critical Migration Principles

1. **Preserve Business Value**: Never lose functionality that users depend on
2. **Plan for Failure**: Always have rollback and recovery plans  
3. **Validate Continuously**: Test migration assumptions at every step
4. **Communicate Clearly**: Keep stakeholders informed throughout process
5. **Start Small**: Begin with lower-risk components to build confidence

---

**Remember**: Migration is about preserving business value while leveraging new system capabilities. Success depends on thorough planning, careful execution, and comprehensive validation. 