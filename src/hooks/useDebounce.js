import { useState, useEffect } from 'react'

/**
 * Hook personalizado para debounce
 * @param {any} value - Valor a ser debounced
 * @param {number} delay - Delay em milissegundos
 * @returns {any} - Valor debounced
 */
export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Hook para debounce de função
 * @param {Function} callback - Função a ser debounced
 * @param {number} delay - Delay em milissegundos
 * @returns {Function} - Função debounced
 */
export function useDebouncedCallback(callback, delay = 300) {
  const [timer, setTimer] = useState(null)

  const debouncedCallback = (...args) => {
    if (timer) {
      clearTimeout(timer)
    }

    const newTimer = setTimeout(() => {
      callback(...args)
    }, delay)

    setTimer(newTimer)
  }

  useEffect(() => {
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [timer])

  return debouncedCallback
}
