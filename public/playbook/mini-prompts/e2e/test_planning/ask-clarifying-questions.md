# Ask Clarifying Questions

## Purpose
Ask targeted clarifying questions to understand the user's preferences, constraints, and requirements for fixing E2E test failures, ensuring the fix approach aligns with their expectations.

## Context
- **Failure Root Cause**: Analysis of what caused the test failures
- **Module Analysis**: Understanding of how recent changes affect the system
- **Recent Changes Impact**: Assessment of how code changes impact tests
- **User Preferences**: What the user wants to achieve with the fix

## Instructions
1. **Understand Fix Goals**: Clarify what the user wants to achieve
2. **Identify Constraints**: Understand any limitations or constraints
3. **Clarify Priorities**: Determine what's most important in the fix
4. **Understand Timeline**: Get clarity on urgency and timeline requirements
5. **Clarify Scope**: Understand how comprehensive the fix should be
6. **Document Requirements**: Record all clarifications for planning

## Output Format
```json
{
  "clarifying_questions": [
    {
      "question": "What is the primary goal of this fix?",
      "context": "Why this question is important",
      "expected_answer_type": "String/Boolean/Choice",
      "priority": "High/Medium/Low"
    },
    {
      "question": "Are there any time constraints for implementing the fix?",
      "context": "Understanding timeline requirements",
      "expected_answer_type": "String/Date/Choice",
      "priority": "High/Medium/Low"
    },
    {
      "question": "Should the fix maintain backward compatibility?",
      "context": "Understanding compatibility requirements",
      "expected_answer_type": "Boolean",
      "priority": "High/Medium/Low"
    }
  ],
  "user_response_analysis": {
    "primary_goal": "User's stated primary objective",
    "constraints_identified": ["List of constraints mentioned"],
    "timeline_preferences": "User's timeline requirements",
    "priority_areas": ["What the user considers most important"],
    "scope_preferences": "How comprehensive the fix should be"
  },
  "requirements_clarification": {
    "functional_requirements": ["What the fix must accomplish"],
    "non_functional_requirements": ["Performance, security, etc. requirements"],
    "constraints": ["Limitations that must be respected"],
    "assumptions": ["What we're assuming about the fix"]
  },
  "fix_approach_preferences": {
    "preferred_approach": "User's preferred way to fix the issue",
    "avoided_approaches": ["Approaches the user wants to avoid"],
    "risk_tolerance": "How much risk the user is willing to accept",
    "testing_preferences": "How the user wants to validate the fix"
  },
  "business_context": {
    "business_impact": "How this fix affects business operations",
    "user_impact": "How this fix affects end users",
    "stakeholder_priorities": ["What stakeholders consider important"],
    "success_criteria": ["How success will be measured"]
  },
  "next_steps": [
    "Document clarified requirements",
    "Plan fix approach based on clarifications",
    "Get user approval for proposed approach"
  ]
}
```

## Question Guidelines
- **Open-Ended Questions**: Ask questions that encourage detailed responses
- **Specific Focus**: Target questions to specific areas that need clarification
- **Priority Order**: Ask high-priority questions first
- **Context Provision**: Provide context for why each question is important
- **Follow-up Questions**: Be prepared to ask follow-up questions based on responses
- **Documentation**: Record all clarifications for future reference

## Success Criteria
- All critical areas are clarified
- User preferences are understood
- Constraints are identified
- Timeline requirements are clear
- Fix scope is well-defined
- Requirements are documented
