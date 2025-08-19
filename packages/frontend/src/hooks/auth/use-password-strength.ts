import { useState, useEffect } from 'react'
import { passwordStrengthValidator, PasswordStrength } from '@/lib/validations/auth'

export interface UsePasswordStrengthReturn {
  strength: PasswordStrength | null
  getStrengthText: () => string
  getStrengthPercentage: () => number
}

export function usePasswordStrength(password: string): UsePasswordStrengthReturn {
  const [strength, setStrength] = useState<PasswordStrength | null>(null)

  useEffect(() => {
    if (!password || password.length < 1) {
      setStrength(null)
      return
    }

    const result = passwordStrengthValidator(password)
    setStrength(result)
  }, [password])


  const getStrengthText = (): string => {
    if (!strength) return ''

    switch (strength.score) {
      case 0:
        return 'Very Weak'
      case 1:
        return 'Weak'
      case 2:
        return 'Fair'
      case 3:
        return 'Good'
      case 4:
        return 'Strong'
      default:
        return ''
    }
  }

  const getStrengthPercentage = (): number => {
    if (!strength) return 0
    return ((strength.score + 1) / 5) * 100
  }

  return {
    strength,
    getStrengthText,
    getStrengthPercentage,
  }
}