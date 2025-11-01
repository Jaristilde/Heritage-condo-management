# Heritage Condo Management - AI Agent System

This directory contains 18 specialized AI agents for managing the Heritage Condominium Association.

## Agent Directory Structure

### Phase 1: Foundational Agents
- `meta-agent.md` - Quality assurance and improvement
- `orchestration-agent.md` - Workflow coordination
- `architecture-agent.md` - System design and evolution

### Phase 2: Critical Business Logic
- `financial-management-agent.md` - AR/AP, ledgers, payments
- `invoice-approval-agent.md` - Invoice processing and approvals
- `delinquency-management-agent.md` - Collections and notices
- `assessment-agent.md` - Maintenance fees and special assessments
- `email-notification-agent.md` - Email campaigns and templates

### Phase 3: Supporting Functions
- `unit-management-agent.md` - Unit and owner database
- `reporting-agent.md` - Financial reports and exports
- `owner-portal-agent.md` - Owner self-service
- `board-governance-agent.md` - Board actions and meetings

### Phase 4: Advanced Features
- `budget-management-agent.md` - Budget planning and variance
- `compliance-legal-agent.md` - FL HOA law compliance
- `bank-reconciliation-agent.md` - Bank reconciliation
- `document-management-agent.md` - Document organization
- `automation-cron-agent.md` - Scheduled jobs
- `data-import-export-agent.md` - CSV processing and migration

## How to Use Agents

Each agent is a slash command that can be invoked in Claude Code:

```
/meta-agent [task description]
/orchestration-agent [complex workflow]
/financial-management [financial task]
```

## Agent Capabilities

All agents have access to:
- Heritage Condo codebase (`/Users/joanearistilde/Desktop/Heritage-condo-management`)
- Database schema (`shared/schema.ts`)
- Server APIs (`server/routes.ts`)
- Client pages (`client/src/pages/`)

## Agent Communication

Agents can call other agents via the Task tool for complex workflows.

Example:
```
Orchestration Agent spawns:
  → Invoice Approval Agent (validates)
  → Email Notification Agent (sends emails)
  → Board Governance Agent (logs action)
```

## Priority Levels

🔴 **Critical** - Core business operations
🟡 **High** - Important features
🟢 **Medium** - Supporting features

Built for: Heritage Condominium Association, North Miami, FL
