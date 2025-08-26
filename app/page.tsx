"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RepOrientationGuide from "@/components/rep-orientation-guide"
import MemberOrientationGuide from "@/components/member-orientation-guide"
import { Users, UserCheck } from "lucide-react"

export default function HomePage() {
  const [currentView, setCurrentView] = useState<"home" | "rep" | "member">("home")

  if (currentView === "rep") {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-4 left-4 z-50">
          <Button onClick={() => setCurrentView("home")} variant="outline" className="bg-white/90 backdrop-blur-sm">
            ← Back to Home
          </Button>
        </div>
        <RepOrientationGuide />
      </div>
    )
  }

  if (currentView === "member") {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed top-4 left-4 z-50">
          <Button onClick={() => setCurrentView("home")} variant="outline" className="bg-white/90 backdrop-blur-sm">
            ← Back to Home
          </Button>
        </div>
        <MemberOrientationGuide />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <img
            src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
            alt="DRS Logo"
            className="w-32 md:w-40 mx-auto mb-8"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DRS VIP Orientation
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to Denver Racing Social's comprehensive orientation guide system
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <Card
            className="glass-card shadow-glass hover:shadow-glass-lg transition-all duration-300 cursor-pointer group"
            onClick={() => setCurrentView("rep")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl text-foreground">Representative View</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Comprehensive guide for DRS staff and representatives with full tracking capabilities, member
                performance indicators, and detailed workflow management.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Progress tracking & checkboxes</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Member performance indicators</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Complete workflow visibility</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="glass-card shadow-glass hover:shadow-glass-lg transition-all duration-300 cursor-pointer group"
            onClick={() => setCurrentView("member")}
          >
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <UserCheck className="w-8 h-8 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl text-foreground">VIP Member View</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-6">
                Streamlined orientation guide designed specifically for VIP members, showing only customer-facing
                information and essential resources.
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Customer-facing content only</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Simplified, member-focused view</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-accent rounded-full"></div>
                  <span>Essential resources & guides</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground text-sm">
            Select your view above to access the appropriate orientation guide
          </p>
        </div>
      </div>
    </div>
  )
}
