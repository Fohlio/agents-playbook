# Create Requirements Document

## Objective
Gather high-level product requirements through clarifying questions, structure them comprehensively, and write them to `.agents-playbook/<product-slug>/requirements.md`.

## Context Required
- **product_slug**: The unique identifier/slug for the product (e.g., "task-manager", "analytics-dashboard")
- **product_name**: The human-readable name of the product
- **product_summary** (optional): Brief description of the product
- **stakeholders** (optional): Key stakeholders and their roles
- **personas** (optional): Target user personas
- **business_context** (optional): Business goals and constraints

## Instructions

### 1. Gather Requirements
Ask clarifying questions to understand:
- What problem does this product solve?
- Who are the target users?
- What are the core features needed?
- What are the business goals and success metrics?
- Are there any technical constraints or dependencies?
- What is explicitly out of scope?

Conduct a thorough requirements analysis similar to the `create-structured-requirements` mini-prompt.

### 2. Prepare Output Path
Calculate the absolute output path:
```
.agents-playbook/<product_slug>/requirements.md
```

Ensure the parent directory `.agents-playbook/<product_slug>/` exists. Create it if necessary.

### 2. Structure the Requirements File

Create a well-organized markdown file with the following sections:

```markdown
# Product Requirements

## Overview
[Brief description of the product and its purpose]

## Goals and Objectives
[High-level goals this product aims to achieve]

## User Personas
[Target users and their characteristics]

## Functional Requirements
### Core Features
- [Feature 1]
- [Feature 2]
- [Feature N]

### User Workflows
[Key user journeys and workflows]

## Non-Functional Requirements
### Performance
[Performance expectations]

### Security
[Security requirements]

### Scalability
[Scalability considerations]

### Accessibility
[Accessibility requirements]

## Constraints and Assumptions
[Known limitations, dependencies, or assumptions]

## Success Metrics
[How success will be measured]

## Out of Scope
[What is explicitly not included in this version]
```

### 3. Populate Content
- Use information gathered from clarifying questions
- Extract relevant information from optional context (product_summary, stakeholders, personas, business_context)
- Use clear, concise language
- Include specific, measurable requirements where possible
- Organize logically from high-level to detailed

### 4. Write the File
Write the formatted content to the calculated output path.

### 5. Return Output
Set the output context:
```
requirements_file_path: .agents-playbook/<product_slug>/requirements.md
structured_requirements: [gathered requirements data structure]
```

Store the structured requirements in context for use by subsequent steps (design-architecture, planning).

## Output Format
The file should be:
- Well-formatted markdown
- Comprehensive yet readable
- Structured with clear headings
- Include all key requirements from the analysis phase

## Validation
- File created at correct location
- All major sections populated
- Content is clear and actionable
- Path stored in context for later reference

