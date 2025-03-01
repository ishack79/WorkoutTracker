import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Workout } from '../types';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const useWorkoutStore = defineStore('workout', () => {
  const workouts = ref<Workout[]>([]);
  const selectedDate = ref<string>(new Date().toISOString().split('T')[0]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  // Load workouts from the server
  async function loadWorkouts() {
    isLoading.value = true;
    error.value = null;
    
    try {
      const response = await axios.get(`${API_URL}/workouts`);
      workouts.value = response.data;
    } catch (err) {
      console.error('Failed to load workouts:', err);
      error.value = 'Failed to load workouts. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  // Save workouts to the server
  async function saveWorkouts() {
    isLoading.value = true;
    error.value = null;
    
    try {
      await axios.post(`${API_URL}/workouts`, workouts.value);
    } catch (err) {
      console.error('Failed to save workouts:', err);
      error.value = 'Failed to save workouts. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  // Add a workout
  async function addWorkout(workout: Workout) {
    workouts.value.push(workout);
    await saveWorkouts();
  }

  // Update a workout
  async function updateWorkout(updatedWorkout: Workout) {
    const index = workouts.value.findIndex(w => w.id === updatedWorkout.id);
    if (index !== -1) {
      workouts.value[index] = updatedWorkout;
      await saveWorkouts();
    }
  }

  // Delete a workout
  async function deleteWorkout(id: string) {
    workouts.value = workouts.value.filter(w => w.id !== id);
    await saveWorkouts();
  }

  // Get workouts by date
  function getWorkoutsByDate(date: string) {
    return workouts.value.filter(w => w.date === date);
  }

  // Load workouts when the store is initialized
  loadWorkouts();

  return {
    workouts,
    selectedDate,
    isLoading,
    error,
    loadWorkouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    getWorkoutsByDate
  };
});