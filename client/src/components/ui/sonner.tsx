import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "#333333",
          "--normal-border": "var(--border)",
          "--success-bg": "#ecfdf5", // Light green background for success
          "--success-text": "#047857", // Green text for success
          "--success-border": "#10b981", // Green border for success
          "--error-bg": "#fef2f2", // Light red background for error
          "--error-text": "#dc3545", // Red text for error
          "--error-border": "#f87171", // Red border for error
          "--font-weight": "500",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          description: 'text-gray-900 dark:text-gray-100 font-medium',
          toast: 'group toast group-[.toaster]:shadow-lg',
          success: 'bg-[--success-bg] text-[--success-text] border-[--success-border]',
          error: 'bg-[--error-bg] text-[--error-text] border-[--error-border]'
        }
      }}
      {...props}
    />
  )
}

export { Toaster }
