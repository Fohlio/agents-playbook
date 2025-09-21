"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignAgent = void 0;
const types_1 = require("../types");
const sub_agent_base_1 = require("./sub-agent-base");
class DesignAgent extends sub_agent_base_1.SubAgentBase {
    constructor(config) {
        super(types_1.AgentType.DESIGN, config);
    }
    getMiniPromptPath() {
        return 'design-architecture/design-architecture';
    }
    async performSpecificValidation(result) {
        // Basic validation - check that we have any meaningful output
        if (!result.outputs || result.outputs.size === 0) {
            console.warn('Design agent produced no outputs');
            return false;
        }
        // Check for key outputs that indicate design work was done
        const taskOutput = result.outputs.get('task_output');
        const executionLog = result.outputs.get('execution_log');
        if (!taskOutput && !executionLog) {
            console.warn('Design agent did not produce expected output types');
            return false;
        }
        console.log('Design agent validation passed');
        return true;
    }
    extractKeyDecisions(result) {
        const design = result.outputs.get('design_specifications');
        if (!design)
            return [];
        return [
            `Architecture: ${design.architecture}`,
            `Components: ${design.components.length} defined`,
            `Key decisions: ${design.decisions.join(', ')}`
        ];
    }
    identifyNextSteps(result) {
        return [
            'Proceed to implementation planning phase',
            'Use design specifications for task breakdown',
            'Ensure all components are planned for implementation'
        ];
    }
}
exports.DesignAgent = DesignAgent;
//# sourceMappingURL=design-agent.js.map