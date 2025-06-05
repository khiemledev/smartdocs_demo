"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, FileOutput, Layers, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function HomePage() {
  const { t } = useLanguage();
  
  const features = [
    {
      id: "extraction",
      title: t("features.extraction.title"),
      description: t("features.extraction.description"),
      icon: Database,
      href: "/extraction",
      color: "from-blue-500 to-blue-600",
    },
    {
      id: "conversion",
      title: t("features.conversion.title"),
      description: t("features.conversion.description"),
      icon: FileOutput,
      href: "/conversion",
      color: "from-green-500 to-green-600",
    },
    {
      id: "textlayer",
      title: t("features.textlayer.title"),
      description: t("features.textlayer.description"),
      icon: Layers,
      href: "/textlayer",
      color: "from-purple-500 to-purple-600",
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{t("header.title")}</h1>
                <p className="text-sm text-gray-600">{t("header.subtitle")}</p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t("homepage.heroTitle")}
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t("homepage.heroSubtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.id} className="border-gray-200 hover:shadow-lg transition-shadow flex flex-col justify-between">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-gray-900">{feature.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={feature.href}>
                    <Button className="w-full bg-black hover:bg-gray-800 text-white group">
                      {t("homepage.tryNow")}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>


      </section>

      <Footer />
    </div>
  )
}
