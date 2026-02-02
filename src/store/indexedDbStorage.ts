import { get, set, del } from "idb-keyval"
import type { StateStorage } from "zustand/middleware"

export const indexedDbStorage: StateStorage = {
  getItem: async (name) => {
    const value = await get(name)
    return value ? JSON.stringify(value) : null
  },
  setItem: async (name, value) => {
    await set(name, JSON.parse(value))
  },
  removeItem: async (name) => {
    await del(name)
  },
}
