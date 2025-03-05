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
  startOfWeek,
  endOfWeek
} from 'date-fns';
import type { WorkoutStatus } from '../types';

const emit = defineEmits(['update:current-month']);
const store = useWorkoutStore();

const currentMonth = ref(new Date());
const selectedDate = ref(new Date());

watch(selectedDate, (newDate) => {
  store.selectedDate = format(newDate, 'yyyy-MM-dd');
});

watch(currentMonth, (newValue) => {
  emit('update:current-month', newValue);
});

selectedDate.value = parse(store.selectedDate, 'yyyy-MM-dd', new Date());

const formattedMonth = computed(() => {
  return format(currentMonth.value, 'MMMM yyyy');
});

const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentMonth.value);
  const monthEnd = endOfMonth(currentMonth.value);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
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

const getWorkoutStatus = (date: Date): WorkoutStatus | null => {
  const formattedDate = format(date, 'yyyy-MM-dd');
  const workouts = store.getWorkoutsByDate(formattedDate);
  if (workouts.length === 0) return null;
  
  return workouts[0].status;
};

const getDayClass = (day: Date) => {
  const classes = [];
  
  if (isToday(day)) {
    classes.push('today');
  }
  
  if (isSameDay(day, selectedDate.value)) {
    classes.push('selected');
  }
  
  const status = getWorkoutStatus(day);
  if (status) {
    classes.push(`status-${status}`);
  }
  
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
        
        <template v-for="(day) in calendarDays" :key="index">
          <div 
            class="calendar-day" 
            :class="getDayClass(day)"
            @click="selectDate(day)"
          >
            {{ format(day, 'd') }}
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
  transition: all 0.2s ease;
}

.calendar-day:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.calendar-day.today {
  border: 1px solid var(--v-primary-base);
}

.calendar-day.selected {
  background-color: var(--v-primary-base);
  color: #FFD700;
  font-weight: bold;
  box-shadow: 0 0 0 2px var(--v-primary-base), 0 0 0 4px rgba(37, 99, 235, 0.3);
  z-index: 1;
}

.calendar-day.other-month {
  opacity: 0.5;
}

.calendar-day.status-complete {
  background-color: rgba(76, 175, 80, 0.2);
  border: 2px solid #4CAF50;
}

.calendar-day.status-missed {
  background-color: rgba(244, 67, 54, 0.2);
  border: 2px solid #F44336;
}

.calendar-day.status-upcoming {
  background-color: rgba(158, 158, 158, 0.2);
  border: 2px solid #9E9E9E;
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