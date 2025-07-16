import axios from "axios"

// Configure Axios instance for your FastAPI backend
const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Replace with your actual backend URL
  headers: {
    "Content-Type": "application/json",
  },
})

export default api
