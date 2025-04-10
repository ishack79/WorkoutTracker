<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { useWorkoutStore } from '../stores/workoutStore';
import type { Workout } from '../types';
import { isBefore, parseISO } from 'date-fns';

const emit = defineEmits(['form-closed']);

const store = useWorkoutStore();

const workout = ref<Partial<Workout>>({
  title: 'Strength',
  description: '',
  results: '',
  comments: '',
  status: 'upcoming'
});

const isEditing = ref(false);
const showForm = ref(false);
const titleSelectRef = ref<HTMLElement | null>(null);

const formTitle = computed(() => {
  return isEditing.value ? 'Edit Workout' : 'Add Workout';
});

const resetForm = () => {
  workout.value = {
    title: 'Strength',
    description: '',
    results: '',
    comments: '',
    status: 'upcoming'
  };
  isEditing.value = false;
};

const saveWorkout = () => {
  if (!workout.value.description) return;
  
  const isUpcoming = isBefore(new Date(), parseISO(store.selectedDate));
  const status = workout.value.status || (isUpcoming ? 'upcoming' : 'missed');
  
  if (isEditing.value && workout.value.id) {
    store.updateWorkout({
      id: workout.value.id,
      date: store.selectedDate,
      title: workout.value.title || 'Workout',
      description: workout.value.description || '',
      results: workout.value.results || '',
      comments: workout.value.comments || '',
      status: status
    });
  } else {
    store.addWorkout({
      id: Date.now().toString(),
      date: store.selectedDate,
      title: workout.value.title || 'Workout',
      description: workout.value.description || '',
      results: workout.value.results || '',
      comments: workout.value.comments || '',
      status: status
    });
  }
  
  resetForm();
  showForm.value = false;
  emit('form-closed');
};

const editWorkout = (existingWorkout: Workout) => {
  workout.value = { ...existingWorkout };
  isEditing.value = true;
  showForm.value = true;
  
  // Focus on the title field after DOM update
  nextTick(() => {
    if (titleSelectRef.value) {
      titleSelectRef.value.focus();
    }
  });
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
  emit('form-closed');
};

const showAddForm = () => {
  showForm.value = true;
  
  // Focus on the title field after DOM update
  nextTick(() => {
    if (titleSelectRef.value) {
      titleSelectRef.value.focus();
    }
  });
};

defineExpose({
  editWorkout
});
</script>

<template>
  <div>
    <v-btn 
      v-if="!showForm" 
      color="primary" 
      block 
      @click="showAddForm"
      class="mb-4"
    >
      Add Workout
    </v-btn>
    
    <v-card v-if="showForm" class="mb-4">
      <v-card-title>{{ formTitle }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveWorkout">
          <v-select
            v-model="workout.title"
            label="Workout Type"
            :items="['Warm-Up', 'Strength', 'WOD', 'Finisher', 'Cool-Down']"
            outlined
            required
            ref="titleSelectRef"
          ></v-select>
          
          <v-textarea
            v-model="workout.description"
            label="Workout Description"
            rows="4"
            auto-grow
            outlined
            required
          ></v-textarea>
          
          <v-textarea
            v-model="workout.results"
            label="Results (optional)"
            rows="2"
            auto-grow
            outlined
          ></v-textarea>
          
          <v-textarea
            v-model="workout.comments"
            label="Comments (optional)"
            rows="2"
            auto-grow
            outlined
            hint="Add any additional notes or comments about this workout"
          ></v-textarea>
          
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="text" @click="closeForm">Cancel</v-btn>
            <v-btn color="primary" @click="saveWorkout">Save</v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
    
    <div v-if="store.getWorkoutsByDate(store.selectedDate).length === 0 && !showForm" class="text-center pa-4">
      <p>No workouts for this date. Add one to get started!</p>
    </div>
  </div>
</template>