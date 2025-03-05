<script setup lang="ts">
import { computed } from 'vue';
import { useWorkoutStore } from '../stores/workoutStore';
import { parseISO, isBefore } from 'date-fns';

const store = useWorkoutStore();

const globalStats = computed(() => {
  const stats = {
    total: 0,
    complete: 0,
    missed: 0,
    upcoming: 0,
    completionRate: 0,
    streakCount: 0,
    longestStreak: 0
  };
  
  // Group workouts by date
  const workoutsByDate = store.workouts.reduce((acc, workout) => {
    if (!acc[workout.date]) {
      acc[workout.date] = [];
    }
    acc[workout.date].push(workout);
    return acc;
  }, {} as Record<string, typeof store.workouts>);
  
  // Sort dates
  const sortedDates = Object.keys(workoutsByDate).sort((a, b) => 
    parseISO(a).getTime() - parseISO(b).getTime()
  );
  
  let currentStreak = 0;
  
  // Count days by status (taking the "best" status for each day)
  sortedDates.forEach((date) => {
    const dayWorkouts = workoutsByDate[date];
    stats.total++;
    
    // Determine the "best" status for the day
    // complete > upcoming > missed
    if (dayWorkouts.some(w => w.status === 'complete')) {
      stats.complete++;
    } else if (dayWorkouts.some(w => w.status === 'upcoming')) {
      stats.upcoming++;
    } else {
      stats.missed++;
    }
  });
  
  // Calculate completion rate only for completed and missed days
  const totalCompleted = stats.complete;
  const totalAttempted = stats.complete + stats.missed;
  stats.completionRate = totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) : 0;
  
  // Calculate streaks
  sortedDates.forEach((date) => {
    const dayWorkouts = workoutsByDate[date];
    if (dayWorkouts.some(w => w.status === 'complete')) {
      currentStreak++;
      stats.longestStreak = Math.max(stats.longestStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  // Calculate current streak (only count up to today)
  const today = new Date();
  currentStreak = 0;
  for (let i = sortedDates.length - 1; i >= 0; i--) {
    const date = sortedDates[i];
    const workoutDate = parseISO(date);
    // Stop counting if we encounter a future date
    if (isBefore(today, workoutDate)) {
      continue;
    }
    // Stop counting if we encounter a day without any complete workouts
    if (!workoutsByDate[date].some(w => w.status === 'complete')) {
      break;
    }
    currentStreak++;
  }
  stats.streakCount = currentStreak;
  
  return stats;
});

const statusChartData = computed(() => {
  if (globalStats.value.total === 0) {
    return [
      {
        status: 'Complete',
        percentage: 0,
        color: 'success'
      },
      {
        status: 'Missed',
        percentage: 0,
        color: 'error'
      },
      {
        status: 'Upcoming',
        percentage: 0,
        color: 'grey'
      }
    ];
  }

  const total = globalStats.value.total;
  return [
    {
      status: 'Complete',
      percentage: Math.round((globalStats.value.complete / total) * 100),
      color: 'success'
    },
    {
      status: 'Missed',
      percentage: Math.round((globalStats.value.missed / total) * 100),
      color: 'error'
    },
    {
      status: 'Upcoming',
      percentage: Math.round((globalStats.value.upcoming / total) * 100),
      color: 'grey'
    }
  ];
});
</script>

<template>
  <v-card class="global-overview mb-4">
    <v-card-title class="text-center text-h5 pt-4">
      Global Workout Statistics
    </v-card-title>
    
    <v-card-text>
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="primary" variant="outlined">
            <div class="d-flex flex-column align-center pa-4">
              <div class="text-h4 font-weight-bold">{{ globalStats.total }}</div>
              <div class="text-subtitle-1">Total Workout Days</div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="success" variant="outlined">
            <div class="d-flex flex-column align-center pa-4">
              <div class="text-h4 font-weight-bold">{{ globalStats.complete }}</div>
              <div class="text-subtitle-1">Completed Days</div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" color="error" variant="outlined">
            <div class="d-flex flex-column align-center pa-4">
              <div class="text-h4 font-weight-bold">{{ globalStats.missed }}</div>
              <div class="text-subtitle-1">Missed Days</div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" sm="6" md="3">
          <v-card class="stat-card" variant="outlined">
            <div class="d-flex flex-column align-center pa-4">
              <div class="text-h4 font-weight-bold">{{ globalStats.completionRate }}%</div>
              <div class="text-subtitle-1">Success Rate</div>
            </div>
          </v-card>
        </v-col>
      </v-row>
      
      <v-row class="mt-4">
        <v-col cols="12" md="6">
          <v-card class="stat-card" variant="outlined">
            <div class="d-flex flex-column pa-4">
              <div class="text-h6 mb-4">Workout Days Distribution</div>
              <div v-if="globalStats.total === 0" class="text-center pa-4">
                <p class="text-medium-emphasis">No workouts recorded yet</p>
              </div>
              <div v-else v-for="item in statusChartData" :key="item.status" class="mb-2">
                <div class="d-flex justify-space-between mb-1">
                  <span>{{ item.status }}</span>
                  <span>{{ item.percentage }}%</span>
                </div>
                <v-progress-linear
                  :model-value="item.percentage"
                  :color="item.color"
                  height="8"
                  rounded
                ></v-progress-linear>
              </div>
            </div>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="6">
          <v-card class="stat-card" variant="outlined">
            <div class="d-flex flex-column pa-4">
              <div class="text-h6 mb-4">Streaks</div>
              <div class="d-flex justify-space-between align-center mb-4">
                <div>
                  <div class="text-h4 font-weight-bold">{{ globalStats.streakCount }}</div>
                  <div class="text-subtitle-2">Current Streak</div>
                </div>
                <v-divider vertical class="mx-4"></v-divider>
                <div>
                  <div class="text-h4 font-weight-bold">{{ globalStats.longestStreak }}</div>
                  <div class="text-subtitle-2">Longest Streak</div>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.global-overview {
  transition: all 0.3s ease;
}

.stat-card {
  transition: transform 0.2s ease;
  height: 100%;
}

.stat-card:hover {
  transform: translateY(-4px);
}
</style>