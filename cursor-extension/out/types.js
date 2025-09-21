"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StageStatus = exports.WorkflowStatus = exports.AgentStatus = exports.AgentType = void 0;
var AgentType;
(function (AgentType) {
    AgentType["ANALYSIS"] = "analysis";
    AgentType["DESIGN"] = "design";
    AgentType["PLANNING"] = "planning";
    AgentType["IMPLEMENTATION"] = "implementation";
    AgentType["TESTING"] = "testing";
    AgentType["REFACTORING"] = "refactoring";
})(AgentType || (exports.AgentType = AgentType = {}));
var AgentStatus;
(function (AgentStatus) {
    AgentStatus["IDLE"] = "idle";
    AgentStatus["ASSIGNED"] = "assigned";
    AgentStatus["EXECUTING"] = "executing";
    AgentStatus["WAITING_VALIDATION"] = "waiting_validation";
    AgentStatus["COMPLETED"] = "completed";
    AgentStatus["ERROR"] = "error";
})(AgentStatus || (exports.AgentStatus = AgentStatus = {}));
var WorkflowStatus;
(function (WorkflowStatus) {
    WorkflowStatus["PENDING"] = "pending";
    WorkflowStatus["RUNNING"] = "running";
    WorkflowStatus["PAUSED"] = "paused";
    WorkflowStatus["COMPLETED"] = "completed";
    WorkflowStatus["ERROR"] = "error";
    WorkflowStatus["CANCELLED"] = "cancelled";
})(WorkflowStatus || (exports.WorkflowStatus = WorkflowStatus = {}));
var StageStatus;
(function (StageStatus) {
    StageStatus["PENDING"] = "pending";
    StageStatus["IN_PROGRESS"] = "in-progress";
    StageStatus["VALIDATION"] = "validation";
    StageStatus["COMPLETED"] = "completed";
    StageStatus["SKIPPED"] = "skipped";
    StageStatus["ERROR"] = "error";
})(StageStatus || (exports.StageStatus = StageStatus = {}));
//# sourceMappingURL=types.js.map