export enum CycleStatus {
  DRAFT = 'draft', // Cycle is being configured, not yet open for evaluations
  ACTIVE = 'active', // Evaluations can be created/submitted
  COMPLETED = 'completed', // Cycle is closed, no further changes allowed
}
