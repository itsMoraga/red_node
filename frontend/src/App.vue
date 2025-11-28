<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reactive state
const temperature = ref(0)
const humidity = ref(0)
const isConnected = ref(false)
const connectionError = ref('')
const sensorHistory = ref([])

let ws = null

const connectWebSocket = () => {
  try {
    ws = new WebSocket('ws://localhost:3000')

    ws.onopen = () => {
      isConnected.value = true
      connectionError.value = ''
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.sensor === 'temp') {
          temperature.value = parseFloat(data.value)
          addToHistory('Temperature', data.value, '°C')
        } else if (data.sensor === 'hum') {
          humidity.value = parseFloat(data.value)
          addToHistory('Humidity', data.value, '%')
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    ws.onerror = () => {
      connectionError.value = 'Connection error occurred'
      isConnected.value = false
    }

    ws.onclose = () => {
      isConnected.value = false
      setTimeout(connectWebSocket, 3000)
    }
  } catch (error) {
    connectionError.value = 'Failed to connect to server'
  }
}

const addToHistory = (sensor, value, unit) => {
  const timestamp = new Date().toLocaleTimeString()
  sensorHistory.value.unshift({ sensor, value, unit, timestamp })
  if (sensorHistory.value.length > 10) sensorHistory.value.pop()
}

onMounted(() => connectWebSocket())
onUnmounted(() => { if (ws) ws.close() })
</script>

<template>
  <div class="dashboard full-screen">
    <header>
      <h1>Panel de Control IoT</h1>
      <div class="connection-status" :class="{ connected: isConnected, disconnected: !isConnected }">
        <span class="status-dot"></span>
        {{ isConnected ? 'Conectado' : 'Desconectado' }}
      </div>
    </header>

    <div v-if="connectionError" class="error-banner">
      {{ connectionError }}
    </div>

    <main class="content">
      <div class="sensor-grid">
        <div class="sensor-card temperature">
          <div class="sensor-icon">🌡️</div>
          <div class="sensor-info">
            <h2>Temperatura</h2>
            <div class="sensor-value">{{ temperature.toFixed(2) }} <span class="unit">°C</span></div>
          </div>
        </div>

        <div class="sensor-card humidity">
          <div class="sensor-icon">💧</div>
          <div class="sensor-info">
            <h2>Humedad</h2>
            <div class="sensor-value">{{ humidity.toFixed(2) }} <span class="unit">%</span></div>
          </div>
        </div>
      </div>

      <div class="history-section full-height">
        <h2>📊 Lecturas Recientes</h2>
        <div class="history-list">
          <div v-if="sensorHistory.length === 0" class="no-data">Esperando datos de los sensores...</div>
          <div v-for="(item, index) in sensorHistory" :key="index" class="history-item">
            <span class="history-sensor">{{ item.sensor }}</span>
            <span class="history-value">{{ item.value }} {{ item.unit }}</span>
            <span class="history-time">{{ item.timestamp }}</span>
          </div>
        </div>
      </div>
    </main>

    <footer>
    </footer>
  </div>
</template>

<style scoped>
.dashboard.full-screen {
  height: 100vh;
  min-height: 100vh;
}

/* Rest of your styles remain unchanged */
</style>
