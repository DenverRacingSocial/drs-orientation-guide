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
import { UserCircle } from "lucide-react";
import classNames from "classnames";

const phaseColors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-indigo-100",
];

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
              .filter((row: any) => row["Phase"] && row["Section/Step"])
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
          error: (err: unknown) => {
            console.error("CSV parse error:", err);
          },
        });
      })
      .catch((err) => {
        console.error("Error loading orientation CSV:", err);
      });
  }, []);

  const filteredItems = orientationData.filter((item) => {
    return `${item.phase} ${item.section} ${item.notes}`.toLowerCase().includes(query.toLowerCase());
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
    <div className="max-w-7xl mx-auto px-4 py-10 transition-all duration-300 min-h-screen">
      <div className="flex items-center justify-between sticky top-0 bg-white z-30 py-6 shadow-md border-b">
        <h1 className="text-4xl font-extrabold">🏁 VIP Orientation Guide (Rep View)</h1>
      </div>

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

          <div className="border rounded-md p-3 text-sm bg-gray-100">
            <h2 className="font-bold mb-2">🧾 Legend</h2>
            <div className="flex items-center gap-2 text-sm text-gray-800">
              <UserCircle className="text-green-600 size-4" /> = Member Performs
            </div>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          {uniquePhases.map((phaseName) => {
            const itemsInPhase = filteredItems.filter((item) => item.phase === phaseName);
            const phaseColor = phaseColors[uniquePhases.indexOf(phaseName) % phaseColors.length];
            return (
              <div
                key={phaseName}
                ref={(el) => {
                  phaseRefs.current[phaseName] = el;
                  return undefined;
                }}
              >
                <div className={classNames("sticky z-10 top-[11rem] px-4 py-2 rounded font-semibold border mb-4", phaseColor)}>
                  {phaseName}
                </div>
                <Accordion type="multiple" className="space-y-6" value={itemsInPhase.map((item) => orientationData.indexOf(item).toString())}>
                  {itemsInPhase.map((item, index) => (
                    <AccordionItem
                      key={index}
                      value={orientationData.indexOf(item).toString()}
                      className="border rounded-xl bg-white shadow hover:shadow-md transition-shadow duration-200"
                    >
                      <AccordionTrigger className="px-6 py-5">
                        <div className="flex items-center gap-4 w-full">
                          {item.memberPerform && (
                            <span title="Member Performs">
                              <UserCircle className="text-green-600 size-4" />
                            </span>
                          )}
                          <Checkbox
                            checked={checkedItems[orientationData.indexOf(item)] || false}
                            onCheckedChange={() => toggleChecked(orientationData.indexOf(item))}
                            className="scale-125"
                          />
                          <div className="font-bold text-base text-left">
                            {item.section}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="bg-gray-50 px-8 py-6">
                        <Card className="bg-white border-none shadow-none">
                          <CardContent className="space-y-3">
                            <p>
                              <strong>Notes:</strong>
                              <br /> {item.notes}
                            </p>
                            {item.photo && item.photo.match(/^https?:\/\//i) && (
                              <div>
                                <strong>Photo:</strong>
                                <div className="mt-2">
                                  <img
                                    src={item.photo}
                                    alt="Orientation step visual"
                                    className="rounded-lg max-w-full h-auto border shadow-md"
                                  />
                                </div>
                              </div>
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
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
