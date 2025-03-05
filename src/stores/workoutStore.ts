import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { Workout } from '../types';

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<Workout[]>([]);
  const selectedDate = ref<string>(new Date().toISOString().split('T')[0]);

  function addWorkout(workout: Workout) {
    workouts.value.push(workout);
  }

  function updateWorkout(updatedWorkout: Workout) {
    const index = workouts.value.findIndex(w => w.id === updatedWorkout.id);
    if (index !== -1) {
      workouts.value[index] = updatedWorkout;
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
    getWorkoutsByDate
  };
}, {
  persist: true
});