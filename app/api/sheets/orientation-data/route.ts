import { NextResponse } from "next/server"
import { createSign } from "crypto"

function base64ToBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

// Function to create JWT manually
async function createJWT() {
  try {
    console.log("[v0] Creating JWT token...")

    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
    const privateKeyId = process.env.GOOGLE_PRIVATE_KEY_ID

    console.log("[v0] Environment variables check:", {
      hasServiceAccountEmail: !!serviceAccountEmail,
      serviceAccountEmailLength: serviceAccountEmail?.length || 0,
      hasPrivateKey: !!privateKey,
      privateKeyLength: privateKey?.length || 0,
      privateKeyStartsWith: privateKey?.substring(0, 30) || "N/A",
      hasPrivateKeyId: !!privateKeyId,
    })

    if (!serviceAccountEmail) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL environment variable is not set")
    }

    if (serviceAccountEmail.startsWith("AIza") || !serviceAccountEmail.includes("@")) {
      throw new Error(
        `GOOGLE_SERVICE_ACCOUNT_EMAIL appears to be an API key instead of a service account email. Expected format: your-service@project.iam.gserviceaccount.com, got: ${serviceAccountEmail}`,
      )
    }

    if (!privateKey) {
      throw new Error("GOOGLE_PRIVATE_KEY environment variable is not set")
    }

    if (!privateKeyId) {
      throw new Error("GOOGLE_PRIVATE_KEY_ID environment variable is not set")
    }

    const now = Math.floor(Date.now() / 1000)
    const header = {
      alg: "RS256",
      typ: "JWT",
      kid: privateKeyId,
    }

    const payload = {
      iss: serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }

    console.log("[v0] JWT payload:", JSON.stringify(payload, null, 2))

    const encodedHeader = base64ToBase64Url(Buffer.from(JSON.stringify(header)).toString("base64"))
    const encodedPayload = base64ToBase64Url(Buffer.from(JSON.stringify(payload)).toString("base64"))
    const signatureInput = `${encodedHeader}.${encodedPayload}`

    console.log("[v0] JWT signature input length:", signatureInput.length)

    let formattedPrivateKey = privateKey.replace(/\\n/g, "\n")

    // Add BEGIN/END markers if they're missing
    if (!formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----")) {
      formattedPrivateKey = `-----BEGIN PRIVATE KEY-----\n${formattedPrivateKey}\n-----END PRIVATE KEY-----`
    }

    console.log("[v0] Private key formatting check:", {
      originalLength: privateKey.length,
      formattedLength: formattedPrivateKey.length,
      hasBeginMarker: formattedPrivateKey.includes("-----BEGIN PRIVATE KEY-----"),
      hasEndMarker: formattedPrivateKey.includes("-----END PRIVATE KEY-----"),
    })

    const sign = createSign("RSA-SHA256")
    sign.update(signatureInput)
    const signature = base64ToBase64Url(sign.sign(formattedPrivateKey, "base64"))

    console.log("[v0] JWT signature created successfully, length:", signature.length)

    const jwt = `${signatureInput}.${signature}`
    console.log("[v0] JWT token created successfully, total length:", jwt.length)

    return jwt
  } catch (error) {
    console.error("[v0] JWT creation error:", error)
    throw error
  }
}

// Function to get access token using JWT
async function getAccessToken() {
  try {
    console.log("[v0] Getting access token...")
    const jwt = await createJWT()
    console.log("[v0] JWT created, making token request...")

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

    console.log("[v0] Token response status:", response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Token request failed:", errorText)
      throw new Error(`Failed to get access token: ${response.statusText} - ${errorText}`)
    }

    const data = await response.json()
    console.log("[v0] Access token received:", {
      hasAccessToken: !!data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in,
    })

    return data.access_token
  } catch (error) {
    console.error("[v0] Access token error:", error)
    throw error
  }
}

