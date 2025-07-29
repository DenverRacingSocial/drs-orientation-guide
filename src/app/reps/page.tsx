"use client";

import { useEffect, useState, useRef } from "react";
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
  const phaseRefs = useRef<{ [phase: string]: HTMLDivElement | null }>({});

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
            const cleaned = results.data
              .filter((row: any) => row["Phase"] && row["Section/Step"]) // Ignore blank rows
              .map((row: any) => ({
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
          error: (err: Error) => {
            console.error("CSV parse error:", err);
          },
        });
      })
      .catch((err) => {
        console.error("Error loading orientation CSV:", err);
      });
  }, []);

  const filteredItems = orientationData.filter((item) => {
    return (
      true &&
      `${item.phase} ${item.section} ${item.notes}`.toLowerCase().includes(query.toLowerCase())
    );
  });

  const uniquePhases = Array.from(new Set(filteredItems.map((item) => item.phase)));

  const toggleChecked = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const scrollToPhase = (phase: string) => {
    const element = phaseRefs.current[phase];
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold mb-8 sticky top-0 bg-white z-30 py-6 shadow-md border-b">
        🏁 VIP Orientation Guide (Rep View)
      </h1>

      <div className="flex flex-col md:flex-row gap-6 mb-10 sticky top-[6rem] z-20 bg-white py-4">
        <div className="w-full md:w-1/3 space-y-4">
          <Input
            type="text"
            placeholder="🔍 Search notes or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border px-5 py-4 shadow-md text-lg"
          />

          <div className="overflow-y-auto max-h-80 border rounded-md p-3 text-sm bg-gray-50">
            <h2 className="font-bold mb-2">📌 Phases</h2>
            <ul className="space-y-1">
              {uniquePhases.map((phase, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollToPhase(phase)}
                    className="text-blue-600 hover:underline w-full text-left"
                  >
                    {phase}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <Accordion type="multiple" className="space-y-6" defaultValue={filteredItems.map((_, i) => i.toString())}>
            {filteredItems.map((item, index) => {
              const isFirstOfPhase =
                index === 0 || filteredItems[index - 1].phase !== item.phase;

              return (
                <div
                  key={index}
                  ref={(el) => {
                    if (isFirstOfPhase) phaseRefs.current[item.phase] = el;
                  }}
                >
                  {isFirstOfPhase && (
                    <div className="sticky top-[11rem] z-10 bg-gray-100 px-4 py-2 rounded font-semibold text-gray-700 border mb-2">
                      {item.phase}
                    </div>
                  )}

                  <AccordionItem
                    value={index.toString()}
                    className="border rounded-xl bg-white shadow hover:shadow-md transition-shadow duration-200"
                  >
                    <AccordionTrigger className="px-6 py-5">
                      <div className="flex items-center gap-4 w-full">
                        <Checkbox
                          checked={checkedItems[index] || false}
                          onCheckedChange={() => toggleChecked(index)}
                          className="scale-125"
                        />
                        <div className="text-gray-900 font-bold text-base text-left">
                          {item.section}
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent className="bg-gray-50 px-8 py-6">
                      <Card className="bg-white border-none shadow-none">
                        <CardContent className="space-y-3 text-gray-700">
                          <p>
                            <strong>Member Perform:</strong> {item.memberPerform ? "✅ Yes" : "❌ No"}
                          </p>
                          <p>
                            <strong>Notes:</strong>
                            <br /> {item.notes}
                          </p>
                          {item.photo && (
                            <p>
                              <a
                                href={item.photo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                📷 View Photo
                              </a>
                            </p>
                          )}
                          {item.video && (
                            <p>
                              <a
                                href={item.video}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 underline"
                              >
                                🎥 Watch Video
                              </a>
                            </p>
                          )}
                          {[item.resource1, item.resource2, item.resource3].map(
                            (res, i) =>
                              res && (
                                <p key={i}>
                                  <a
                                    href={res}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline"
                                  >
                                    🔗 Additional Resource {i + 1}
                                  </a>
                                </p>
                              )
                          )}
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                </div>
              );
            })}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
