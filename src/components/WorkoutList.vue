<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWorkoutStore } from '../stores/workoutStore';
import { format, parseISO } from 'date-fns';
import WorkoutForm from './WorkoutForm.vue';
import type { Workout } from '../types';

const store = useWorkoutStore();
const workoutForm = ref<InstanceType<typeof WorkoutForm> | null>(null);
const editingWorkoutId = ref<string | null>(null);

const workoutsForSelectedDate = computed(() => {
  return store.getWorkoutsByDate(store.selectedDate);
});

const formattedDate = computed(() => {
  return format(parseISO(store.selectedDate), 'EEEE, MMMM d, yyyy');
});

const editWorkout = (workout: Workout) => {
  editingWorkoutId.value = workout.id;
  if (workoutForm.value) {
    workoutForm.value.editWorkout(workout);
  }
};

// Reset editing state when form is closed
const onFormClose = () => {
  editingWorkoutId.value = null;
};
</script>

<template>
  <div>
    <h2 class="text-h5 mb-4">{{ formattedDate }}</h2>
    
    <WorkoutForm ref="workoutForm" @form-closed="onFormClose" />
    
    <v-card 
      v-for="workout in workoutsForSelectedDate" 
      :key="workout.id" 
      class="mb-4"
      v-show="editingWorkoutId !== workout.id"
    >
      <v-card-title class="d-flex justify-space-between">
        <span class="text-truncate">Workout</span>
        <div>
          <v-btn icon @click="editWorkout(workout)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
          <v-btn icon @click="store.deleteWorkout(workout.id)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </div>
      </v-card-title>
      
      <v-card-text>
        <v-sheet class="pa-3 mb-3 rounded bg-grey-darken-3">
          <div class="text-subtitle-2 mb-1">Description:</div>
          <div class="workout-text">{{ workout.description }}</div>
        </v-sheet>
        
        <v-sheet v-if="workout.results" class="pa-3 mb-3 rounded bg-grey-darken-3">
          <div class="text-subtitle-2 mb-1">Results:</div>
          <div class="workout-text">{{ workout.results }}</div>
        </v-sheet>
        
        <v-sheet v-if="workout.comments" class="pa-3 rounded bg-grey-darken-3">
          <div class="text-subtitle-2 mb-1">Comments:</div>
          <div class="workout-text">{{ workout.comments }}</div>
        </v-sheet>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.workout-text {
  white-space: pre-line;
}
</style>