export async function GET() {
  try {
    console.log("[v0] Starting Google Sheets API call...")

    const accessToken = await getAccessToken()
    console.log("[v0] Access token obtained successfully")

    const spreadsheetId = "12xkkAlIJXPm-ykuplD11xukE5PyGSWc66327QVzDrq4"

    if (!spreadsheetId) {
      throw new Error("GOOGLE_SPREADSHEET_ID environment variable is not set")
    }

    console.log("[v0] Fetching spreadsheet metadata...")
    const metadataResponse = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    if (!metadataResponse.ok) {
      console.log("[v0] Metadata fetch failed:", metadataResponse.statusText)
      throw new Error(`Failed to fetch spreadsheet metadata: ${metadataResponse.statusText}`)
    }

    const metadata = await metadataResponse.json()
    console.log(
      "[v0] Spreadsheet metadata:",
      JSON.stringify(
        metadata.sheets?.map((s: any) => ({ title: s.properties.title, sheetId: s.properties.sheetId })),
        null,
        2,
      ),
    )

    const targetSheet = metadata.sheets?.find((sheet: any) => sheet.properties.sheetId === 2091426754)
    const sheetName = targetSheet ? targetSheet.properties.title : "Orientation Process"

    console.log("[v0] Using sheet name:", sheetName)

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A:M?majorDimension=ROWS`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    )

    if (!response.ok) {
      console.log("[v0] Data fetch failed:", response.statusText)
      throw new Error(`Google Sheets API error: ${response.statusText}`)
    }

    const result = await response.json()
    console.log("[v0] API response structure:", {
      hasValues: !!result.values,
      valuesLength: result.values?.length || 0,
      firstRowLength: result.values?.[0]?.length || 0,
    })

    const rows = result.values

    if (!rows || rows.length === 0) {
      console.log("[v0] No data found in spreadsheet")
      return NextResponse.json({ error: "No data found in spreadsheet" }, { status: 404 })
    }

    if (!Array.isArray(rows) || rows.length < 2) {
      console.log("[v0] Invalid data structure - need at least header row and one data row")
      return NextResponse.json({ error: "Invalid data structure in spreadsheet" }, { status: 400 })
    }

    const headers = rows[0]
    console.log("[v0] Headers found:", headers)
    console.log("[v0] Headers type:", typeof headers, "isArray:", Array.isArray(headers))

    if (!headers || !Array.isArray(headers)) {
      console.log("[v0] Invalid headers structure")
      return NextResponse.json({ error: "Invalid headers in spreadsheet" }, { status: 400 })
    }

    console.log("[v0] Processing", rows.length - 1, "data rows...")

    const data = []
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i]
      console.log(`[v0] Processing row ${i}:`, {
        rowType: typeof row,
        isArray: Array.isArray(row),
        length: row?.length || 0,
        hasContent: row && row.length > 0 && row.some((cell: any) => cell && cell.toString().trim()),
      })

      // Skip completely empty rows
      if (!row || !Array.isArray(row) || row.length === 0 || !row.some((cell: any) => cell && cell.toString().trim())) {
        console.log(`[v0] Skipping empty row ${i}`)
        continue
      }

      try {
        const item: any = {}
        headers.forEach((header, index) => {
          if (typeof header !== "string") {
            console.log(`[v0] Warning: Header at index ${index} is not a string:`, typeof header, header)
            return
          }

          const cellValue = row && row.length > index ? row[index] : ""
          item[header] = cellValue !== null && cellValue !== undefined ? cellValue.toString() : ""
        })

        // Only include rows that have Phase and Section/Step
        if (item["Phase"] && item["Section/Step"]) {
          const processedRow = {
            phase: item["Phase"] || "",
            section: item["Section/Step"] || "",
            customerFacing: item["Customer-Facing?"]?.toLowerCase() === "yes",
            memberPerform: item["Member Perform"]?.toLowerCase() === "yes",
            notes: item["Detailed Steps/Notes"] || "",
            photos:
              item["Photo"]
                ?.split(",")
                .map((p: string) => p.trim())
                .filter(Boolean) || [],
            video: item["Video"] || "",
            resources: [
              item["Additional Resource 1"],
              item["Additional Resource 2"],
              item["Additional Resource 3"],
            ].filter(Boolean),
            tags:
              item["Tags"]
                ?.toLowerCase()
                .split(",")
                .map((t: string) => t.trim())
                .filter(Boolean) || [],
            location: item["Location"]?.toLowerCase().trim() || "",
          }

          data.push(processedRow)
          console.log(`[v0] Added row ${i} to data:`, processedRow.phase, "-", processedRow.section)
        } else {
          console.log(`[v0] Skipping row ${i} - missing Phase or Section/Step`)
        }
      } catch (rowError) {
        console.error(`[v0] Error processing row ${i}:`, rowError)
        // Continue processing other rows
      }
    }

    console.log("[v0] Final processed data count:", data.length)
    return NextResponse.json({ data })
  } catch (error) {
    console.error("[v0] Google Sheets API error:", error)
    return NextResponse.json({ error: "Failed to fetch data from Google Sheets" }, { status: 500 })
  }
}
