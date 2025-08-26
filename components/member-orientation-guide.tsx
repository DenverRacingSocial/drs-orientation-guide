"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { AlertCircle, RefreshCw } from "lucide-react"
import classNames from "classnames"

const phaseColors = [
  "bg-gradient-to-r from-black to-gray-900",
  "bg-gradient-to-r from-yellow-600 to-yellow-800",
  "bg-gradient-to-r from-gray-800 to-black",
  "bg-gradient-to-r from-yellow-500 to-yellow-700",
  "bg-gradient-to-r from-gray-900 to-gray-800",
  "bg-gradient-to-r from-yellow-700 to-yellow-900",
]

export default function MemberOrientationGuide() {
  const [query, setQuery] = useState("")
  const [orientationData, setOrientationData] = useState<any[]>([])
  const [openItems, setOpenItems] = useState<string[]>([])
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null)
  const [flaggedItems, setFlaggedItems] = useState<{ [key: number]: boolean }>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const phaseRefs = useRef<{ [phase: string]: HTMLDivElement | null }>({})

  const loadData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/sheets/orientation-data")

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      if (!result.data || result.data.length === 0) {
        throw new Error("No valid data found in the spreadsheet")
      }

      const customerFacingData = result.data.filter((item: any) => item.customerFacing === true)

      if (customerFacingData.length === 0) {
        throw new Error("No valid customer-facing data found in the spreadsheet")
      }

      setOrientationData(customerFacingData)
      setOpenItems(customerFacingData.map((_: any, index: number) => index.toString()))
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
          userType: "member",
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
        section: "Welcome to DRS VIP",
        notes:
          "Welcome to the Denver Racing Social VIP experience! You'll receive exclusive access to premium events, priority booking, and special member benefits.",
        photos: [],
        video: "",
        resources: [],
        tags: ["welcome", "vip"],
        location: "centennial",
      },
      {
        phase: "Phase 1: Welcome & Setup",
        section: "Complete Your Profile",
        notes:
          "Please take a moment to complete your VIP member profile. This helps us personalize your racing experience and send you relevant event notifications.",
        photos: [],
        video: "",
        resources: [],
        tags: ["profile", "setup"],
        location: "centennial",
      },
      {
        phase: "Phase 2: VIP Benefits",
        section: "Explore VIP Amenities",
        notes:
          "As a VIP member, you have access to exclusive lounges, priority parking, premium viewing areas, and complimentary refreshments at select events.",
        photos: [],
        video: "",
        resources: [],
        tags: ["benefits", "amenities"],
        location: "lafayette",
      },
    ]

    setOrientationData(sampleData)
    setOpenItems(sampleData.map((_, index) => index.toString()))
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

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

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pb-10 pt-2 transition-all duration-300 min-h-screen">
        <div className="sticky top-0 z-50 glass-nav py-2 flex justify-center">
          <a href="#">
            <img
              src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
              alt="DRS Logo"
              className="w-20 md:w-24 cursor-pointer"
            />
          </a>
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
      <div className="max-w-7xl mx-auto px-4 pb-10 pt-2 transition-all duration-300 min-h-screen bg-background">
        <div className="sticky top-0 z-50 glass-nav py-2 flex justify-center">
          <a href="#">
            <img
              src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
              alt="DRS Logo"
              className="w-20 md:w-24 cursor-pointer"
            />
          </a>
        </div>
        <div className="text-center py-10 max-w-2xl mx-auto">
          <AlertCircle className="mx-auto mb-4 h-8 w-8 text-destructive" />
          <h2 className="text-xl font-semibold mb-4 text-foreground">Google Sheets Connection Issue</h2>
          <div className="text-left glass-card p-6 rounded-lg mb-6">
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
          </div>
          <div className="glass-accent p-4 rounded-lg mb-6">
            <p className="text-primary">Currently showing sample data for demonstration purposes.</p>
          </div>
          <button onClick={loadData} className="px-6 py-3 glass-button rounded-lg font-semibold transition-colors">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10 pt-2 transition-all duration-300 min-h-screen">
      <div className="sticky top-0 z-50 glass-nav py-2 flex justify-center">
        <a href="#">
          <img
            src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
            alt="DRS Logo"
            className="w-20 md:w-24 cursor-pointer"
          />
        </a>
      </div>

      <div className="text-center py-2 md:py-4">
        <h1 className="text-md md:text-3xl font-extrabold text-foreground">VIP Clubhouse Guide
