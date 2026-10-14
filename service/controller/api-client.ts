import axios from "axios"
import type { ApiResponse } from "@/types"

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

// --- 2. Error helper ---
// The API returns { status, message, data } even for errors, so prefer
// the server message over axios' generic "Request failed with status code ...".
export const getApiErrorMessage = (error: unknown): string => {
 if (axios.isAxiosError<ApiResponse>(error)) {
  return error.response?.data?.message ?? error.message
 }
 if (error instanceof Error) {
  return error.message
 }
 return "Something went wrong"
}
