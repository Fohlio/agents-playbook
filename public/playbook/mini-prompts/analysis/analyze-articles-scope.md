# Analyze Articles Scope & Research Prompt (v1)

## 🎯 Goal
Research topic landscape, define audience, and clarify article requirements through competitive analysis and targeted questioning.

## 📥 Context (ask if missing)
1. **Topic Idea** – basic article concept or subject area
2. **Target Platform** – Habr, Medium, dev.to, technical blog
3. **Content Goals** – educate, share experience, promote tool, thought leadership

## 🚦 Skip if
Topic scope is extremely narrow and well-defined with no existing content to analyze.

## 🔍 Clarifying Questions
Ask targeted questions to understand scope and requirements:

**Content Focus:**
- What specific problem or question will this article solve?
- What's the main takeaway readers should have?
- What examples or use cases should be included?

**Audience & Depth:**
- Who is the primary reader? (role, experience level)
- What can we assume they already know?
- Should this be beginner-friendly or assume technical knowledge?

**Scope & Format:**
- What article type works best? (tutorial, case study, opinion, comparison)
- Rough target length? (quick read vs comprehensive guide)
- Any specific technologies or tools to focus on?

## 🔍 Research Process
- [ ] **Find 3-5 existing articles** on similar topics
- [ ] **Identify content gaps** – what's missing or could be improved
- [ ] **Locate primary sources** – official docs, expert opinions
- [ ] **Define competitive advantage** – how will your article be different/better

## 📤 Output
**File:** `.agents-playbook/[article-topic]/article-requirements.md`

```markdown
# Article Requirements

## Topic & Scope
- **Article Focus:** [Main problem/question being addressed]
- **Article Type:** [Tutorial/Guide/Case Study/Opinion/Comparison]
- **Target Length:** [Rough word count or reading time]
- **Key Technologies:** [Languages, tools, frameworks covered]

## Target Audience
- **Primary Readers:** [Role, experience level]
- **Knowledge Assumptions:** [What they already know]
- **Reader Goals:** [What they want to achieve]

## Research Findings
- **Similar Articles:** [3-5 existing articles with brief notes]
- **Content Gap:** [What's missing that your article will provide]
- **Primary Sources:** [Official docs, expert content, case studies]

## Content Requirements
- **Must Cover:** [Essential topics and examples]
- **Should Include:** [Important but optional content]
- **Success Metrics:** [How you'll measure article success]
```
