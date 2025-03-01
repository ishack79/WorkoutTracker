<script setup lang="ts">
import { ref, computed } from 'vue';
import { useWorkoutStore } from '../stores/workoutStore';
import type { Workout } from '../types';

const emit = defineEmits(['form-closed']);

const store = useWorkoutStore();

const workout = ref<Partial<Workout>>({
  description: '',
  results: '',
  comments: ''
});

const isEditing = ref(false);
const showForm = ref(false);
const isSaving = ref(false);

const formTitle = computed(() => {
  return isEditing.value ? 'Edit Workout' : 'Add Workout';
});

const resetForm = () => {
  workout.value = {
    description: '',
    results: '',
    comments: ''
  };
  isEditing.value = false;
};

const saveWorkout = async () => {
  if (!workout.value.description) return;
  
  isSaving.value = true;
  
  try {
    if (isEditing.value && workout.value.id) {
      await store.updateWorkout({
        id: workout.value.id,
        date: store.selectedDate,
        description: workout.value.description || '',
        results: workout.value.results || '',
        comments: workout.value.comments || ''
      });
    } else {
      await store.addWorkout({
        id: Date.now().toString(),
        date: store.selectedDate,
        description: workout.value.description || '',
        results: workout.value.results || '',
        comments: workout.value.comments || ''
      });
    }
    
    resetForm();
    showForm.value = false;
    emit('form-closed');
  } catch (error) {
    console.error('Error saving workout:', error);
  } finally {
    isSaving.value = false;
  }
};

const editWorkout = (existingWorkout: Workout) => {
  workout.value = { ...existingWorkout };
  isEditing.value = true;
  showForm.value = true;
};

const closeForm = () => {
  showForm.value = false;
  resetForm();
  emit('form-closed');
};

const deleteWorkout = async (id: string) => {
  if (confirm('Are you sure you want to delete this workout?')) {
    try {
      await store.deleteWorkout(id);
    } catch (error) {
      console.error('Error deleting workout:', error);
    }
  }
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
      @click="showForm = true"
      class="mb-4"
    >
      Add Workout
    </v-btn>
    
    <v-card v-if="showForm" class="mb-4">
      <v-card-title>{{ formTitle }}</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="saveWorkout">
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
            <v-btn text @click="closeForm" :disabled="isSaving">Cancel</v-btn>
            <v-btn 
              color="primary" 
              @click="saveWorkout" 
              :loading="isSaving"
              :disabled="!workout.description"
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-form>
      </v-card-text>
    </v-card>
    
    <div v-if="store.getWorkoutsByDate(store.selectedDate).length === 0 && !showForm" class="text-center pa-4">
      <p>No workouts for this date. Add one to get started!</p>
    </div>
  </div>
</template>