# MANDATORY: Claude Code Context & Development Guidelines

⚠️ **CRITICAL INSTRUCTION FOR CLAUDE**:
Before ANY architectural, implementation, or design decision in this project:
1. **MUST** reference this file's decision framework below
2. **MUST** read appropriate `.prompts/` files for the task type
3. **MUST** document which guidance files influenced the decision in your response
4. **MUST** apply established patterns consistently
5. **MUST** cite specific guidance sections when making architectural choices

🎯 **Non-Negotiable**: This guidance consultation is required for every development task - not optional.

---

This file provides essential context for Claude when working on software projects. **All detailed guidance is located in `./.prompts/` and must be referenced for architectural and development decisions.**

## How to Use This Framework

### 1. Always Consult Prompts First
Before making any architectural or implementation decisions, reference the appropriate files in `./.prompts/` for detailed guidance and best practices.

### 2. Prompt File Reference Map

**For Architecture Decisions:**
- `code-structure.md` - Universal architecture patterns and organization
- `modular-architecture-principles.md` - Right-sized modularity approaches
- `feature-extensibility.md` - Building systems that can grow and evolve
- `asset-reusability.md` - Resource management and DRY principles for assets

**For Implementation:**
- `firebase-best-practices.md` - Firebase-specific implementation patterns
- `security-architecture.md` - Security patterns and defensive practices
- `testing-qa.md` - Testing strategies and quality assurance

**For Operations:**
- `deployment-cicd.md` - Deployment automation and CI/CD practices
- `monitoring-observability.md` - System monitoring and performance tracking
- `budget-resilience.md` - Cost management and system resilience
- `finops-free-tier-maximization.md` - Optimizing for free tier services
- `platform-simplification.md` - Platform selection and simplification

## Decision Framework

### When to Reference Which Prompt

**Adding New Features** → `modular-architecture-principles.md` + `feature-extensibility.md`

**Refactoring Code** → `code-structure.md` + `modular-architecture-principles.md`

**Working with Assets/Resources** → `asset-reusability.md` + `code-structure.md`

**Security Implementation** → `security-architecture.md`

**Performance Optimization** → `monitoring-observability.md` + `budget-resilience.md`

**Testing Strategy** → `testing-qa.md`

**Deployment Planning** → `deployment-cicd.md`

**Cost Management** → `finops-free-tier-maximization.md` + `budget-resilience.md`

**Technology Selection** → `platform-simplification.md` + relevant technology-specific prompts

## Core Working Principles

1. **Reference First**: Always check relevant prompt files before making decisions
2. **Start Simple**: Follow the right-sized complexity principles from the prompts
3. **Document Decisions**: Reference which prompt files guided your approach
4. **Stay Consistent**: Follow patterns established in the prompt files
5. **Adapt Context**: Apply prompt guidance to the specific technology stack in use

## Workflow Integration

1. **Identify the Problem Type** (architecture, security, performance, etc.)
2. **Reference Appropriate Prompt File(s)** from `./.prompts/`
3. **Apply Guidance** to the specific technology and context
4. **Document Which Prompts Influenced the Decision**
5. **Follow Through** with testing and validation as outlined in prompts

## Session Initialization Protocol

At the start of each development session, Claude must:
- [ ] Acknowledge this guidance framework is active and mandatory
- [ ] Confirm understanding of the decision mapping above
- [ ] Reference appropriate guidance files before making architectural decisions
- [ ] Document guidance citations in all responses involving design choices

## Response Documentation Template

For any architectural or implementation decision, include:

```markdown
**Guidance References:**
- `filename.md` (lines X-Y) - Specific principle applied
- Decision rationale based on documented patterns

**Patterns Applied:**
- Pattern name and implementation approach
```

The detailed principles, patterns, and best practices are all maintained in the `./.prompts/` directory. This file serves as both a navigation guide and a mandatory protocol for consistent development practices.