import * as React from "react"
import { Card } from "@/components/ui/card"

interface AuthLayoutProps {
  children: React.ReactNode
}

const LogoSection = React.memo(() => (
  <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
    <div className="text-center animate-fade-in">
      <div className="inline-block p-3 border-2 border-gray-300 bg-white rounded-2xl mb-4 shadow-lg">
        <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center">
          <img src="/maxiphy_icon.png" alt="MaxiPhy" className="w-full h-full object-cover rounded-lg" />
        </div>
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
        MaxiPhy
      </h1>
      <p className="mt-3 text-base text-gray-600 font-medium">
        Todo List
      </p>
    </div>
  </div>
))

LogoSection.displayName = 'LogoSection'

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-300/20 to-purple-300/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-300/20 to-pink-300/20 rounded-full blur-3xl" />
      </div>

      <LogoSection />

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Card className="py-8 px-4 shadow-2xl shadow-black/10 sm:rounded-xl sm:px-10 border-0 bg-white/80 backdrop-blur-sm animate-slide-up">
          {children}
        </Card>
      </div>
    </div>
  )
}