<script setup lang="ts">
import { useLogin } from '@/composables/Auth/useLogin';

const { credentials, isLoading, error, handleLogin } = useLogin();
</script>

<template>
  <v-container fluid class="fill-height bg-grey-lighten-4">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="pa-6 pa-md-8 mx-auto" elevation="4">
          <v-card-title class="text-h4 text-center mb-6">Iniciar Sesión</v-card-title>

          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="credentials.email"
                label="Correo Electrónico"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                required
                class="mb-4"
                :disabled="isLoading"
              ></v-text-field>

              <v-text-field
                v-model="credentials.password"
                label="Contraseña"
                type="password"
                prepend-inner-icon="mdi-lock-outline"
                variant="outlined"
                required
                class="mb-4"
                :disabled="isLoading"
              ></v-text-field>

              <v-alert v-if="error" type="error" density="compact" class="mb-4">
                {{ error }}
              </v-alert>

              <v-btn
                :loading="isLoading"
                :disabled="isLoading"
                type="submit"
                color="primary"
                size="large"
                block
              >
                Ingresar
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
