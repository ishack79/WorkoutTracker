<script setup lang="ts">
import { ref } from 'vue';
import WorkoutCalendar from './components/WorkoutCalendar.vue';
import WorkoutList from './components/WorkoutList.vue';
</script>

<template>
  <v-app>
    <v-app-bar color="primary" app>
      <v-app-bar-title>Workout Tracker</v-app-bar-title>
    </v-app-bar>
    
    <v-main>
      <v-container>
        <v-row>
          <v-col cols="12">
            <WorkoutCalendar />
          </v-col>
          
          <v-col cols="12">
            <WorkoutList />
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    
    <v-footer app class="d-flex justify-center">
      <div class="text-caption">Workout Tracker &copy; {{ new Date().getFullYear() }}</div>
    </v-footer>
  </v-app>
</template>