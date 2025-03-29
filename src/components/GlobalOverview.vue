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
    longestStreak: 0,
    weeklyAverage: 0
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
  
  // Calculate weekly average of completed workouts
  if (sortedDates.length > 0) {
    const firstDate = parseISO(sortedDates[0]);
    const lastDate = parseISO(sortedDates[sortedDates.length - 1]);
    const totalDays = Math.max(1, Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalWeeks = Math.max(1, totalDays / 7);
    stats.weeklyAverage = parseFloat((stats.complete / totalWeeks).toFixed(1));
  }
  
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

const getWeeklyAverageColor = (average: number) => {
  if (average >= 4 && average <= 5) return 'success';
  if (average >= 6) return 'warning';
  if (average > 0 && average < 4) return 'amber-darken-2';
  return 'error';
};
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

      <v-row class="mt-4">
        <v-col cols="12">
          <v-card 
            class="stat-card" 
            variant="outlined" 
            :color="getWeeklyAverageColor(globalStats.weeklyAverage)" 
            border
          >
            <div class="d-flex flex-column align-center pa-4">
              <div class="text-h6 mb-2">Weekly Workout Average</div>
              <div class="text-h3 font-weight-bold">{{ globalStats.weeklyAverage }}</div>
              <div class="text-subtitle-1 mt-2">Workouts per Week</div>
              <div class="text-caption mt-3 text-center">
                <span v-if="globalStats.weeklyAverage >= 4 && globalStats.weeklyAverage <= 5">
                  Optimal workout frequency! Keep it up.
                </span>
                <span v-else-if="globalStats.weeklyAverage >= 6">
                  You're working out often. Don't forget to rest and recover.
                </span>
                <span v-else-if="globalStats.weeklyAverage > 0 && globalStats.weeklyAverage < 4">
                  Try to increase workout frequency for better results.
                </span>
                <span v-else>
                  No workouts recorded yet. Time to get started!
                </span>
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