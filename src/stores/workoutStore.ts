import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { addDays, parseISO, isBefore, isAfter } from 'date-fns';
import type { Workout, WorkoutStatus } from '../types';

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<Workout[]>([]);
  const selectedDate = ref<string>(new Date().toISOString().split('T')[0]);

  const canEditStatus = computed(() => (date: string) => {
    const workoutDate = parseISO(date);
    return true; // Allow editing status for all dates
  });

  function addWorkout(workout: Workout) {
    const isUpcoming = isBefore(new Date(), parseISO(workout.date));
    workouts.value.push({
      ...workout,
      status: isUpcoming ? 'upcoming' : 'missed'
    });
  }

  function updateWorkout(updatedWorkout: Workout) {
    const index = workouts.value.findIndex(w => w.id === updatedWorkout.id);
    if (index !== -1) {
      workouts.value[index] = updatedWorkout;
    }
  }

  function updateWorkoutStatus(id: string, status: WorkoutStatus) {
    const workout = workouts.value.find(w => w.id === id);
    if (workout && canEditStatus.value(workout.date)) {
      workout.status = status;
    }
  }

  function deleteWorkout(id: string) {
    workouts.value = workouts.value.filter(w => w.id !== id);
  }

  function getWorkoutsByDate(date: string) {
    return workouts.value.filter(w => w.date === date);
  }

  return {
    workouts,
    selectedDate,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutsByDate,
    updateWorkoutStatus,
    canEditStatus
  };
}, {
  persist: true
});