</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10 sticky top-20 md:top-24 z-30 glass-nav py-4">
        <div className="w-full md:w-1/3 space-y-4">
          <Input
            type="text"
            placeholder="🔍 Search notes or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border px-5 py-4 shadow-md text-lg glass-input"
          />

          <div className="flex gap-2 mt-2">
            {["all", "centennial", "lafayette"].map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={classNames(
                  "px-4 py-2 rounded-lg text-sm font-semibold border",
                  selectedLocation === loc ? "glass-button shadow-glass" : "glass hover:glass-accent",
                )}
              >
                {loc.charAt(0).toUpperCase() + loc.slice(1)}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-80 border rounded-md p-3 text-sm glass-card mt-4">
            <h2 className="font-bold mb-2 text-foreground">📌 Phases</h2>
            <ul className="space-y-1">
              {uniquePhases.map((phase, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollToPhase(phase)}
                    className="hover:underline w-full text-left"
                  >
                    {phase}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          {uniquePhases.map((phaseName) => {
            const itemsInPhase = filteredItems.filter((item) => item.phase === phaseName)
            const phaseColor = phaseColors[uniquePhases.indexOf(phaseName) % phaseColors.length]
            return (
              <div
                key={phaseName}
                ref={(el) => {
                  phaseRefs.current[phaseName] = el
                }}
              >
                <div
                  className={classNames(
                    "sticky z-30 top-24 md:top-28 px-4 py-2 rounded font-semibold border mb-4 text-lg text-primary-foreground",
                    phaseColor,
                  )}
                >
                  {phaseName}
                </div>
                <Accordion type="multiple" className="space-y-6" value={openItems}>
                  {itemsInPhase.map((item, index) => {
                    const itemIndex = orientationData.indexOf(item)
                    return (
                      <AccordionItem
                        key={index}
                        value={itemIndex.toString()}
                        className="border-l-4 border-primary rounded-xl glass-card shadow-glass hover:shadow-glass-lg transition-shadow duration-300"
                      >
                        <AccordionTrigger className="px-6 py-5 text-base font-semibold hover:glass-accent">
                          <div className="flex justify-between w-full items-center">
                            <span className="text-left text-base font-bold text-foreground">{item.section}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFlag(itemIndex)
                              }}
                              className="text-sm text-primary hover:text-primary/80"
                            >
                              {flaggedItems[itemIndex] ? "🔖 Bookmarked" : "🔖 Bookmark"}
                            </button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="glass-content px-8 py-6">
                          <Card className="glass border-none shadow-none">
                            <CardContent className="space-y-3 text-foreground">
                              <p>
                                <strong>Notes:</strong>
                                <br /> {item.notes}
                              </p>
                              {item.photos.length > 0 && (
                                <div>
                                  <strong>Photos:</strong>
                                  <div className="mt-2 overflow-x-auto whitespace-nowrap space-x-4 pb-2">
                                    {item.photos.map((photo: string, i: number) => (
                                      <img
                                        key={i}
                                        src={photo || "/placeholder.svg"}
                                        alt={`Step Visual ${i + 1}`}
                                        onClick={() => setFullscreenImage(photo)}
                                        className="inline-block h-auto max-h-60 rounded-lg border shadow-md cursor-pointer hover:scale-105 transition-transform"
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
                                    className="text-blue-400 underline"
                                  >
                                    🎥 Watch Video
                                  </a>
                                </p>
                              )}
                              {item.resources.length > 0 && (
                                <div>
                                  <strong>Resources:</strong>
                                  <ul className="list-disc list-inside space-y-1 mt-1">
                                    {item.resources.map((res: string, i: number) => (
                                      <li key={i}>
                                        <a
                                          href={res}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-400 underline"
                                        >
                                          🔗 {res}
                                        </a>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {item.tags.length > 0 && (
                                <p className="text-sm text-muted-foreground pt-2">
                                  <strong>Tags:</strong> {item.tags.join(", ")}
                                </p>
                              )}
                            </CardContent>
                          </Card>
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
