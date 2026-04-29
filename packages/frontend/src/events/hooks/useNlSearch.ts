import { useMutation } from '@tanstack/react-query'
import { searchByNaturalLanguage } from '../services/api'

export function useNlSearch() {
  return useMutation({
    mutationFn: searchByNaturalLanguage,
  })
}
