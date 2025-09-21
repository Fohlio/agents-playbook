import * as vscode from 'vscode';

// Agent system types
export interface AgentContext {
  agentId: string;
  taskId: string;
  workflowId: string;
  stageId: string;
  maxTokens: number;
  contextWindow: {
    systemPrompt: string;
    taskContext: string;
    relevantFiles: string[];
    previousHandoffs: HandoffSummary[];
  };
  isolation: {
    preventHistoryAccess: boolean;
    cleanSlate: boolean;
    maxContextSize: number;
  };
}

export interface HandoffSummary {
  fromAgent: string;
  toAgent: string;
  timestamp: Date;
  keyDecisions: string[];
  outputs: string[];
  nextSteps: string[];
  tokenCount: number;
  compressedContext: string;
}

export interface AgentResult {
  agentId: string;
  taskId: string;
  success: boolean;
  outputs: Map<string, any>;
  tokensUsed: number;
  executionTime: number;
  handoffData?: HandoffSummary;
  errors?: string[];
}

export enum AgentType {
  ANALYSIS = 'analysis',
  DESIGN = 'design',
  PLANNING = 'planning',
  IMPLEMENTATION = 'implementation',
  TESTING = 'testing',
  REFACTORING = 'refactoring'
}

export enum AgentStatus {
  IDLE = 'idle',
  ASSIGNED = 'assigned',
  EXECUTING = 'executing',
  WAITING_VALIDATION = 'waiting_validation',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface SubAgentConfig {
  type: AgentType;
  maxTokens: number;
  timeout: number;
  capabilities: string[];
}

// Workflow execution types
export interface WorkflowSession {
  sessionId: string;
  workflowId: string;
  startTime: Date;
  status: WorkflowStatus;
  currentStage?: WorkflowStage;
  completedStages: WorkflowStage[];
  activeAgents: Map<string, AgentContext>;
  orchestrator: OrchestratorContext;
  userRequirements?: string;
}

export enum WorkflowStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ERROR = 'error',
  CANCELLED = 'cancelled'
}

export interface WorkflowStage {
  stageId: string;
  name: string;
  phase: string;
  miniPromptPath: string;
  status: StageStatus;
  assignedAgent?: string;
  startTime?: Date;
  endTime?: Date;
  outputs?: string[];
  validation?: StageValidation;
  prerequisites: StagePrerequisites;
  dependencies: string[];
}

export enum StageStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  VALIDATION = 'validation',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
  ERROR = 'error'
}

export interface StageValidation {
  requiresUserApproval: boolean;
  autoValidation: ValidationRule[];
  manualCheckpoints: Checkpoint[];
  approved?: boolean;
  rejectionReason?: string;
  userFeedback?: string;
}

export interface ValidationRule {
  type: 'output_exists' | 'file_created' | 'custom';
  description: string;
  validationFn?: string; // JavaScript function as string
}

export interface Checkpoint {
  id: string;
  description: string;
  required: boolean;
  checked: boolean;
}

export interface StagePrerequisites {
  requiredContext: string[];
  optionalContext: string[];
  dependencies: string[];
}

// Orchestrator types
export interface OrchestratorContext {
  orchestratorId: string;
  workflowConfig: WorkflowConfig;
  executionPlan: ExecutionPlan;
  currentStep: number;
  totalSteps: number;
  agentAssignments: Map<string, string>;
  stageQueue: WorkflowStage[];
  handoffQueue: HandoffRequest[];
}

export interface ExecutionPlan {
  workflowId: string;
  totalSteps: number;
  executableSteps: number;
  skippedSteps: SkippedStep[];
  executionRate: number;
  phases: PhaseExecutionPlan[];
}

export interface PhaseExecutionPlan {
  name: string;
  totalSteps: number;
  executableSteps: number;
  skippedSteps: SkippedStep[];
  steps: StepExecutionPlan[];
}

export interface StepExecutionPlan {
  id: string;
  title: string;
  willExecute: boolean;
  skipReason?: string;
  validation: any; // StepValidation from workflow types
}

export interface SkippedStep {
  id: string;
  reason: string;
  stepTitle: string;
}

export interface HandoffRequest {
  fromStage: string;
  toStage: string;
  fromAgent: string;
  toAgent: string;
  context: AgentContext;
  priority: number;
}

// UI types
export interface ValidationUIOptions {
  stage: WorkflowStage;
  result?: AgentResult;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onModify: (changes: any) => void;
  onSkip: (reason: string) => void;
}

