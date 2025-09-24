# Implementation Plan - Web Development Init Workflow

## Code Patterns Analysis
**Existing Patterns Identified:**
- Mini-prompts follow structured format: Goal → Context → Skip conditions → Process → Output
- YAML workflows use phases with steps, prerequisites, dependencies, and validation rules
- Integration tests validate workflow progression and step execution
- MCP server tools handle workflow selection and step navigation

## Implementation Tasks

- [x] 1. Create Mini-Prompts for Analysis Phase
  - Implement the three analysis mini-prompts following existing patterns and structure
  - Each mini-prompt provides specific instructions for project analysis phases
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2_

  - [x] 1.1 Create analyze-project-structure.md mini-prompt
    - Create mini-prompt for project structure and module hierarchy analysis
    - Follow existing pattern: Goal, Context, Skip conditions, Process steps, Output format
    - Include file system scanning, dependency analysis, and methodology classification
    - Output format: structured markdown with project hierarchy and recommendations
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
    
    - [ ] 1.1.1 Critical review and validate project structure mini-prompt
      - Verify mini-prompt follows existing patterns (ask-clarifying-questions.md structure)
      - Test output format produces clear, actionable documentation
      - Validate integration with workflow system

  - [x] 1.2 Create analyze-data-flow.md mini-prompt
    - Create mini-prompt for backend-to-frontend data flow mapping
    - Include API pattern detection, state management analysis, integration points
    - Output format: data flow diagrams and pattern documentation
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
    
    - [ ] 1.2.1 Critical review and validate data flow mini-prompt
      - Verify comprehensive coverage of data patterns (REST, GraphQL, WebSocket)
      - Test state management detection (Redux, Zustand, Context API)
      - Validate documentation format and clarity

  - [x] 1.3 Create analyze-ui-components.md mini-prompt
    - Create mini-prompt for UI component discovery and cataloging
    - Include component scanning, metadata extraction, ui.json generation
    - Handle design system analysis and theme configuration
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
    
    - [ ] 1.3.1 Critical review and validate UI components mini-prompt
      - Verify ui.json output format matches specifications
      - Test component discovery across different frameworks
      - Validate design system analysis accuracy

- [x] 2. Create YAML Workflow File
  - Implement web-development-init.yml following existing workflow patterns
  - Define phases, steps, prerequisites, and validation rules
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 2.1 Create web-development-init.yml workflow structure
    - Define workflow metadata (name, description, category, tags)
    - Create analysis phase with three mini-prompt steps
    - Set up proper prerequisites, dependencies, and skip conditions
    - Follow existing workflow patterns from feature-development.yml and quick-fix.yml
    - _Requirements: 4.1, 4.2, 4.3_
    
    - [ ] 2.1.1 Critical review and validate workflow YAML
      - Verify YAML structure matches existing workflow patterns
      - Test workflow loads correctly in MCP server
      - Validate step dependencies and prerequisites logic

  - [ ] 2.2 Configure workflow for MCP server integration
    - Ensure semantic search compatibility with proper tags and description
    - Add validation rules and skip conditions for smart execution
    - Configure execution settings for automatic progress tracking
    - _Requirements: 4.4, 5.1_
    
    - [ ] 2.2.1 Critical review and validate MCP integration
      - Test workflow appears in semantic search results
      - Verify get_next_step navigation works correctly
      - Validate smart execution and context awareness

- [x] 3. Create Integration Tests
  - Implement comprehensive tests for the new workflow and mini-prompts
  - Follow existing test patterns and ensure quality validation
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [x] 3.1 Add workflow to existing integration tests
    - Add 'web-development-init' to workflow test arrays
    - Ensure workflow progression tests include new workflow
    - Test step-by-step execution and validation
    - _Requirements: 5.1, 5.2_
    
    - [ ] 3.1.1 Critical review and run integration tests
      - Verify all existing tests pass with new workflow included
      - Test workflow progression through all analysis steps
      - Validate context handling and step dependencies

  - [x] 3.2 Create specific tests for web-development-init workflow
    - Test semantic search discovers workflow with appropriate keywords
    - Test mini-prompt execution and output generation
    - Test ui.json generation and validation
    - _Requirements: 5.3, 5.4_
    
    - [ ] 3.2.1 Critical review and validate new workflow tests
      - Verify test coverage for all three analysis phases
      - Test error handling and edge cases
      - Validate output format compliance and quality

- [x] 4. Documentation and Deployment
  - Update workflow embeddings and ensure discoverability
  - Validate end-to-end workflow execution
  - _Requirements: 4.4, 5.4_

  - [x] 4.1 Update workflow embeddings for semantic search
    - Run npm run build:embeddings to include new workflow
    - Test semantic search discovers workflow with relevant queries
    - Verify workflow appears in MCP tools with proper matching
    - _Requirements: 4.4_
    
    - [x] 4.1.1 Critical review and validate semantic search integration
      - Test queries like "web development project setup" find workflow
      - Verify workflow matching percentages are appropriate
      - Validate MCP server returns workflow in available workflows

## Task Dependencies
1. Mini-prompts must be created first (tasks 1.1-1.3)
2. YAML workflow file depends on mini-prompt locations (task 2.1)
3. Tests depend on both mini-prompts and workflow file (task 3.1-3.2)
4. Documentation update happens after all implementation (task 4.1)

## Success Criteria
- [ ] Three analysis mini-prompts created and validated
- [ ] YAML workflow file follows existing patterns and loads correctly
- [ ] Integration tests pass and validate workflow functionality  
- [ ] Semantic search discovers workflow with appropriate keywords
- [ ] End-to-end workflow execution produces expected outputs

## Technical Standards
- **Mini-prompts**: Follow existing markdown structure with Goal, Context, Process, Output sections
- **YAML workflow**: Use established phase/step structure with proper prerequisites and dependencies
- **Tests**: Integrate with existing test suite and follow established patterns
- **Quality**: All deliverables must pass critical review and validation steps
