"use client"

import { useLanguage } from "@/contexts/language-context"

export function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-gray-600">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  )
} 