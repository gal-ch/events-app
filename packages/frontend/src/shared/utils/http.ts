import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios'

let authToken: string | undefined

function attachAuthInterceptor(instance: AxiosInstance) {
  instance.interceptors.request.use((config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  })
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  responseType: 'json',
})
attachAuthInterceptor(axiosInstance)

const nestAxios = axios.create({
  baseURL: import.meta.env.VITE_NEST_API_BASE_URL ?? 'http://localhost:3011',
  responseType: 'json',
})
attachAuthInterceptor(nestAxios)

export function setToken(token: string | undefined) {
  authToken = token
}

export const getResponse = async <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options: AxiosRequestConfig = {},
): Promise<AxiosResponse<T>> => await axiosInstance.get<T>(url, { params, ...options })

export const get = async <T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options: AxiosRequestConfig = {},
): Promise<T> =>
  await axiosInstance
    .get<T>(url, { params, ...options })
    .then((res: AxiosResponse<T>) => res.data)
    .catch((error) => Promise.reject(error))

export const post = async <T = unknown>(
  url: string,
  body: unknown = {},
  config?: AxiosRequestConfig,
): Promise<T> =>
  await axiosInstance
    .post<T>(url, body, config)
    .then((res: AxiosResponse<T>) => res.data)
    .catch((error) => Promise.reject(error))

export const put = async <T = unknown>(
  url: string,
  body: unknown,
  config?: AxiosRequestConfig,
): Promise<T> =>
  await axiosInstance
    .put<T>(url, body, config)
    .then((res: AxiosResponse<T>) => res.data)
    .catch((error) => Promise.reject(error))

export const del = async <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
  await axiosInstance
    .delete<T>(url, config)
    .then((res: AxiosResponse<T>) => res.data)
    .catch((error) => Promise.reject(error))

export const nestPost = async <T = unknown>(
  url: string,
  body: unknown = {},
  config?: AxiosRequestConfig,
): Promise<T> =>
  await nestAxios
    .post<T>(url, body, config)
    .then((res: AxiosResponse<T>) => res.data)
    .catch((error) => Promise.reject(error))

type DelayData<T> = T | (() => T)

export const delay = async <T>(data: DelayData<T>, milliseconds = 1000): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(typeof data === 'function' ? (data as () => T)() : data), milliseconds)
  })

