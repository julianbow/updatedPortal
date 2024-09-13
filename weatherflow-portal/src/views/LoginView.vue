<template>
    <div class="auth-container">
      <div class="auth-card">
        <h2>{{ showRegistration ? 'Register' : 'Login' }}</h2>

        <!-- Login Form -->
        <form v-if="!showRegistration" @submit.prevent="login">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" v-model="email" required class="input-field" />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" v-model="password" required class="input-field" />
          </div>
          <button type="submit" class="btn">Login</button>
          <p class="toggle-text">
            Don't have an account? <a @click="toggleForm">Register here</a>
          </p>
        </form>

        <!-- Registration Form -->
        <form v-if="showRegistration" @submit.prevent="register">
          <div class="form-group">
            <label for="email">Email:</label>
            <input type="email" v-model="email" required class="input-field" />
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" v-model="password" required class="input-field" />
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
  import { ref } from 'vue';
  import { auth } from '../../firebase.js'; // Firebase auth instance
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
          // Handle successful login
        } catch (err) {
          error.value = 'Failed to log in. Please check your credentials.';
          console.error(err);
        }
      };

      const register = async () => {
        try {
          await createUserWithEmailAndPassword(auth, email.value, password.value);
          error.value = '';
          // Handle successful registration
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

  <style scoped>
  .auth-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f2f5;
  }

  .auth-card {
    background-color: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    width: 100%;
    text-align: center;
  }

  h2 {
    margin-bottom: 1.5rem;
    color: #333;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #555;
  }

  .input-field {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 1rem;
    outline: none;
    transition: border-color 0.3s;
  }

  .input-field:focus {
    border-color: #007bff;
  }

  .btn {
    background-color: #007bff;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 5px;
    font-size: 1rem;
    cursor: pointer;
    width: 100%;
    margin-top: 1rem;
  }

  .btn:hover {
    background-color: #0056b3;
  }

  .toggle-text {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: #666;
  }

  .toggle-text a {
    color: #007bff;
    text-decoration: none;
    cursor: pointer;
  }

  .toggle-text a:hover {
    text-decoration: underline;
  }

  .error-message {
    margin-top: 1rem;
    color: #ff4d4d;
    font-size: 0.875rem;
  }
  </style>
