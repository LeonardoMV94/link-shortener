<template>
  <div class="max-w-md mx-auto mt-16 p-6 bg-white dark:bg-gray-800">
    <form @submit.prevent="submitForm" class="space-y-5">
      <div>
        <label for="url" class="block text-sm font-medium text-gray-700 dark:text-gray-300">URL para acortar</label>
        <input
          id="url"
          v-model.trim="url"
          type="text"
          placeholder="https://ejemplo.com"
          class="w-full mt-1 p-2 border rounded-md focus:ring focus:ring-blue-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
          :disabled="loading"
          required
        />
      </div>

      <div>        
        <!-- Contenedor para Turnstile directo -->
        <div id="cf-turnstile" ref="turnstileContainer"></div>
      </div>

      <button
        type="submit"
        class="w-full p-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
        :disabled="!canSubmit || loading"
      >
        {{ loading ? 'Procesando...' : 'Acortar URL' }}
      </button>

      <p v-if="errorMessage" class="text-red-500 text-sm">
        {{ errorMessage }}
      </p>
      
     
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { VITE_SITEKEY, VITE_API_URL } from 'astro:env/client'

const sitekey = VITE_SITEKEY
const apiUrl = VITE_API_URL

const url = ref('')
const isValidUrl = ref(false)
const turnstileCompleted = ref(false)
const errorMessage = ref('')
const loading = ref(false)
const turnstileContainer = ref(null)

// Verificar si podemos enviar el formulario
const canSubmit = computed(() => {
  return isValidUrl.value && turnstileCompleted.value
})

// Validar URL
const checkUrl = () => {
  try {
    if (!url.value) {
      isValidUrl.value = false
      return
    }
    new URL(url.value)
    isValidUrl.value = true
  } catch {
    isValidUrl.value = false
  }
}

// Watch para URL
watch(url, checkUrl)


// Inicializar Turnstile directamente
onMounted(() => {
  checkUrl()
  
  // Cargar script de Turnstile si no está disponible
  if (!window.turnstile) {
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.onload = initializeTurnstile
    document.head.appendChild(script)
  } else {
    initializeTurnstile()
  }
})

// Inicializar el widget de Turnstile
const initializeTurnstile = () => {
  if (!turnstileContainer.value || !window.turnstile) return
  
  console.log('[Turnstile] Inicializando widget')
  
  window.turnstile.render(turnstileContainer.value, {
    sitekey: sitekey,
    callback: function(token: string) {
      console.log('[Turnstile] Callback exitoso, token recibido')
      turnstileCompleted.value = true
    },
    'expired-callback': function() {
      console.log('[Turnstile] Token expirado')
      turnstileCompleted.value = false
    },
    'error-callback': function(error: any) {
      console.error('[Turnstile] Error:', error)
      turnstileCompleted.value = false
    }
  })
}

// Enviar formulario
const submitForm = async () => {
  if (!canSubmit.value) return
  
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(`${apiUrl}/acortador`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: url.value }),
    })

    if (!response.ok) throw new Error('Error en el servidor')

    const data = await response.json()

    if (data.shortUrl) {
      window.location.href = `${apiUrl}/code?code=${data.shortUrl}`
    } else {
      errorMessage.value = 'Respuesta inesperada del servidor.'
    }
  } catch (error) {
    errorMessage.value = 'Ocurrió un error al acortar la URL.'
  } finally {
    loading.value = false
  }
}
</script>

<script lang="ts">
// Declaración para TypeScript
declare global {
  interface Window {
    turnstile: {
      render: (container: Element, options: any) => string
      reset: (widgetId: string) => void
    }
  }
}
</script>