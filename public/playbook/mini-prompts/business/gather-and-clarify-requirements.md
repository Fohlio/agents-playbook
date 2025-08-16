# Gather Requirements & Clarify Prompt (v4)

## 🎯 Goal
Extract crystal-clear business requirements by asking clarifying questions in chat, then document them.

## 📋 Context Assessment
Before gathering requirements, assess the existing documentation and project context:

### Existing Documentation
- **Current State:** Check for existing technical specs, user stories, or project notes
- **Documentation Quality:** Evaluate completeness and currency of available documents
- **Gap Analysis:** Identify missing information that needs to be gathered

## 🚨 CRITICAL: Always Ask Questions in Chat First
Before writing any documentation, **ASK THE USER CLARIFYING QUESTIONS DIRECTLY IN THE CHAT**.

## 📥 Context (ask if missing)
1. **Project Scope** – what's being built?
2. **Business Goals** – why does this exist?
3. **Current State** – existing systems/processes?
4. **Existing Docs** – technical specs, user stories, notes? (Y/N)

## 🔍 Clarifying Questions Style
Ask one-liner questions with multiple choice options. AI should determine what to ask based on project needs:

> **Platform?** A) Web B) Mobile C) Desktop D) API  

## 🚦 Skip if
Requirements doc exists (<30 days) or scope is trivial/emergency.

## 📤 Output
**After gathering answers in chat**, create:  
**File:** `.agents-playbook/[feature-name]/requirements.md`

Sections:
1. **Executive Summary** – goals & scope  
2. **Functional Requirements** – ID, description, priority, acceptance criteria  
3. **Non-Functional Requirements** – performance, security, usability  
4. **Constraints & Dependencies** – tech stack, timeline, external systems  
5. **Open Questions** – unresolved items
