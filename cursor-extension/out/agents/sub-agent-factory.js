"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubAgentFactory = void 0;
const types_1 = require("../types");
const analysis_agent_1 = require("./analysis-agent");
const design_agent_1 = require("./design-agent");
const sub_agent_base_1 = require("./sub-agent-base");
class SubAgentFactory {
    constructor(config, contextManager) {
        this.config = config;
        this.contextManager = contextManager;
        this.agentPool = new Map();
        this.agentTypeCounters = new Map();
        // Initialize counters
        Object.values(types_1.AgentType).forEach(type => {
            this.agentTypeCounters.set(type, 0);
        });
    }
    async createAgent(type) {
        console.log(`Creating agent of type: ${type}`);
        // Check if we have available agent capacity
        const activeAgents = Array.from(this.agentPool.values()).filter(agent => agent.type === type);
        if (activeAgents.length >= this.config.orchestrator.maxConcurrentAgents) {
            throw new Error(`Maximum concurrent agents of type ${type} reached`);
        }
        // Create agent based on type
        let agent;
        switch (type) {
            case types_1.AgentType.ANALYSIS:
                agent = new analysis_agent_1.AnalysisAgent(this.config.agents.analysis);
                break;
            case types_1.AgentType.DESIGN:
                agent = new design_agent_1.DesignAgent(this.config.agents.design);
                break;
            case types_1.AgentType.PLANNING:
                agent = new PlanningAgent(this.config.agents.planning);
                break;
            case types_1.AgentType.IMPLEMENTATION:
                agent = new ImplementationAgent(this.config.agents.implementation);
                break;
            case types_1.AgentType.TESTING:
                agent = new TestingAgent(this.config.agents.testing);
                break;
            case types_1.AgentType.REFACTORING:
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
    getAgent(agentId) {
        return this.agentPool.get(agentId);
    }
    getAgentsByType(type) {
        return Array.from(this.agentPool.values()).filter(agent => agent.type === type);
    }
    getAllAgents() {
        return Array.from(this.agentPool.values());
    }
    async releaseAgent(agentId) {
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
    getAgentStats() {
        const stats = {};
        Object.values(types_1.AgentType).forEach(type => {
            stats[type] = this.agentTypeCounters.get(type) || 0;
        });
        return stats;
    }
    dispose() {
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
exports.SubAgentFactory = SubAgentFactory;
// Placeholder implementations for other agent types
class PlanningAgent extends sub_agent_base_1.SubAgentBase {
    constructor(config) {
        super(types_1.AgentType.PLANNING, config);
    }
    getMiniPromptPath() {
        return 'planning/create-implementation-plan';
    }
    async performSpecificValidation(result) {
        return result.outputs && result.outputs.size > 0;
    }
}
class ImplementationAgent extends sub_agent_base_1.SubAgentBase {
    constructor(config) {
        super(types_1.AgentType.IMPLEMENTATION, config);
    }
    getMiniPromptPath() {
        return 'implementation/implement-task';
    }
    async performSpecificValidation(result) {
        return result.outputs && result.outputs.size > 0;
    }
}
class TestingAgent extends sub_agent_base_1.SubAgentBase {
    constructor(config) {
        super(types_1.AgentType.TESTING, config);
    }
    getMiniPromptPath() {
        return 'testing-review/execute-tests';
    }
    async performSpecificValidation(result) {
        return result.outputs && result.outputs.size > 0;
    }
}
class RefactoringAgent extends sub_agent_base_1.SubAgentBase {
    constructor(config) {
        super(types_1.AgentType.REFACTORING, config);
    }
    getMiniPromptPath() {
        return 'refactoring/improve-code';
    }
    async performSpecificValidation(result) {
        return result.outputs && result.outputs.size > 0;
    }
}
//# sourceMappingURL=sub-agent-factory.js.map