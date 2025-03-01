<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useWorkoutStore } from '../stores/workoutStore';
import { 
  format, 
  parse, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday, 
  isSameDay,
  getDay,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek
} from 'date-fns';

const store = useWorkoutStore();

const currentMonth = ref(new Date());
const selectedDate = ref(new Date());

// Update store's selected date when local selectedDate changes
watch(selectedDate, (newDate) => {
  store.selectedDate = format(newDate, 'yyyy-MM-dd');
});

// Initialize selectedDate from store
selectedDate.value = parse(store.selectedDate, 'yyyy-MM-dd', new Date());

const formattedMonth = computed(() => {
  return format(currentMonth.value, 'MMMM yyyy');
});

const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentMonth.value);
  const monthEnd = endOfMonth(currentMonth.value);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 }); // End on Sunday
  
  return eachDayOfInterval({ start: startDate, end: endDate });
});

const previousMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentMonth.value = new Date(
    currentMonth.value.getFullYear(),
    currentMonth.value.getMonth() + 1,
    1
  );
};

const selectDate = (date: Date) => {
  selectedDate.value = date;
};

const hasWorkout = (date: Date) => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  return store.getWorkoutsByDate(formattedDate).length > 0;
};

const getDayClass = (day: Date) => {
  const classes = [];
  
  if (isToday(day)) {
    classes.push('today');
  }
  
  if (isSameDay(day, selectedDate.value)) {
    classes.push('selected');
  }
  
  if (hasWorkout(day)) {
    classes.push('has-workout');
  }
  
  // Add a class for days not in the current month
  if (day.getMonth() !== currentMonth.value.getMonth()) {
    classes.push('other-month');
  }
  
  return classes.join(' ');
};
</script>

<template>
  <v-card class="calendar-card">
    <v-card-title class="calendar-header">
      <v-btn icon @click="previousMonth">
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <span class="month-title">{{ formattedMonth }}</span>
      <v-btn icon @click="nextMonth">
        <v-icon>mdi-chevron-right</v-icon>
      </v-btn>
    </v-card-title>
    
    <v-card-text>
      <div class="calendar-grid">
        <div class="calendar-day-header">Mon</div>
        <div class="calendar-day-header">Tue</div>
        <div class="calendar-day-header">Wed</div>
        <div class="calendar-day-header">Thu</div>
        <div class="calendar-day-header">Fri</div>
        <div class="calendar-day-header">Sat</div>
        <div class="calendar-day-header">Sun</div>
        
        <template v-for="(day, index) in calendarDays" :key="index">
          <div 
            class="calendar-day" 
            :class="getDayClass(day)"
            @click="selectDate(day)"
          >
            {{ format(day, 'd') }}
            <div v-if="hasWorkout(day)" class="workout-indicator"></div>
          </div>
        </template>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.calendar-card {
  margin-bottom: 16px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-title {
  font-weight: bold;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day-header {
  text-align: center;
  font-weight: bold;
  padding: 8px 0;
  font-size: 0.9rem;
}

.calendar-day {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 50%;
}

.calendar-day:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.calendar-day.today {
  border: 1px solid var(--v-primary-base);
}

.calendar-day.selected {
  background-color: var(--v-primary-base);
  color: white;
}

.calendar-day.other-month {
  opacity: 0.5;
}

.workout-indicator {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--v-accent-base);
}

@media (max-width: 600px) {
  .calendar-day {
    height: 36px;
    font-size: 0.9rem;
  }
  
  .calendar-day-header {
    font-size: 0.8rem;
  }
}
</style>