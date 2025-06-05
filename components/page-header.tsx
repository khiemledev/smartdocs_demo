"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Home, Zap } from "lucide-react"
import Link from "next/link"
import { LanguageSwitcher } from "./language-switcher"
import { useLanguage } from "@/contexts/language-context"

interface PageHeaderProps {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  const { t } = useLanguage();
  
  return (
    <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-colors">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Icon className="w-6 h-6 text-gray-700" />
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              </div>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('common.backToHome')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
} 