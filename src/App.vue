<script setup lang="ts">
import { ref } from 'vue';
import WorkoutCalendar from './components/WorkoutCalendar.vue';
import WorkoutList from './components/WorkoutList.vue';
import GlobalOverview from './components/GlobalOverview.vue';

const currentMonth = ref(new Date());
const currentView = ref(0);
</script>

<template>
  <v-app>
    <v-app-bar color="primary" app>
      <v-app-bar-title>Workout Tracker</v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn-toggle
        v-model="currentView"
        color="primary"
        rounded="pill"
        mandatory
      >
        <v-btn value="0">
          <v-icon>mdi-calendar</v-icon>
          Calendar
        </v-btn>
        <v-btn value="1">
          <v-icon>mdi-chart-box</v-icon>
          Statistics
        </v-btn>
      </v-btn-toggle>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <v-window v-model="currentView">
          <v-window-item value="0">
            <v-row>
              <v-col cols="12">
                <WorkoutCalendar @update:current-month="currentMonth = $event" />
              </v-col>
              
              <v-col cols="12">
                <WorkoutList />
              </v-col>
            </v-row>
          </v-window-item>
          
          <v-window-item value="1">
            <v-row>
              <v-col cols="12">
                <GlobalOverview />
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-container>
    </v-main>
    
    <v-footer app class="d-flex justify-center">
      <div class="text-caption">Workout Tracker &copy; {{ new Date().getFullYear() }}</div>
    </v-footer>
  </v-app>
</template>

<style scoped>
.v-window {
  height: auto !important;
}

.v-window__container {
  height: auto !important;
}
</style>