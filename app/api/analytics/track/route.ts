import { NextResponse } from "next/server"
import { createSign } from "crypto"

function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

async function createJWT() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKeyId = process.env.GOOGLE_PRIVATE_KEY_ID

  if (
    !serviceAccountEmail ||
    !serviceAccountEmail.includes("@") ||
    !serviceAccountEmail.includes(".iam.gserviceaccount.com")
  ) {
    throw new Error(
      `GOOGLE_SERVICE_ACCOUNT_EMAIL appears to be invalid. Expected format: your-service@project.iam.gserviceaccount.com, got: ${serviceAccountEmail}`,
    )
  }

  const now = Math.floor(Date.now() / 1000)
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: privateKeyId,
  }

  const payload = {
    iss: serviceAccountEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = base64ToBase64Url(Buffer.from(JSON.stringify(header)).toString("base64"))
  const encodedPayload = base64ToBase64Url(Buffer.from(JSON.stringify(payload)).toString("base64"))
  const signatureInput = `${encodedHeader}.${encodedPayload}`

  let privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  if (!privateKey) {
    throw new Error("GOOGLE_PRIVATE_KEY not found")
  }

  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`
  }

  const sign = createSign("RSA-SHA256")
  sign.update(signatureInput)
  const signature = base64ToBase64Url(sign.sign(privateKey, "base64"))

  return `${signatureInput}.${signature}`
}

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

export async function POST(request: Request) {
  try {
    const { action, data, timestamp, userType } = await request.json()

    const accessToken = await getAccessToken()
    const analyticsSpreadsheetId = "12xkkAlIJXPm-ykuplD11xukE5PyGSWc66327QVzDrq4"

    if (!analyticsSpreadsheetId) {
      throw new Error("Analytics spreadsheet ID not configured")
    }

    const values = [
      [timestamp, userType, action, data.phase || "", data.section || "", data.location || "", JSON.stringify(data)],
    ]

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${analyticsSpreadsheetId}/values/Analytics!A:G:append?valueInputOption=RAW`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to append data: ${response.statusText}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Analytics tracking error:", error)
    return NextResponse.json({ error: "Failed to track analytics" }, { status: 500 })
  }
}
