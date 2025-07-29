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
  "bg-gradient-to-r from-red-600 to-red-800 dark:from-red-700 dark:to-red-900",
  "bg-gradient-to-r from-yellow-500 to-yellow-700 dark:from-yellow-600 dark:to-yellow-800",
  "bg-gradient-to-r from-green-600 to-green-800 dark:from-green-700 dark:to-green-900",
  "bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900",
  "bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-700 dark:to-purple-900",
  "bg-gradient-to-r from-pink-600 to-pink-800 dark:from-pink-700 dark:to-pink-900",
];

export default function OrientationGuide() {
  const [query, setQuery] = useState("");
  const [orientationData, setOrientationData] = useState<any[]>([]);
  const [checkedItems, setCheckedItems] = useState<{ [key: number]: boolean }>({});
  const [openItems, setOpenItems] = useState<string[]>([]);
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
            setOpenItems(cleaned.map((_, index) => index.toString()));
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
    setOpenItems((prev) => prev.filter((val) => val !== index.toString()));
  };

  const handleToggle = (val: string) => {
    const index = parseInt(val);
    setOpenItems((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
    if (!checkedItems[index]) {
      setCheckedItems((prev) => ({ ...prev, [index]: true }));
    }
  };

  const scrollToPhase = (phase: string) => {
    const element = phaseRefs.current[phase];
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10 pt-2 transition-all duration-300 min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 z-50 bg-gray-950 py-2 flex justify-center">
        <img
          src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
          alt="DRS Logo"
          className="w-20 md:w-24"
        />
      </div>

      <div className="text-center py-2 md:py-4">
        <h1 className="text-md md:text-3xl font-extrabold">VIP Orientation Guide (Rep View)</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10 sticky top-28 md:top-32 z-30 bg-gray-950 py-4">
        <div className="w-full md:w-1/3 space-y-4">
          <Input
            type="text"
            placeholder="🔍 Search notes or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border px-5 py-4 shadow-md text-lg bg-gray-800 text-white"
          />

          <div className="overflow-y-auto max-h-80 border rounded-md p-3 text-sm bg-gray-800">
            <h2 className="font-bold mb-2">📌 Phases</h2>
            <ul className="space-y-1">
              {uniquePhases.map((phase, i) => (
                <li key={i}>
                  <button
                    onClick={() => scrollToPhase(phase)}
                    className="text-blue-400 hover:underline w-full text-left"
                  >
                    {phase}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border rounded-md p-3 text-sm bg-gray-800">
            <h2 className="font-bold mb-2">🧾 Legend</h2>
            <div className="flex items-center gap-2 text-sm text-white">
              <UserCircle className="text-green-400 size-4" /> = Member Performs
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
                }}
              >
                <div className={classNames("sticky z-30 top-28 md:top-32 px-4 py-2 rounded font-semibold border mb-4 text-lg text-white", phaseColor)}>
                  {phaseName}
                </div>
                <Accordion type="multiple" className="space-y-6" value={openItems}>
                  {itemsInPhase.map((item, index) => {
                    const itemIndex = orientationData.indexOf(item);
                    return (
                      <AccordionItem
                        key={index}
                        value={itemIndex.toString()}
                        className="border-l-4 border-blue-400 rounded-xl bg-gray-900 shadow hover:shadow-lg transition-shadow duration-300"
                      >
                        <AccordionTrigger
                          className="px-6 py-5 text-base font-semibold bg-gray-800 hover:bg-gray-700"
                          onClick={() => handleToggle(itemIndex.toString())}
                        >
                          <div className="flex items-center gap-4 w-full">
                            {item.memberPerform && (
                              <span title="Member Performs">
                                <UserCircle className="text-green-400 size-4" />
                              </span>
                            )}
                            <Checkbox
                              checked={checkedItems[itemIndex] || false}
                              onCheckedChange={() => toggleChecked(itemIndex)}
                              className="scale-125"
                            />
                            <div className="text-left text-base font-bold">
                              {item.section}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-gray-900 px-8 py-6">
                          <Card className="bg-gray-900 border-none shadow-none">
                            <CardContent className="space-y-3 text-white">
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
                                    className="text-blue-400 underline"
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
                                        className="text-blue-400 underline"
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
                    );
                  })}
                </Accordion>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
