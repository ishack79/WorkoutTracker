<script setup lang="ts">
import { computed } from 'vue';
import { useWorkoutStore } from '../stores/workoutStore';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  format
} from 'date-fns';

const props = defineProps<{
  currentMonth: Date;
}>();

const store = useWorkoutStore();

const monthlyStats = computed(() => {
  const start = startOfMonth(props.currentMonth);
  const end = endOfMonth(props.currentMonth);
  const days = eachDayOfInterval({ start, end });
  
  const stats = {
    total: 0,
    complete: 0,
    missed: 0,
    upcoming: 0,
    completionRate: 0
  };
  
  days.forEach(day => {
    const workouts = store.getWorkoutsByDate(format(day, 'yyyy-MM-dd'));
    if (workouts.length > 0) {
      stats.total++;
      stats[workouts[0].status]++;
    }
  });
  
  // Calculate completion rate only for completed and missed workouts
  const totalCompleted = stats.complete;
  const totalAttempted = stats.complete + stats.missed;
  stats.completionRate = totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) : 0;
  
  return stats;
});
</script>

<template>
  <v-card class="monthly-overview mb-4">
    <v-card-title class="text-center">
      Monthly Overview - {{ format(currentMonth, 'MMMM yyyy') }}
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="primary" variant="outlined">
            <div class="d-flex flex-column align-center pa-4">
              <div class="text-h4 font-weight-bold">{{ monthlyStats.total }}</div>
              <div class="text-subtitle-1">Total Workouts</div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="success" variant="outlined">
            <div class="d-flex flex-column align-center pa-4">
              <div class="text-h4 font-weight-bold">{{ monthlyStats.complete }}</div>
              <div class="text-subtitle-1">Completed</div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="error" variant="outlined">
            <div class="d-flex flex-column align-center pa-4">
              <div class="text-h4 font-weight-bold">{{ monthlyStats.missed }}</div>
              <div class="text-subtitle-1">Missed</div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" variant="outlined">
            <div class="d-flex flex-column align-center pa-4">
              <div class="text-h4 font-weight-bold">{{ monthlyStats.completionRate }}%</div>
              <div class="text-subtitle-1">Completion Rate</div>
            </div>
          </v-card>
        </v-col>
      </v-row>
      
      <v-progress-linear
        class="mt-6"
        height="20"
        :model-value="monthlyStats.completionRate"
        color="success"
        rounded
      >
        <template v-slot:default>
          <div class="d-flex justify-space-between px-2">
            <strong>Completion Progress</strong>
            <strong>{{ monthlyStats.completionRate }}%</strong>
          </div>
        </template>
      </v-progress-linear>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.monthly-overview {
  transition: all 0.3s ease;
}

.stat-card {
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}
</style>