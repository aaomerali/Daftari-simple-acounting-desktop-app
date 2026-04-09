/// <reference types="vite/client" />

interface Window {
  api: {
    dbQuery: (query: string, params?: any[]) => Promise<any[]>
    dbRun: (query: string, params?: any[]) => Promise<any>
    dbGet: (query: string, params?: any[]) => Promise<any>
    authHash: (password: string) => Promise<string>
  }
}
