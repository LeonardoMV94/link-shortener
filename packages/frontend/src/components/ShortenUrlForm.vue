<template>
    <div class="card w-full max-w-md shadow-xl bg-white dark:bg-gray-800 p-6 mx-auto">
      <h2 class="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Ingresa un enlace
      </h2>
  
      <div class="w-full mt-4">
            <div class="join w-full">
                <input v-model="urlInput" type="url" placeholder="https://paginaweb.cl/archivo.pdf" required
                    class="input input-bordered w-full join-item" />
                <button @click="handleSubmit" type="btn" class="btn btn-neutral join-item ml-2">
                    Acortar
                </button>
            </div>
        </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const urlInput = ref('')
  const errorMessage = ref('')
  const loading = ref(false)
  
  const handleSubmit = async () => {
    errorMessage.value = ''
  
    // Validar URL básica
    try {
      new URL(urlInput.value)
    } catch (error) {
        console.log(error)
      errorMessage.value = 'Ingrese una URL válida'
      return
    }
  
    loading.value = true
  
    try {
      const response = await fetch('https://api.short.pctester.cl/acortador', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlInput.value }),
      })
      console.log(response)
      if (!response.ok) {
        throw new Error('Error en el servidor')
      }
  
      const data = await response.json()
  
      if (data.shortUrl) {
        window.location.href = `https://short.pctester.cl/code?code=${data.shortUrl}`
      } else {
        errorMessage.value = 'Respuesta inesperada del servidor'
      }
    } catch (error) {
      errorMessage.value = 'Ocurrió un error al acortar la URL'
      console.error(error)
    } finally {
      loading.value = false
    }
  }
  </script>
  
  <style scoped>
  .text-error {
    color: #f87171; /* Tailwind red-400 */
  }
  </style>
  