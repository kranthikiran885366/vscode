import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold
   ring-offset-background transition-all duration-300 ease-out focus-visible:outline-none 
   focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 
   [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform duration-300
   relative overflow-hidden group active:scale-95`,
  {
    variants: {
      variant: {
        // Primary gradient button with glow effect
        default: `bg-gradient-to-r from-blue-600 to-purple-600 text-white 
                  hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/50
                  dark:hover:shadow-blue-500/30 active:from-blue-800 active:to-purple-800
                  before:absolute before:inset-0 before:bg-white before:opacity-0 hover:before:opacity-10 
                  before:transition-opacity before:duration-300`,

        // Destructive red button
        destructive: `bg-gradient-to-r from-red-600 to-red-700 text-white 
                      hover:from-red-700 hover:to-red-800 hover:shadow-lg hover:shadow-red-500/50
                      dark:hover:shadow-red-500/30 active:from-red-800 active:to-red-900
                      before:absolute before:inset-0 before:bg-white before:opacity-0 hover:before:opacity-10`,

        // Outline button with accent on hover
        outline: `border-2 border-slate-600 bg-transparent text-slate-100 hover:bg-slate-700/50 
                  hover:border-slate-400 hover:text-white hover:shadow-md dark:hover:shadow-slate-900/50
                  active:bg-slate-700/70 active:border-slate-300 transition-all duration-300`,

        // Secondary muted button
        secondary: `bg-slate-700/50 text-slate-100 border border-slate-600 hover:bg-slate-700 
                    hover:border-slate-500 hover:text-white hover:shadow-md dark:hover:shadow-slate-900/50
                    active:bg-slate-800 transition-all duration-300`,

        // Ghost/transparent button
        ghost: `text-slate-300 hover:bg-slate-700/30 hover:text-white active:bg-slate-700/50 
                transition-all duration-300 before:absolute before:inset-0 before:bg-white 
                before:opacity-0 hover:before:opacity-5 before:transition-opacity`,

        // Link style button
        link: `text-blue-400 underline-offset-4 hover:underline hover:text-blue-300 active:text-blue-500
               transition-colors duration-300`,

        // Success button
        success: `bg-gradient-to-r from-green-600 to-emerald-600 text-white 
                  hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-500/50
                  active:from-green-800 active:to-emerald-800 transition-all duration-300`,

        // Warning button
        warning: `bg-gradient-to-r from-amber-600 to-orange-600 text-white 
                  hover:from-amber-700 hover:to-orange-700 hover:shadow-lg hover:shadow-amber-500/50
                  active:from-amber-800 active:to-orange-800 transition-all duration-300`,

        // Info button
        info: `bg-gradient-to-r from-cyan-600 to-blue-600 text-white 
               hover:from-cyan-700 hover:to-blue-700 hover:shadow-lg hover:shadow-cyan-500/50
               active:from-cyan-800 active:to-blue-800 transition-all duration-300`,
      },

      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base font-semibold",
        xl: "h-14 rounded-lg px-10 text-lg font-bold",
        icon: "h-10 w-10 p-0",
        icon-sm: "h-8 w-8 p-0",
        icon-lg: "h-12 w-12 p-0",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = disabled || isLoading

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          "relative",
          isDisabled && "opacity-60 cursor-not-allowed"
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {/* Ripple effect overlay */}
        <span className="absolute inset-0 overflow-hidden rounded-lg">
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
        </span>

        {/* Content wrapper */}
        <span className="relative inline-flex items-center justify-center gap-2">
          {/* Icon with rotation on hover */}
          {icon && (
            <span className="inline-flex group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
              {icon}
            </span>
          )}

          {/* Loading spinner */}
          {isLoading && (
            <span className="inline-flex animate-spin">
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          )}

          {/* Button text */}
          {children && <span>{children}</span>}
        </span>

        {/* Glow effect for primary buttons */}
        {variant === "default" && (
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
        )}

        {/* Success glow */}
        {variant === "success" && (
          <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 -z-10" />
        )}

        {/* Styles for animations */}
        <style jsx>{`
          button {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          }

          button:hover {
            transform: translateY(-2px);
          }

          button:active {
            transform: translateY(0);
          }

          button:focus-visible {
            outline: 2px solid currentColor;
            outline-offset: 2px;
          }

          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }

          button::after {
            content: "";
            position: absolute;
            top: 50%;
            left: 50%;
            width: 5px;
            height: 5px;
            background: rgba(255, 255, 255, 0.5);
            opacity: 0;
            border-radius: 100%;
            transform: scale(1);
            transform-origin: 50%;
            pointer-events: none;
          }

          button:active::after {
            animation: ripple 0.6s ease-out;
          }
        `}</style>
      </Comp>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }