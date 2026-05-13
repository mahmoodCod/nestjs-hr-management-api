export enum ApplicationStage {
  RECEIVED = 'received', // Application received
  SCREENING = 'screening', // Initial screening (HR)
  TECHNICAL_INTERVIEW = 'technical_interview',
  HR_INTERVIEW = 'hr_interview',
  OFFER = 'offer', // Offer extended
  HIRED = 'hired', // Candidate accepted and hired
  REJECTED = 'rejected',
}
