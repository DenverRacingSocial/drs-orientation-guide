"use client";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

export default function OrientationGuide() {
  const [query, setQuery] = useState("");
  const [orientationData, setOrientationData] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    fetch(
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ6IYCW2Zg7D5MHt5KF6oh2DQJtzXwnhzgJsbBLjNzS_33aQkqpxvtmGSYYtdL5yBt9nsyftwa1NpMN/pub?output=csv"
    )
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const cleaned = results.data.map((row: any) => ({
              phase: row["Phase"] ?? "",
              section: row["Section/Step"] ?? "",
              customerFacing: row["Customer-Facing?"]?.toLowerCase() === "yes",
              memberPerform: row["Member Perform"]?.toLowerCase() === "yes",
              notes: row["Detailed Steps/Notes"] ?? "",
              photo: row["Photo"] ?? "",
              video: row["Video"] ?? "",
              resource1: row["Additional Resource 1"] ?? "",
              resource2: row["Additional Resource 2"] ?? "",
              resource3: row["Additional Resource 3"] ?? "",
            }));
            setOrientationData(cleaned);
          },
          error: (err) => {
            console.error("CSV parse error:", err);
          },
        });
      })
      .catch((err) => {
        console.error("Error loading orientation CSV:", err);
      });
  }, []);

  const filteredItems = orientationData.filter((item) => {
    const content = `${item.phase} ${item.section} ${item.notes}`.toLowerCase();
    return content.includes(query.toLowerCase());
  });

  const toggleChecked = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-3xl font-semibold mb-6 sticky top-0 bg-white z-20 py-4 shadow-md border-b">
        🏁 VIP Orientation Guide (Rep View)
      </h1>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="🔍 Search phases, steps, or notes..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border px-4 py-3 shadow-sm"
        />
      </div>

      <Accordion type="multiple" className="space-y-3">
        {filteredItems.map((item, index) => (
          <AccordionItem
            value={index.toString()}
            key={index}
            className="border rounded-lg shadow-sm bg-white">
            <AccordionTrigger className="p-4 text-left text-lg font-medium flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={checkedItems[index] || false}
                  onCheckedChange={() => toggleChecked(index)}
                />
                <div>
                  <div className="font-semibold text-gray-800">{item.phase}</div>
                  <div className="text-sm text-gray-500">{item.section}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-gray-50 px-6 py-4">
              <Card className="bg-white">
                <CardContent className="space-y-3 py-4">
                  <p><strong>Customer-Facing:</strong> {item.customerFacing ? "✅ Yes" : "❌ No"}</p>
                  <p><strong>Member Perform:</strong> {item.memberPerform ? "✅ Yes" : "❌ No"}</p>
                  <p><strong>Steps:</strong> {item.notes}</p>
                  {item.photo && <p><a href={item.photo} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">📷 Photo</a></p>}
                  {item.video && <p><a href={item.video} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">🎥 Video</a></p>}
                  {[item.resource1, item.resource2, item.resource3].map((res, i) =>
                    res && (
                      <p key={i}>
                        <a href={res} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          🔗 Additional Resource {i + 1}
                        </a>
                      </p>
                    )
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
