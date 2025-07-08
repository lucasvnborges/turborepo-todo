import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { UseFormRegisterReturn } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface FormFieldProps {
  id: string
  label: string
  type?: string
  error?: string
  className?: string
  placeholder: string
  register: UseFormRegisterReturn<string>
}

export function FormField({
  id,
  label,
  type = 'text',
  placeholder,
  register,
  error,
  className,
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={inputType}
          placeholder={placeholder}
          className={`border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 mt-1 ${isPassword ? 'pr-10' : ''} ${className || ''}`}
          {...register}
        />
        {isPassword && (
          <Button
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-slate-400" />
            ) : (
              <Eye className="h-4 w-4 text-slate-400" />
            )}
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
