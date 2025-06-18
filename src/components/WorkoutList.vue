<script setup lang="ts">
import { computed, ref } from 'vue';
import { useWorkoutStore } from '../stores/workoutStore';
import { format, parseISO, isBefore, isSameDay } from 'date-fns';
import WorkoutForm from './WorkoutForm.vue';
import type { Workout, WorkoutStatus } from '../types';

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

const onFormClose = () => {
  editingWorkoutId.value = null;
};

const getStatusColor = (status: WorkoutStatus) => {
  if (!status) return 'grey';
  switch (status) {
    case 'complete': return 'success';
    case 'missed': return 'error';
    case 'upcoming': return 'grey';
  }
};

const getStatusIcon = (status: WorkoutStatus) => {
  if (!status) return 'mdi-help-circle';
  switch (status) {
    case 'complete': return 'mdi-check-circle';
    case 'missed': return 'mdi-close-circle';
    case 'upcoming': return 'mdi-clock-outline';
  }
};

const cycleWorkoutStatus = (workout: Workout) => {
  const workoutDate = parseISO(workout.date);
  const isPastWorkout = !isBefore(new Date(), workoutDate) && !isSameDay(workoutDate, new Date());
  const statusCycle: WorkoutStatus[] = isPastWorkout 
    ? ['complete', 'missed'] 
    : ['upcoming', 'complete', 'missed'];
  
  const currentIndex = statusCycle.indexOf(workout.status);
  const nextIndex = (currentIndex + 1) % statusCycle.length;
  store.updateWorkoutStatus(workout.id, statusCycle[nextIndex]);
};

const shareAllWorkoutsForDate = () => {
  if (workoutsForSelectedDate.value.length === 0) return;
  
  const workoutDate = format(parseISO(store.selectedDate), 'EEEE, MMMM d, yyyy');
  let message = `My Workouts - ${workoutDate}\n\n`;
  
  workoutsForSelectedDate.value.forEach((workout, index) => {
    const statusText = {
      complete: 'DONE',
      missed: 'MISSED',
      upcoming: 'PLANNED'
    };
    
    message += `${index + 1}. ${workout.title} [${statusText[workout.status]}]\n`;
    message += `${workout.description}\n`;
    
    if (workout.results) {
      message += `Results: ${workout.results}\n`;
    }
    
    if (workout.comments) {
      message += `Notes: ${workout.comments}\n`;
    }
    
    message += '\n';
  });
  
  message += `Shared from Workout Tracker\n`;
  message += `https://yourworkouttracker.netlify.app/`;
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
};
</script>

<template>
  <div>
    <div class="d-flex justify-space-between align-center mb-4">
      <h2 class="text-h5">{{ formattedDate }}</h2>
      <v-btn
        v-if="workoutsForSelectedDate.length > 0"
        color="success"
        variant="outlined"
        @click="shareAllWorkoutsForDate"
        class="share-all-btn"
      >
        <v-icon start>mdi-whatsapp</v-icon>
        Share Day
      </v-btn>
    </div>
    
    <WorkoutForm ref="workoutForm" @form-closed="onFormClose" />
    
    <v-card 
      v-for="workout in workoutsForSelectedDate" 
      :key="workout.id" 
      class="mb-4"
      v-show="editingWorkoutId !== workout.id"
    >
      <v-card-title class="d-flex justify-space-between align-center">
        <span class="text-truncate">{{ workout.title || 'Workout' }}</span>
        <div class="d-flex align-center">
          <v-chip
            v-if="store.canEditStatus"
            :color="getStatusColor(workout.status)"
            class="mr-2"
            @click="cycleWorkoutStatus(workout)"
          >
            <v-icon start :icon="getStatusIcon(workout.status)"></v-icon>
            {{ workout.status ? workout.status.charAt(0).toUpperCase() + workout.status.slice(1) : '' }}
          </v-chip>
          <v-chip
            v-else
            :color="getStatusColor(workout.status)"
            class="mr-2"
          >
            <v-icon start :icon="getStatusIcon(workout.status)"></v-icon>
            {{ workout.status ? workout.status.charAt(0).toUpperCase() + workout.status.slice(1) : '' }}
          </v-chip>
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

.share-all-btn {
  transition: all 0.2s ease;
}

.share-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(37, 211, 102, 0.3);
}
</style>