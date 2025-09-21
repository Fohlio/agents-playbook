import {
  SubAgent,
  AgentType,
  ExtensionConfig,
  ContextIsolationManager
} from '../types';
import { AnalysisAgent } from './analysis-agent';
import { DesignAgent } from './design-agent';
import { SubAgentBase } from './sub-agent-base';

export class SubAgentFactory {
  private agentPool: Map<string, SubAgent> = new Map();
  private agentTypeCounters: Map<AgentType, number> = new Map();

  constructor(
    private config: ExtensionConfig,
    private contextManager: ContextIsolationManager
  ) {
    // Initialize counters
    Object.values(AgentType).forEach(type => {
      this.agentTypeCounters.set(type, 0);
    });
  }

  async createAgent(type: AgentType): Promise<SubAgent> {
    console.log(`Creating agent of type: ${type}`);

    // Check if we have available agent capacity
    const activeAgents = Array.from(this.agentPool.values()).filter(agent =>
      agent.type === type
    );

    if (activeAgents.length >= this.config.orchestrator.maxConcurrentAgents) {
      throw new Error(`Maximum concurrent agents of type ${type} reached`);
    }

    // Create agent based on type
    let agent: SubAgent;

    switch (type) {
      case AgentType.ANALYSIS:
        agent = new AnalysisAgent(this.config.agents.analysis);
        break;

      case AgentType.DESIGN:
        agent = new DesignAgent(this.config.agents.design);
        break;

      case AgentType.PLANNING:
        agent = new PlanningAgent(this.config.agents.planning);
        break;

      case AgentType.IMPLEMENTATION:
        agent = new ImplementationAgent(this.config.agents.implementation);
        break;

      case AgentType.TESTING:
        agent = new TestingAgent(this.config.agents.testing);
        break;

      case AgentType.REFACTORING:
        agent = new RefactoringAgent(this.config.agents.refactoring);
        break;

      default:
        throw new Error(`Unknown agent type: ${type}`);
    }

    // Add to pool
    this.agentPool.set(agent.agentId, agent);

    // Increment counter
    const currentCount = this.agentTypeCounters.get(type) || 0;
    this.agentTypeCounters.set(type, currentCount + 1);

    console.log(`Created agent ${agent.agentId} (${type})`);
    return agent;
  }

  getAgent(agentId: string): SubAgent | undefined {
    return this.agentPool.get(agentId);
  }

  getAgentsByType(type: AgentType): SubAgent[] {
    return Array.from(this.agentPool.values()).filter(agent => agent.type === type);
  }

  getAllAgents(): SubAgent[] {
    return Array.from(this.agentPool.values());
  }

  async releaseAgent(agentId: string): Promise<void> {
    const agent = this.agentPool.get(agentId);
    if (!agent) {
      console.warn(`Agent ${agentId} not found for release`);
      return;
    }

    console.log(`Releasing agent ${agentId}`);

    // Dispose agent
    agent.dispose();

    // Remove from pool
    this.agentPool.delete(agentId);

    // Decrement counter
    const currentCount = this.agentTypeCounters.get(agent.type) || 0;
    this.agentTypeCounters.set(agent.type, Math.max(0, currentCount - 1));
  }

  getAgentStats(): { [key in AgentType]: number } {
    const stats = {} as { [key in AgentType]: number };

    Object.values(AgentType).forEach(type => {
      stats[type] = this.agentTypeCounters.get(type) || 0;
    });

    return stats;
  }

  dispose(): void {
    console.log('Disposing all agents...');

    // Dispose all agents
    for (const agent of this.agentPool.values()) {
      agent.dispose();
    }

    // Clear pool
    this.agentPool.clear();
    this.agentTypeCounters.clear();
  }
}

// Placeholder implementations for other agent types
class PlanningAgent extends SubAgentBase {
  constructor(config: any) {
    super(AgentType.PLANNING, config);
  }

  protected getMiniPromptPath(): string {
    return 'planning/create-implementation-plan';
  }

  protected async performSpecificValidation(result: any): Promise<boolean> {
    return result.outputs && result.outputs.size > 0;
  }
}

class ImplementationAgent extends SubAgentBase {
  constructor(config: any) {
    super(AgentType.IMPLEMENTATION, config);
  }

  protected getMiniPromptPath(): string {
    return 'implementation/implement-task';
  }

  protected async performSpecificValidation(result: any): Promise<boolean> {
    return result.outputs && result.outputs.size > 0;
  }
}

class TestingAgent extends SubAgentBase {
  constructor(config: any) {
    super(AgentType.TESTING, config);
  }

  protected getMiniPromptPath(): string {
    return 'testing-review/execute-tests';
  }

  protected async performSpecificValidation(result: any): Promise<boolean> {
    return result.outputs && result.outputs.size > 0;
  }
}

class RefactoringAgent extends SubAgentBase {
  constructor(config: any) {
    super(AgentType.REFACTORING, config);
  }

  protected getMiniPromptPath(): string {
    return 'refactoring/improve-code';
  }

  protected async performSpecificValidation(result: any): Promise<boolean> {
    return result.outputs && result.outputs.size > 0;
  }
}