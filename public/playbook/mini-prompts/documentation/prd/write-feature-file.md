# Create Feature Breakdown

## Objective
Analyze requirements and design specifications to create implementation plan broken down into phases and features, then generate individual feature files under `.agents-playbook/<product-slug>/features/` with comprehensive documentation and ready-to-use prompts.

## Context Required
- **structured_requirements**: The requirements from the requirements phase
- **design_specifications**: The technical architecture from design phase
- **product_slug**: The unique identifier/slug for the product
- **design_system_specifications** (optional): Design system details
- **phase_breakdown** (optional): Custom phase organization

## Instructions

### 1. Feature Planning Analysis
Based on requirements and design specifications:
- Break down the product into logical development phases
- Identify individual features within each phase
- Define dependencies between features
- Prioritize features based on business value and technical dependencies
- Estimate effort and complexity for each feature
- Create acceptance criteria for each feature

Conduct thorough implementation planning similar to the `create-implementation-plan` mini-prompt.

### 2. Prepare Output Directory
Calculate the base directory:
```
.agents-playbook/<product_slug>/features/
```

Ensure this directory exists. Create it if necessary.

### 2. Process Each Feature

For each feature identified in the planning analysis:

#### a) Generate Feature Slug
Create a URL-friendly slug from the feature name:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters
- Example: "User Authentication" → "user-authentication"

#### b) Structure Feature File

Create a markdown file with frontmatter and content:

```markdown
---
feature: [Human-readable feature title]
slug: [feature-slug]
phase: [Phase N or phase name]
status: planned
priority: [high|medium|low]
estimated_effort: [small|medium|large|xl]
---

# [Feature Title]

## Description
[Detailed description of the feature and its purpose]

## User Story
As a [user type], I want to [action], so that [benefit].

## Acceptance Criteria
- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion N]

## Technical Considerations
[Key technical requirements, dependencies, or constraints]

## Dependencies
- [Other features or systems this depends on]

## Success Metrics
[How to measure if this feature is successful]

## Feature Development Prompt
Use this prompt with the **feature-development workflow**:

> Implement the [feature name] feature for [product_name]. This feature should [brief description].
>
> Requirements:
> - [Key requirement 1]
> - [Key requirement 2]
>
> Acceptance Criteria:
> - [Criterion 1]
> - [Criterion 2]
>
> Technical Context:
> - Refer to design specifications in `design.md`
> - Follow architecture patterns defined in the PRD
> - Integrate with existing [related features]

## Notes
[Additional notes, edge cases, or future considerations]
```

#### c) Populate Content
- Use feature details from planning analysis
- Derive phase from `phase_breakdown` or planning analysis
- Extract relevant design and architecture details from `design_specifications`
- Reference design system components from `design_system_specifications` if available
- Create clear, actionable acceptance criteria
- Write a self-contained prompt that can be used with the feature-development workflow
- Ensure the prompt references the appropriate context files

#### d) Write Feature File
Write the formatted content to:
```
.agents-playbook/<product_slug>/features/<feature-slug>.md
```

### 3. Track Created Files
Maintain a list of all created feature file paths.

### 4. Return Output
Set the output context:
```
feature_files: [
  ".agents-playbook/<product_slug>/features/<feature-1-slug>.md",
  ".agents-playbook/<product_slug>/features/<feature-2-slug>.md",
  ...
]
feature_list: [structured list of features with metadata]
```

Store both the file paths and structured feature list in context for the final PRD assembly.

## Output Format
Each feature file should be:
- Self-contained and complete
- Include proper frontmatter with phase information
- Have clear acceptance criteria
- Contain a ready-to-use feature development prompt
- Reference design and requirements documents

## Best Practices
- Keep feature files focused and atomic
- Make prompts specific enough to be actionable
- Include technical context relevant to the feature
- Cross-reference dependencies between features
- Use consistent formatting across all feature files

## Validation
- All feature files created in correct directory
- Each file has proper frontmatter
- Feature development prompts are clear and complete
- All file paths tracked in output context
- Files are well-organized and easily discoverable

