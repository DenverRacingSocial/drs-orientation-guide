import { NextResponse } from "next/server"
import { createSign } from "crypto"

// Function to create JWT manually
async function createJWT() {
  const now = Math.floor(Date.now() / 1000)
  const header = {
    alg: "RS256",
    typ: "JWT",
  }

  const payload = {
    iss: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url")
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url")
  const signatureInput = `${encodedHeader}.${encodedPayload}`

  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  if (!privateKey) {
    throw new Error("GOOGLE_PRIVATE_KEY not found")
  }

  const sign = createSign("RSA-SHA256")
  sign.update(signatureInput)
  const signature = sign.sign(privateKey, "base64url")

  return `${signatureInput}.${signature}`
}

// Function to get access token using JWT
async function getAccessToken() {
  const jwt = await createJWT()

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.statusText}`)
  }

  const data = await response.json()
  return data.access_token
}

export async function GET() {
  try {
    const accessToken = await getAccessToken()
    const analyticsSpreadsheetId = process.env.GOOGLE_ANALYTICS_SPREADSHEET_ID || process.env.GOOGLE_SPREADSHEET_ID

    if (!analyticsSpreadsheetId) {
      throw new Error("Analytics spreadsheet ID not configured")
    }

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${analyticsSpreadsheetId}/values/A:G?majorDimension=ROWS`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      throw new Error(`Google Sheets API error: ${response.statusText}`)
    }

    const result = await response.json()
    const rows = result.values

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        bookmarks: [],
        completions: [],
        totalEvents: 0,
      })
    }

    // Parse analytics data
    const events = rows.slice(1).map((row) => ({
      timestamp: row[0],
      userType: row[1],
      action: row[2],
      phase: row[3],
      section: row[4],
      location: row[5],
      data: row[6],
    }))

    // Aggregate bookmark data
    const bookmarkEvents = events.filter((e) => e.action === "bookmark_added")
    const bookmarkCounts = bookmarkEvents.reduce((acc: any, event) => {
      const key = `${event.phase} - ${event.section}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const topBookmarks = Object.entries(bookmarkCounts)
      .map(([section, count]) => ({ section, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10)

    // Aggregate completion data
    const completionEvents = events.filter((e) => e.action === "section_completed")
    const completionCounts = completionEvents.reduce((acc: any, event) => {
      const key = `${event.phase} - ${event.section}`
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {})

    const topCompletions = Object.entries(completionCounts)
      .map(([section, count]) => ({ section, count }))
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10)

    return NextResponse.json({
      bookmarks: topBookmarks,
      completions: topCompletions,
      totalEvents: events.length,
      userTypes: {
        rep: events.filter((e) => e.userType === "rep").length,
        member: events.filter((e) => e.userType === "member").length,
      },
    })
  } catch (error) {
    console.error("Analytics dashboard error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
  }
}
