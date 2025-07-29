"use client";

import { useEffect, useState, useRef } from "react";
import Papa from "papaparse";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import classNames from "classnames";

const phaseColors = [
  "bg-gradient-to-r from-red-600 to-red-800",
  "bg-gradient-to-r from-yellow-500 to-yellow-700",
  "bg-gradient-to-r from-green-600 to-green-800",
  "bg-gradient-to-r from-blue-600 to-blue-800",
  "bg-gradient-to-r from-purple-600 to-purple-800",
  "bg-gradient-to-r from-pink-600 to-pink-800",
];

export default function MemberOrientationGuide() {
  const [query, setQuery] = useState("");
  const [orientationData, setOrientationData] = useState<any[]>([]);
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [flaggedItems, setFlaggedItems] = useState<{ [key: number]: boolean }>({});
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
              .filter(
                (row: any) =>
                  row["Phase"] &&
                  row["Section/Step"] &&
                  row["Customer-Facing?"]?.toLowerCase() === "yes"
              )
              .map((row: any) => ({
                phase: row["Phase"] ?? "",
                section: row["Section/Step"] ?? "",
                notes: row["Detailed Steps/Notes"] ?? "",
                photos: row["Photo"]?.split(",").map((p: string) => p.trim()) ?? [],
                video: row["Video"] ?? "",
                resources: [
                  row["Additional Resource 1"],
                  row["Additional Resource 2"],
                  row["Additional Resource 3"]
                ].filter(Boolean),
                tags: row["Tags"]?.toLowerCase().split(",").map((t: string) => t.trim()) ?? [],
                location: row["Location"]?.toLowerCase().trim() ?? "",
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
    const searchText = `${item.phase} ${item.section} ${item.notes}`.toLowerCase();
    const tagMatch = item.tags?.some((tag: string) => tag.includes(query.toLowerCase()));
    const locationMatch = selectedLocation === "all" || !item.location || item.location === selectedLocation;
    return (searchText.includes(query.toLowerCase()) || tagMatch) && locationMatch;
  });

  const uniquePhases = Array.from(new Set(filteredItems.map((item) => item.phase)));

  const scrollToPhase = (phase: string) => {
    const element = phaseRefs.current[phase];
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleFlag = (index: number) => {
    setFlaggedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10 pt-2 transition-all duration-300 min-h-screen bg-gray-950 text-white">
      <div className="sticky top-0 z-50 bg-white py-2 flex justify-center">
        <a href="#">
          <img
            src="https://static.wixstatic.com/media/8c955c_78a26ab0afde4ab098ff74f980cab626~mv2.png"
            alt="DRS Logo"
            className="w-20 md:w-24 cursor-pointer"
          />
        </a>
      </div>

      <div className="text-center py-2 md:py-4">
        <h1 className="text-md md:text-3xl font-extrabold text-white">VIP Orientation Guide</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-10 sticky top-20 md:top-24 z-30 bg-gray-950 py-4">
        <div className="w-full md:w-1/3 space-y-4">
          <input
            type="text"
            placeholder="🔍 Search notes or content..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border px-5 py-4 shadow-md text-lg bg-gray-800 text-white"
          />

          <div className="flex gap-2 mt-2">
            {["all", "centennial", "lafayette"].map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                className={classNames(
                  "px-4 py-2 rounded-lg text-sm font-semibold border",
                  selectedLocation === loc
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700"
                )}
              >
                {loc.charAt(0).toUpperCase() + loc.slice(1)}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto max-h-80 border rounded-md p-3 text-sm bg-gray-800 mt-4">
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
                <div className={classNames("sticky z-30 top-24 md:top-28 px-4 py-2 rounded font-semibold border mb-4 text-lg text-white", phaseColor)}>
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
                        <AccordionTrigger className="px-6 py-5 text-base font-semibold bg-gray-800 hover:bg-gray-700">
                          <div className="flex justify-between w-full items-center">
                            <span className="text-left text-base font-bold">
                              {item.section}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFlag(itemIndex);
                              }}
                              className="text-sm text-yellow-400 hover:text-yellow-300"
                            >
                              {flaggedItems[itemIndex] ? "🔖 Bookmarked" : "🔖 Bookmark"}
                            </button>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="bg-gray-900 px-8 py-6">
                          <Card className="bg-gray-900 border-none shadow-none">
                            <CardContent className="space-y-3 text-white">
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
                                        src={photo}
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
                                <p className="text-sm text-gray-400 pt-2">
                                  <strong>Tags:</strong> {item.tags.join(", ")}
                                </p>
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

      {fullscreenImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setFullscreenImage(null)}
        >
          <img
            src={fullscreenImage}
            alt="Full Screen"
            className="max-h-full max-w-full rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
}
