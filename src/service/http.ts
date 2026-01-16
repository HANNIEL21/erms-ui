import axios from 'axios'

const baseURL = import.meta.env.VITE_BASE_URL

const http = axios.create({
    baseURL: `${baseURL}/api`,
    timeout: 30_000,
})

export default http