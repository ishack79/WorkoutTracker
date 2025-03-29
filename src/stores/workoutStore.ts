import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { parseISO, isBefore, isSameDay } from 'date-fns';
import type { Workout, WorkoutStatus } from '../types';

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<Workout[]>([]);
  const selectedDate = ref<string>(new Date().toISOString().split('T')[0]);

  const canEditStatus = computed(() => {
    return true; // Allow editing status for all dates
  });

  function addWorkout(workout: Workout) {
    const workoutDate = parseISO(workout.date);
    const isUpcoming = isBefore(new Date(), workoutDate) || isSameDay(workoutDate, new Date());
    workouts.value.push({
      ...workout,
      title: workout.title || 'Workout',
      status: isUpcoming ? 'upcoming' : 'missed'
    });
  }

  function updateWorkout(updatedWorkout: Workout) {
    const index = workouts.value.findIndex(w => w.id === updatedWorkout.id);
    if (index !== -1) {
      const workoutDate = parseISO(updatedWorkout.date);
      const isPastWorkout = !isBefore(new Date(), workoutDate) && !isSameDay(workoutDate, new Date());
      if (isPastWorkout && updatedWorkout.status === 'upcoming') {
        updatedWorkout.status = 'missed';
      }
      workouts.value[index] = {
        ...updatedWorkout,
        title: updatedWorkout.title || 'Workout'
      };
    }
  }

  function updateWorkoutStatus(id: string, status: WorkoutStatus) {
    const workout = workouts.value.find(w => w.id === id);
    if (workout && canEditStatus.value) {
      const workoutDate = parseISO(workout.date);
      const isPastWorkout = !isBefore(new Date(), workoutDate) && !isSameDay(workoutDate, new Date());
      if (isPastWorkout && status === 'upcoming') {
        workout.status = 'missed';
      } else {
        workout.status = status;
      }
    }
  }

  function deleteWorkout(id: string) {
    workouts.value = workouts.value.filter(w => w.id !== id);
  }

  function getWorkoutsByDate(date: string) {
    return workouts.value.filter(w => w.date === date);
  }

  // Handle existing workouts that don't have a title
  const initializeStore = () => {
    workouts.value.forEach(workout => {
      if (!workout.title) {
        workout.title = 'Workout';
      }
    });
  };

  // Initialize on store creation
  initializeStore();

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