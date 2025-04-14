
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { VITE_API_URL } from "astro:env/client";
const apiUrl = VITE_API_URL

const isLoading = ref(true)
const user = ref<{ name: string; picture: string } | null>(null)

onMounted(async () => {
    console.log('Cargando sesión...')
    try {
        const res = await fetch(`${apiUrl}/auth/me`, {
            credentials: 'include',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        })

        if (!res.ok) throw new Error('No autorizado')

        const data = await res.json()

        if (data.user) {
            user.value = data.user
        }
    } catch (error) {
        console.error('No hay sesión activa', error)
    } finally {
        isLoading.value = false // 👈 Esto es lo que faltaba
    }
})
</script>

<template>
    <div class="absolute top-4 right-4">
        <div v-if="isLoading">
            Cargando sesión...
        </div>

        <div v-else-if="user">
            <div class="flex items-center space-x-2">
                <img :src="user.picture" alt="Avatar" class="w-8 h-8 rounded-full" />
                <span>{{ user.name }}</span>
                <a :href="`${apiUrl}/auth/logout`">
                    <button class="btn btn-outline">Salir</button>
                </a>
            </div>
        </div>

        <div v-else>
            <a :href="`${apiUrl}/auth/google`">
                <button class="btn bg-white text-black border-[#e5e5e5] hover:text-white hover:bg-black">
                    <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512">
                        <g>
                            <path d="m0 0H512V512H0" fill="#fff"></path>
                            <path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path>
                            <path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path>
                            <path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path>
                            <path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path>
                        </g>
                    </svg>
                    Iniciar sesión con Google
                </button>
            </a>
        </div>
    </div>
</template>
