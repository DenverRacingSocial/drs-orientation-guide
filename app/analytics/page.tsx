"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, TrendingUp, Users, Bookmark, CheckCircle, MessageSquare, ArrowLeft } from "lucide-react"

interface AnalyticsData {
  bookmarks: Array<{ section: string; count: number }>
  completions: Array<{ section: string; count: number }>
  questions: Array<{ question: string; timestamp: string; userType: string }>
  totalEvents: number
  userTypes: { rep: number; member: number }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAnalytics = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/analytics/dashboard")

      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      setData(result)
    } catch (err) {
      console.error("Analytics error:", err)
      setError(err instanceof Error ? err.message : "Failed to load analytics")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAnalytics()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 glass-nav py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Main
            </a>
            <div className="flex-1 text-center">
              <img
                src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
                alt="DRS Logo"
                className="w-16 md:w-20 mx-auto mb-2"
              />
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1">DRS Analytics Dashboard</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Track user engagement and popular content sections
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <RefreshCw className="animate-spin mx-auto mb-4 h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Loading analytics...</h2>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 glass-nav py-4">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
            <a
              href="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Back to Main
            </a>
            <div className="flex-1 text-center">
              <img
                src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
                alt="DRS Logo"
                className="w-16 md:w-20 mx-auto mb-2"
              />
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1">DRS Analytics Dashboard</h1>
              <p className="text-muted-foreground text-sm md:text-base">
                Track user engagement and popular content sections
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h2 className="text-xl font-semibold mb-4 text-foreground">Analytics Error</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={loadAnalytics}
              className="px-6 py-3 glass-button rounded-lg font-semibold transition-all duration-300"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 glass-nav py-4">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to Main
          </a>
          <div className="flex-1 text-center">
            <img
              src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
              alt="DRS Logo"
              className="w-16 md:w-20 mx-auto mb-2"
            />
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-1">DRS Analytics Dashboard</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Track user engagement and popular content sections
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card shadow-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{data?.totalEvents || 0}</div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rep Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{data?.userTypes.rep || 0}</div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Member Users</CardTitle>
              <Users className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{data?.userTypes.member || 0}</div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Bookmarks</CardTitle>
              <Bookmark className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {data?.bookmarks.reduce((sum, item) => sum + item.count, 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="glass-card shadow-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-primary" />
                Most Bookmarked Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {data?.bookmarks.length === 0 ? (
                  <p className="text-muted-foreground">No bookmark data available yet</p>
                ) : (
                  data?.bookmarks.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg glass-muted">
                      <span className="text-foreground text-sm">{item.section}</span>
                      <span className="text-primary font-semibold">{item.count}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Most Completed Sections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {data?.completions.length === 0 ? (
                  <p className="text-muted-foreground">No completion data available yet</p>
                ) : (
                  data?.completions.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded-lg glass-muted">
                      <span className="text-foreground text-sm">{item.section}</span>
                      <span className="text-primary font-semibold">{item.count}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card shadow-glass">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-accent" />
                User Questions & Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {!data?.questions || data.questions.length === 0 ? (
                  <p className="text-muted-foreground">No questions submitted yet</p>
                ) : (
                  data.questions.map((item, index) => (
                    <div key={index} className="p-3 rounded-lg glass-muted border-l-2 border-primary">
                      <p className="text-foreground text-sm mb-2">{item.question}</p>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground">{new Date(item.timestamp).toLocaleDateString()}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            item.userType === "rep" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
                          }`}
                        >
                          {item.userType}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
