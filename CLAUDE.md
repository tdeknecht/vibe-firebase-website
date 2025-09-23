# Claude Code Context & Development Guidelines

This file provides essential context for Claude when working on software projects. **All detailed guidance is located in `./.vibe-prompts/` and should be referenced for architectural and development decisions.**

## How to Use This Framework

### 1. Always Consult Prompts First
Before making any architectural or implementation decisions, reference the appropriate files in `./.vibe-prompts/` for detailed guidance and best practices.

### 2. Prompt File Reference Map

**For Architecture Decisions:**
- `code-structure.md` - Universal architecture patterns and organization
- `modular-architecture-principles.md` - Right-sized modularity approaches
- `feature-extensibility.md` - Building systems that can grow and evolve

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
2. **Reference Appropriate Prompt File(s)** from `./.vibe-prompts/`
3. **Apply Guidance** to the specific technology and context
4. **Document Which Prompts Influenced the Decision**
5. **Follow Through** with testing and validation as outlined in prompts

The detailed principles, patterns, and best practices are all maintained in the `./.vibe-prompts/` directory. This file serves only as a navigation guide to help locate and apply the appropriate guidance.