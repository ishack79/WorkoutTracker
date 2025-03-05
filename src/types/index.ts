export type WorkoutStatus = 'complete' | 'missed' | 'upcoming';

export interface Workout {
  id: string;
  date: string;
  description: string;
  results: string;
  comments?: string;
  status: WorkoutStatus;
}