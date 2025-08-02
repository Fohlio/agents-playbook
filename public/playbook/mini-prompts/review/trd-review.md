# TRD Review Prompt (v1)

## 🎯 Goal
Critically assess Technical Requirements Document (TRD) for completeness, clarity, technical feasibility, and alignment with business goals.

## 📥 Context (ask if missing)
1. **TRD Document** – location and version of TRD to review
2. **Original Requirements** – source requirements or user stories
3. **Project Constraints** – budget, timeline, technical limitations
4. **Stakeholders** – who will use/approve this TRD

## 🚦 Skip if
- TRD already peer-reviewed and approved **or** simple feature with minimal technical complexity.

## 🔍 Review Checklist

### **Completeness**
- [ ] All functional requirements covered
- [ ] Non-functional requirements specified (performance, security, scalability)
- [ ] API specifications detailed with examples
- [ ] Data models and schemas defined
- [ ] Integration points identified

### **Technical Feasibility**
- [ ] Architecture approach is realistic and scalable
- [ ] Technology choices justified and appropriate
- [ ] Dependencies and third-party services identified
- [ ] Performance requirements achievable
- [ ] Security considerations adequate

### **Clarity & Communication**
- [ ] Technical concepts explained clearly
- [ ] Assumptions explicitly stated
- [ ] Scope boundaries well-defined
- [ ] Success criteria measurable
- [ ] Implementation strategy logical

### **Risk Assessment**
- [ ] Technical risks identified and mitigated
- [ ] Complexity estimation realistic
- [ ] Potential blockers anticipated
- [ ] Fallback options considered

## 🪞 Self-Reflection Analysis
**MANDATORY FIRST STEP:** Before reviewing TRD, critically assess your own technical design:

### Design Self-Assessment
- **Architecture Quality**: Are my design choices optimal for the requirements and constraints?
- **Technical Feasibility**: Is my approach realistic given available resources and timeline?
- **Completeness**: Did I address all functional and non-functional requirements?
- **Risk Mitigation**: Have I properly identified and planned for potential risks?

### Honest Self-Evaluation
1. What parts of my technical design am I most uncertain about?
2. If I designed this system again today, what would I change?
3. What could go wrong during implementation of this design?
4. How easily could another technical team understand and implement this TRD?

## 📤 Output

**Status**: 🟢 Approved / 🟡 Minor Changes / 🔴 Major Revision

**What Worked Well:**
- [Strengths in design/documentation]

**Critical Issues:**
- [Must-fix problems with specific recommendations]

**Approval Decision:**
- [ ] **Approved**: Ready for implementation
- [ ] **Conditional**: Minor changes needed
- [ ] **Revision**: Major issues must be addressed 