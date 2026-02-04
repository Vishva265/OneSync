// import React from "react"
// import clsx from "clsx"

// export const Button = React.forwardRef<
//   HTMLButtonElement,
//   React.ButtonHTMLAttributes<HTMLButtonElement>
// >(({ className, ...props }, ref) => (
//   <button
//     ref={ref}
//     className={clsx(
//       // Base shape & layout
//       "inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-150 ease-in-out",
//       "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",

//       // Default style: soft blue glass effect
//       "bg-blue-600/90 text-white backdrop-blur-md shadow-sm hover:bg-blue-700 hover:shadow-md",
//       "active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",

//       // Allow variant overrides
//       className,
//     )}
//     {...props}
//   />
// ))
// Button.displayName = "Button"

// src/components/ui/button.tsx
"use client"

import * as React from "react"
import clsx from "clsx"

type ButtonVariant = "primary" | "outline" | "ghost" | "secondary" | "danger"
type ButtonSize = "sm" | "md" | "lg" | "icon"

export interface UIButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600/90 text-white backdrop-blur-md shadow-sm hover:bg-blue-700 hover:shadow-md",
  outline:
    "bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 hover:text-blue-700 backdrop-blur-md",
  ghost:
    "bg-transparent text-blue-700 hover:bg-blue-100/40 backdrop-blur-md",
  secondary:
    "bg-gray-900 text-white hover:bg-black backdrop-blur-md",
  danger:
    "bg-red-600 text-white hover:bg-red-700 backdrop-blur-md",
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
  icon: "h-10 w-10 p-0",
}

export const Button = React.forwardRef<HTMLButtonElement, UIButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      disabled,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      disabled={disabled}
      className={clsx(
        // Base
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        // Size & variant
        SIZE_CLASSES[size],
        VARIANT_CLASSES[variant],
        // Allow custom overrides
        className
      )}
      {...props}
    />
  )
)

Button.displayName = "Button"
export default Button

