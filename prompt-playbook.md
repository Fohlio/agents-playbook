# Prompt Playbook

Collection of specialized prompts for software development and product management tasks.

## 📋 Available Prompts

### 1. [Product Development from Scratch](product-development-prompt.md)
**Purpose**: Complete product development process from concept to first TRD  
**Use Case**: When you have a product idea and need comprehensive discovery, planning, and specification  
**Timeline**: Full discovery process (days-weeks)  
**Output**: PRD summary, feature breakdown, testing strategy, MVP definition, and first TRD

### 2. [TRD Creation from Scratch](trd-creation-prompt.md)
**Purpose**: Create detailed Technical Requirements Document for specific features  
**Use Case**: When you have a clear feature idea and need to turn it into actionable technical requirements  
**Timeline**: Feature analysis and specification (hours-days)  
**Output**: Complete TRD following the [template](trd-template.md)

### 3. [BRD to TRD Translation](brd-to-trd-translation-prompt.md)
**Purpose**: Translate Business Requirements Document into Technical Requirements  
**Use Case**: When you have a BRD and need to analyze codebase and create corresponding TRD  
**Timeline**: Analysis and translation process (days)  
**Output**: Comprehensive TRD based on existing BRD and codebase analysis

### 4. [Quick Bug Fixes & Mini-Features](quick-fix-prompt.md)
**Purpose**: Rapid resolution of bugs and implementation of small features  
**Use Case**: When you need to fix bugs or add small features without full documentation overhead  
**Timeline**: Quick implementation (hours-1-2 days)  
**Output**: Working solution with minimal documentation

## 📝 Document Templates

### Business Requirements
- [BRD Template](brd-template.md) - Comprehensive business requirements document
- [BRD Basic Template](brd-basic-template.md) - Simplified business requirements template

### Technical Requirements  
- [TRD Template](trd-template.md) - Complete technical requirements document template

## 🎯 Decision Matrix: Which Prompt to Use?

| Scenario | Recommended Prompt | Why |
|----------|-------------------|-----|
| New product idea, unclear requirements | [Product Development](product-development-prompt.md) | Need comprehensive discovery and planning |
| Clear feature request, need technical spec | [TRD Creation](trd-creation-prompt.md) | Direct path to technical requirements |
| Have BRD, need technical implementation | [BRD to TRD Translation](brd-to-trd-translation-prompt.md) | Systematic translation with codebase analysis |
| Bug fix or small enhancement | [Quick Fix](quick-fix-prompt.md) | Rapid implementation without overhead |

## 🔄 Process Flow

```
New Product Idea → Product Development from Scratch → First TRD
                                ↓
Feature Request → TRD Creation from Scratch → Implementation
                                ↓
Business Requirements → BRD to TRD Translation → Implementation
                                ↓
Bug/Small Feature → Quick Fix Process → Implementation
```

## 🛠️ Getting Started

1. **Identify your starting point**: Do you have a product idea, feature request, BRD, or bug to fix?
2. **Choose the appropriate prompt** using the decision matrix above
3. **Follow the prompt systematically** - each prompt includes phase-by-phase guidance
4. **Use the templates** provided to structure your output
5. **Iterate and refine** based on feedback and new information

---

*This playbook is designed to provide structured approaches for different types of software development and product management tasks. Each prompt is self-contained and can be used independently.*


