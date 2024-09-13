<template>
    <div>
      <h2>Login</h2>
      <form @submit.prevent="login">
        <div>
          <label for="email">Email:</label>
          <input type="email" v-model="email" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a @click="toggleForm">Register here</a></p>

      <div v-if="error">{{ error }}</div>

      <!-- Registration Form -->
      <div v-if="showRegistration">
        <h2>Register</h2>
        <form @submit.prevent="register">
          <div>
            <label for="email">Email:</label>
            <input type="email" v-model="email" required />
          </div>
          <div>
            <label for="password">Password:</label>
            <input type="password" v-model="password" required />
          </div>
          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  </template>

<script>
import { ref } from 'vue';
import { auth } from '../../firebase.js' // Firebase auth instance
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export default {
  setup() {
    const email = ref('');
    const password = ref('');
    const error = ref('');
    const showRegistration = ref(false);

    const login = async () => {
      try {
        await signInWithEmailAndPassword(auth, email.value, password.value);
        error.value = '';
        // Redirect or update UI after successful login
      } catch (err) {
        error.value = 'Failed to log in. Please check your credentials.';
        console.error(err);
      }
    };

    const register = async () => {
      try {
        await createUserWithEmailAndPassword(auth, email.value, password.value);
        error.value = '';
        // Redirect or update UI after successful registration
      } catch (err) {
        error.value = 'Failed to register. Please try again.';
        console.error(err);
      }
    };

    const toggleForm = () => {
      showRegistration.value = !showRegistration.value;
    };

    return { email, password, error, showRegistration, login, register, toggleForm };
  }
};
</script>
