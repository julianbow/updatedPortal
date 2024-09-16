<template>
  <div class="auth-container">
    <div class="auth-card">
      <h1>WeatherFlow Portal</h1>
      <h2>{{ showRegistration ? 'Register' : 'Login' }}</h2>

      <!-- Login Form -->
      <form v-if="!showRegistration" @submit.prevent="login" class="form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" required class="input-field" />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input :type="passwordVisible ? 'text' : 'password'" v-model="password" required class="input-field" />
          <span
            id="show-hide-password"
            :class="passwordVisible ? 'eye-slash-icon' : 'eye-icon'"
            @click.prevent="showPassword"
          ></span>
        </div>
        <button type="submit" class="btn">Login</button>
        <p class="toggle-text">
          Don't have an account? <a @click="toggleForm">Register here</a>
        </p>
      </form>

      <!-- Registration Form -->
      <form v-if="showRegistration" @submit.prevent="register" class="form">
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" v-model="email" required class="input-field" />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input :type="passwordVisible ? 'text' : 'password'" v-model="password" required class="input-field" />
          <span
            id="show-hide-password"
            :class="passwordVisible ? 'eye-slash-icon' : 'eye-icon'"
            @click.prevent="showPassword"
          ></span>
        </div>
        <button type="submit" class="btn">Register</button>
        <p class="toggle-text">
          Already have an account? <a @click="toggleForm">Login here</a>
        </p>
      </form>

      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script>
import "@/assets/css/login.css";
import { auth } from '../../firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: '',
      showRegistration: false,
      passwordVisible: false
    };
  },
  methods: {
    async login() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.error = '';
        this.$router.push('/home'); // Redirect to home after login
      } catch (err) {
        this.error = 'Failed to log in. Please check your credentials.';
        console.error(err);
      }
    },
    async register() {
      try {
        await createUserWithEmailAndPassword(auth, this.email, this.password);
        this.error = '';
        // Handle successful registration
      } catch (err) {
        this.error = 'Failed to register. Please try again.';
        console.error(err);
      }
    },
    showPassword() {
      this.passwordVisible = !this.passwordVisible;
    },
    toggleForm() {
      this.showRegistration = !this.showRegistration;
    }
  }
};
</script>