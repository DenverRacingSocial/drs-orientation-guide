"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Checkbox } from "@/components/ui/checkbox"
import { UserCircle, AlertCircle, RefreshCw, Lock, Search, Bookmark, MessageSquare, ArrowLeft } from "lucide-react"
import classNames from "classnames"

const phaseColors = [
  "bg-gradient-to-r from-black to-gray-900 text-white",
  "bg-gradient-to-r from-yellow-600 to-yellow-800 text-white",
  "bg-gradient-to-r from-gray-800 to-black text-white",
  "bg-gradient-to-r from-yellow-500 to-yellow-700 text-black",
  "bg-gradient-to-r from-gray-900 to-gray-800 text-white",
  "bg-gradient-to-r from-yellow-700 to-yellow-900 text-white",
]

export default function RepOrientationGuide() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const [query, setQuery] = useState("")
  const [orientationData, setOrientationData] = useState<any[]>([])
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({})
  const [openItems, setOpenItems] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [flaggedItems, setFlaggedItems] = useState<{ [key: number]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showQuestionForm, setShowQuestionForm] = useState(false)
  const [questionText, setQuestionText] = useState("")
  const phaseRefs = useRef<{ [phase: string]: HTMLDivElement | null }>({})

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordInput === "DenRace7542B-01") {
      setIsAuthenticated(true)
      setPasswordError("")
    } else {
      setPasswordError("Incorrect password. Please try again.")
      setPasswordInput("")
    }
  }

  useEffect(() => {
    const savedAuth = localStorage.getItem("drs-rep-auth")
    if (savedAuth === "authenticated") {
      setIsAuthenticated(true)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem("drs-rep-auth", "authenticated")
    }
  }, [isAuthenticated])

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sheets/orientation-data")

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (!data.data || data.data.length === 0) {
        throw new Error("No valid data found in the spreadsheet")
      }

      setOrientationData(data.data)
      setOpenItems(data.data.map((_: any, index: number) => index.toString()))
      setIsLoading(false)
    } catch (err) {
      console.error("Error loading orientation data:", err)
      setError(err instanceof Error ? err.message : "Failed to load orientation data")
      loadSampleData()
    }
  }

  const trackAnalytics = async (action: string, data: any) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          data,
          timestamp: new Date().toISOString(),
          userType: "rep",
        }),
      })
    } catch (err) {
      console.error("Analytics tracking failed:", err)
    }
  }

  const loadSampleData = () => {
    const sampleData = [
      {
        phase: "Phase 1: Welcome & Setup",
        section: "Greet New VIP Member",
        customerFacing: true,
        memberPerform: false,
        notes:
          "Welcome the new VIP member warmly and introduce yourself. Explain the orientation process and what they can expect.",
        photos: [],
        video: "",
        resources: [],
        tags: ["welcome", "greeting"],
        location: "centennial",
      },
      {
        phase: "Phase 1: Welcome & Setup",
        section: "Collect Member Information",
        customerFacing: true,
        memberPerform: true,
        notes:
          "Have the member fill out their profile information and preferences. Ensure all contact details are accurate.",
        photos: [],
        video: "",
        resources: [],
        tags: ["information", "profile"],
        location: "centennial",
      },
      {
        phase: "Phase 2: Facility Tour",
        section: "Show Main Areas",
        customerFacing: true,
        memberPerform: false,
        notes:
          "Give a comprehensive tour of the facility including VIP areas, amenities, and key locations they'll need to know.",
        photos: [],
        video: "",
        resources: [],
        tags: ["tour", "facility"],
        location: "lafayette",
      },
    ]

    setOrientationData(sampleData)
    setOpenItems(sampleData.map((_, index) => index.toString()))
    setIsLoading(false)
  }

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  const submitQuestion = async () => {
    if (!questionText.trim()) return

    try {
      await trackAnalytics("question_submitted", {
        question: questionText,
        timestamp: new Date().toISOString(),
      })
      setQuestionText("")
      setShowQuestionForm(false)
      // Show success feedback
    } catch (err) {
      console.error("Failed to submit question:", err)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card shadow-glass">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Lock className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h1 className="text-2xl font-bold mb-2 text-foreground">Rep Access Required</h1>
              <p className="text-muted-foreground">
                Enter the password to access the representative orientation guide.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full glass-input"
                  autoFocus
                />
                {passwordError && <p className="text-destructive text-sm mt-2">{passwordError}</p>}
              </div>

              <button
                type="submit"
                className="w-full glass-button font-semibold py-3 px-4 rounded-lg transition-all duration-200"
              >
                Access Rep Guide
              </button>
            </form>

            <div className="mt-6 text-center">
              <a
                href="/"
                className="text-primary hover:text-primary/80 text-sm underline transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Main Menu
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredItems = orientationData.filter((item) => {
    const searchText = `${item.phase} ${item.section} ${item.notes}`.toLowerCase()
    const tagMatch = item.tags?.some((tag: string) => tag.includes(query.toLowerCase()))
    const locationMatch = selectedLocation === "all" || !item.location || item.location === selectedLocation
    return (searchText.includes(query.toLowerCase()) || tagMatch) && locationMatch
  })

  const uniquePhases = Array.from(new Set(filteredItems.map((item) => item.phase)))

  const scrollToPhase = (phase: string) => {
    const element = phaseRefs.current[phase]
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const toggleChecked = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }))
    setOpenItems((prev) => prev.filter((val) => val !== index.toString()))
  }

  const toggleFlag = (index: number) => {
    const newFlagState = !flaggedItems[index]
    setFlaggedItems((prev) => ({ ...prev, [index]: newFlagState }))

    if (newFlagState) {
      const item = orientationData[index]
      trackAnalytics("bookmark_added", {
        phase: item.phase,
        section: item.section,
        location: item.location,
      })
    }
  }

  const handleToggle = (val: string) => {
    const index = Number.parseInt(val)
    setOpenItems((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]))
    if (!checkedItems[index]) {
      setCheckedItems((prev) => ({ ...prev, [index]: true }))

      const item = orientationData[index]
      trackAnalytics("section_completed", {
        phase: item.phase,
        section: item.section,
        location: item.location,
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 glass-nav py-4">
          <div className="flex justify-center">
            <a href="/">
              <img
                src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
                alt="DRS Logo"
                className="w-20 md:w-24 cursor-pointer"
              />
            </a>
          </div>
        </div>
        <div className="text-center py-20">
          <RefreshCw className="animate-spin mx-auto mb-4 h-8 w-8 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Loading orientation data...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="sticky top-0 z-50 glass-nav py-4">
          <div className="flex justify-center">
            <a href="/">
              <img
                src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
                alt="DRS Logo"
                className="w-20 md:w-24 cursor-pointer"
              />
            </a>
          </div>
        </div>
        <div className="text-center py-10 max-w-2xl mx-auto px-4">
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
          <h2 className="text-xl font-semibold mb-4 text-foreground">Google Sheets Connection Issue</h2>
          <Card className="glass-card shadow-glass mb-6">
            <CardContent className="p-6 text-left">
              <p className="text-muted-foreground mb-4">{error}</p>
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold mb-2">To fix this issue:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Open your Google Sheet</li>
                  <li>Go to File → Share → Publish to web</li>
                  <li>Select "Entire Document" and "Comma-separated values (.csv)"</li>
                  <li>Click "Publish" and copy the new URL</li>
                  <li>Update the URL in your code</li>
                </ol>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-accent shadow-glass mb-6">
            <CardContent className="p-4">
              <p className="text-primary">Currently showing sample data for demonstration purposes.</p>
            </CardContent>
          </Card>
          <button
            onClick={loadData}
            className="px-6 py-3 glass-button rounded-lg font-semibold transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 glass-nav py-4">
        <div className="flex justify-center">
          <a href="/">
            <img
              src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
              alt="DRS Logo"
              className="w-20 md:w-24 cursor-pointer"
            />
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-10 pt-6">
        <div className="text-center py-4 md:py-6">
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">{"VIP Clubhouse Guide\n"}</h1>
          <p className="text-lg text-muted-foreground">Representative View</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-10">
          <div className="w-full lg:w-1/3 space-y-6">
            <Card className="glass-card shadow-glass">
              <CardContent className="p-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search notes or content..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 glass-input text-lg py-3"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {["all", "centennial", "lafayette"].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setSelectedLocation(loc)}
                      className={classNames(
                        "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                        selectedLocation === loc ? "glass-button shadow-glass" : "glass hover:glass-accent",
                      )}
                    >
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-glass">
              <CardContent className="p-6">
                <h2 className="font-bold mb-4 text-foreground flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Quick Navigation
                </h2>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {uniquePhases.map((phase, i) => (
                    <button
                      key={i}
                      onClick={() => scrollToPhase(phase)}
                      className="text-primary hover:text-primary/80 w-full text-left p-2 rounded-lg hover:glass-accent transition-all duration-200 text-sm"
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card shadow-glass">
              <CardContent className="p-6">
                <h2 className="font-bold mb-4 text-foreground">Legend</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCircle className="text-primary h-4 w-4" />
                  <span>Member Performs</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full lg:w-2/3">
            {uniquePhases.map((phaseName) => {
              const itemsInPhase = filteredItems.filter((item) => item.phase === phaseName)
              const phaseColor = phaseColors[uniquePhases.indexOf(phaseName) % phaseColors.length]
              return (
                <div
                  key={phaseName}
                  ref={(el) => {
                    phaseRefs.current[phaseName] = el
                  }}
                  className="mb-8"
                >
                  <div
                    className={classNames(
                      "sticky z-40 top-24 md:top-28 px-6 py-4 rounded-xl font-bold text-lg text-primary-foreground shadow-glass mb-6",
                      phaseColor,
                    )}
                  >
                    {phaseName}
                  </div>
                  <Accordion type="multiple" className="space-y-4" value={openItems}>
                    {itemsInPhase.map((item, index) => {
                      const itemIndex = orientationData.indexOf(item)
                      return (
                        <AccordionItem
                          key={index}
                          value={itemIndex.toString()}
                          className="glass-card shadow-glass rounded-xl overflow-hidden"
                        >
                          <AccordionTrigger
                            className="px-6 py-5 text-base font-semibold hover:glass-accent transition-all duration-200"
                            onClick={() => handleToggle(itemIndex.toString())}
                          >
                            <div className="flex items-center gap-4 w-full">
                              {item.memberPerform && (
                                <span title="Member Performs">
                                  <UserCircle className="text-primary h-5 w-5" />
                                </span>
                              )}
                              <Checkbox
                                checked={checkedItems[itemIndex] || false}
                                onCheckedChange={() => toggleChecked(itemIndex)}
                                className="scale-110"
                              />
                              <div className="text-left text-base font-bold text-foreground flex-1">{item.section}</div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleFlag(itemIndex)
                                }}
                                className={classNames(
                                  "text-sm transition-all duration-200 px-3 py-1 rounded-full",
                                  flaggedItems[itemIndex]
                                    ? "text-primary bg-primary/20 border border-primary/30"
                                    : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                                )}
                              >
                                <Bookmark className="h-4 w-4" />
                              </button>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-6 py-6 border-t border-border">
                            <div className="space-y-4 text-foreground">
                              <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground leading-relaxed">{item.notes}</p>
                              </div>

                              {item.photos.length > 0 && (
                                <div>
                                  <strong className="text-foreground">Photos:</strong>
                                  <div className="mt-2 overflow-x-auto whitespace-nowrap space-x-4 pb-2">
                                    {item.photos.map((photo: string, i: number) => (
                                      <img
                                        key={i}
                                        src={photo || "/placeholder.svg"}
                                        alt={`Step Visual ${i + 1}`}
                                        onClick={() => setFullscreenImage(photo)}
                                        className="inline-block h-auto max-h-60 rounded-lg border border-border shadow-2xl cursor-pointer hover:scale-105 transition-transform backdrop-blur-sm"
                                        style={{ maxWidth: "85%" }}
                                      />
                                    ))}
                                  </div>
                                </div>
                              )}
                              {item.video && (
                                <p>
                                  <a
                                    href={item.video}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline hover:text-primary/80"
                                  >
                                    🎥 Watch Video
                                  </a>
                                </p>
                              )}
                              {item.resources.length > 0 && (
                                <div>
                                  <strong className="text-foreground">Resources:</strong>
                                  <ul className="list-disc list-inside space-y-1 mt-1">
                                    {item.resources.map((res: string, i: number) => (
                                      <li key={i}>
                                        <a
                                          href={res}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary underline hover:text-primary/80"
                                        >
                                          🔗 {res}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {item.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-4">
                                  {item.tags.map((tag: string, i: number) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1 glass text-muted-foreground text-xs rounded-full border border-border"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    })}
                  </Accordion>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowQuestionForm(true)}
        className="fixed bottom-6 right-6 glass-button p-4 rounded-full shadow-glass hover:shadow-glass-lg transition-all duration-300 z-40"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {showQuestionForm && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md glass-card shadow-glass">
            <CardContent className="p-6">
              <h3 className="text-lg font-bold mb-4 text-foreground">Submit a Question</h3>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="What would you like to know?"
                className="w-full h-32 p-3 glass-input rounded-lg resize-none"
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={submitQuestion}
                  className="flex-1 glass-button py-2 px-4 rounded-lg font-semibold transition-all duration-200"
                >
                  Submit
                </button>
                <button
                  onClick={() => setShowQuestionForm(false)}
                  className="flex-1 glass py-2 px-4 rounded-lg font-semibold hover:glass-accent transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage || "/placeholder.svg"}
            alt="Full Screen"
            className="max-h-full max-w-full rounded shadow-glass"
          />
        </div>
      )}
    </div>
  )
}
