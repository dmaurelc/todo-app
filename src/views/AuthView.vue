<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { supabase } from "../lib/supabase";
import { useAuth } from "../composables/useAuth";

const loading = ref(false);
const email = ref("");
const password = ref("");
const isSignUp = ref(false);
const errorMsg = ref("");
const router = useRouter();
const { loginAsGuest } = useAuth();

const handleAuth = async () => {
  try {
    loading.value = true;
    errorMsg.value = "";

    const { error } = isSignUp.value
      ? await supabase.auth.signUp({
          email: email.value,
          password: password.value,
        })
      : await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value,
        });

    if (error) throw error;

    if (!isSignUp.value) {
      router.push("/dashboard");
    } else {
      // En un flujo real, pediríamos confirmar email.
      // Para MVP, Supabase suele permitir login inmediato si 'Confirm email' está desactivado,
      // o mostrar mensaje.
      if (!error)
        errorMsg.value =
          "Revisa tu email para confirmar (si es necesario) o inicia sesión.";
    }
  } catch (error) {
    errorMsg.value = error.message;
  } finally {
    loading.value = false;
  }
};

const handleGuestLogin = () => {
  loginAsGuest();
  router.push("/dashboard");
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
      <div class="p-8 pb-6 bg-linear-to-b from-green-50 to-white text-center">
        <h2 class="text-3xl font-bold text-gray-800 mb-2">
          {{ isSignUp ? "Crear Cuenta" : "Bienvenido" }}
        </h2>
        <p class="text-gray-500 text-sm">
          {{
            isSignUp
              ? "Empieza a organizar tu día"
              : "Ingresa para ver tus tareas"
          }}
        </p>
      </div>

      <div class="p-8 pt-0">
        <form @submit.prevent="handleAuth" class="space-y-5">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Email</label
            >
            <input
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              placeholder="nombre@ejemplo.com"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2"
              >Contraseña</label
            >
            <input
              v-model="password"
              type="password"
              required
              minlength="6"
              class="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
              placeholder="••••••"
            />
          </div>

          <div
            v-if="errorMsg"
            class="text-red-500 text-sm bg-red-50 p-3 rounded-lg flex items-center gap-2"
          >
            <svg
              class="w-4 h-4 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
            {{ errorMsg }}
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition shadow-lg shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <span v-if="loading">Cargando...</span>
            <span v-else>{{
              isSignUp ? "Registrarse" : "Iniciar Sesión"
            }}</span>
          </button>
        </form>

        <div class="mt-8 text-center text-sm">
          <span class="text-gray-500">
            {{ isSignUp ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?" }}
          </span>
          <button
            @click="isSignUp = !isSignUp"
            class="ml-2 text-emerald-600 hover:text-emerald-800 font-bold transition"
          >
            {{ isSignUp ? "Inicia Sesión" : "Regístrate" }}
          </button>
        </div>

        <div class="mt-6 border-t border-gray-100 pt-6 text-center">
          <button
            @click="handleGuestLogin"
            class="text-emerald-600 hover:text-emerald-800 hover:underline font-semibold text-sm transition-colors py-2"
          >
            Continuar como Invitado
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