export interface ProgressUIData {
  session: WorkflowSession;
  currentPhase: string;
  overallProgress: number;
  stageProgress: StageProgressData[];
  agentStatuses: AgentStatusData[];
}

export interface StageProgressData {
  stageId: string;
  name: string;
  status: StageStatus;
  progress: number;
  assignedAgent?: string;
  startTime?: Date;
  estimatedCompletion?: Date;
}

export interface AgentStatusData {
  agentId: string;
  type: AgentType;
  status: AgentStatus;
  currentTask?: string;
  tokensUsed: number;
  maxTokens: number;
  executionTime: number;
}

// Configuration types
export interface ExtensionConfig {
  orchestrator: {
    maxConcurrentAgents: number;
    defaultTokenBudget: number;
    autoValidation: boolean;
  };
  agents: {
    [key in AgentType]: SubAgentConfig;
  };
  ui: {
    showProgressSidebar: boolean;
    autoOpenValidation: boolean;
    compactMode: boolean;
  };
}

// Workflow loading types (reuse from existing types)
export interface WorkflowConfig {
  name: string;
  description: string;
  phases: PhaseConfig[];
  skipConditions?: SkipCondition[];
  validationRules?: ValidationRule[];
}

export interface PhaseConfig {
  phase: string;
  description: string;
  required: boolean;
  steps: StepConfig[];
}

export interface StepConfig {
  id: string;
  miniPrompt: string;
  required?: boolean;
  prerequisites: {
    requiredContext: string[];
    optionalContext: string[];
  };
  dependencies?: string[];
  outputs?: string[];
}

export interface SkipCondition {
  condition: string;
  message: string;
}

// Context isolation types
export interface IsolatedContext {
  agentId: string;
  taskContext: string;
  relevantFiles: string[];
  handoffSummary?: HandoffSummary;
  maxTokens: number;
  systemPrompt: string;
  contextSize: number;
  userRequirements?: string;
  workspaceRoot?: string;
}

export interface ContextStore {
  storeId: string;
  agentId: string;
  context: IsolatedContext;
  createdAt: Date;
  lastAccessed: Date;
  tokenUsage: number;
}

// Task tracking types
export interface TasksMarkdown {
  workflowName: string;
  startedAt: Date;
  status: WorkflowStatus;
  orchestrator: {
    workflowId: string;
    status: string;
  };
  stageAssignments: StageAssignment[];
  userRequirements?: string;
}

export interface StageAssignment {
  stageId: string;
  stageName: string;
  agentId?: string;
  status: StageStatus;
  startedAt?: Date;
  completedAt?: Date;
  expectedOutput?: string;
  actualOutput?: string;
  tokenUsage?: number;
}

// Events
export interface WorkflowEvent {
  type: 'stage_started' | 'stage_completed' | 'agent_assigned' | 'validation_required' | 'handoff_initiated';
  workflowId: string;
  stageId?: string;
  agentId?: string;
  data: any;
  timestamp: Date;
}

export interface EventHandler {
  (event: WorkflowEvent): void;
}

// Extension context
export interface ExtensionState {
  activeSession?: WorkflowSession;
  config: ExtensionConfig;
  workflowDefinitions: Map<string, WorkflowConfig>;
  agentPool: Map<string, SubAgent>;
  contextManager: ContextIsolationManager;
  orchestrator?: OrchestratorAgent;
  eventEmitter: vscode.EventEmitter<WorkflowEvent>;
}

// Forward declarations for classes (will be implemented)
export interface SubAgent {
  agentId: string;
  type: AgentType;
  config: SubAgentConfig;
  execute(context: IsolatedContext): Promise<AgentResult>;
  validateOutput(result: AgentResult): Promise<boolean>;
  dispose(): void;
}

export interface OrchestratorAgent {
  orchestratorId: string;
  context: OrchestratorContext;
  executeWorkflow(workflowId: string): Promise<WorkflowSession>;
  assignAgent(stage: WorkflowStage): Promise<string>;
  validateStage(stage: WorkflowStage): Promise<boolean>;
  resolveStageValidation(stageId: string, approved: boolean): void;
  handoff(fromStage: string, toStage: string): Promise<void>;
  dispose(): void;
}

export interface ContextIsolationManager {
  createIsolatedContext(agentId: string, stage: WorkflowStage, userRequirements?: string): Promise<IsolatedContext>;
  compressHandoff(fullContext: any, targetTokens: number): Promise<HandoffSummary>;
  getContextStore(agentId: string): Promise<ContextStore>;
  cleanupContext(agentId: string): Promise<void>;
}