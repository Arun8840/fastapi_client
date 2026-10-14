import axios from "axios"

// --- 1. Base Configuration ---
const publicConfig = {
 baseURL: process.env.NEXT_PUBLIC_API_URL,
 headers: {
  "Content-Type": "application/json",
 },
 withCredentials: true,
}

export const publicApi = axios.create(publicConfig)

const privateConfig = {
 baseURL: process.env.NEXT_PUBLIC_API_URL,
 headers: {
  "Content-Type": "application/json",
 },
 withCredentials: true,
}

export const privateApi = axios.create(privateConfig)