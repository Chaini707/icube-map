import React from "react";
import {
  Annotation,
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

import { capitals, STATUS_STYLE, type PlantDetail } from "../public/constant";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/solid";
import type { CSSProperties } from "react";


type CSSVarStyle = CSSProperties & {
  [key: `--${string}`]: string | number;
};


// 👉 Define Type for Parent Position
export type PositionType = {
  zoom: number;
  coordinates: [number, number];
};

const MapChart = ({
  setTooltipContent,
  position,
  setPosition,
  selectedCity,
  setSelectedCity,
  selectedCountry,
  setSelectedCountry,
  flyTo
  
}: {
  setTooltipContent: (content: string) => void;
  position: PositionType;
  setPosition: React.Dispatch<React.SetStateAction<PositionType>>;
  selectedCity: string | null;
  setSelectedCity: React.Dispatch<React.SetStateAction<string | null>>;
  selectedCountry: string;
  setSelectedCountry: React.Dispatch<React.SetStateAction<string>>;
  flyTo: (targetCoords: [number, number], finalZoom: number, mode?: "pan-then-zoom" | "zoom-then-pan") => Promise<void>
}) => {

  // ⛵ Smooth flyTo animation now correctly typed + parent controlled


  const statusDot = (type: PlantDetail["status"]) => {
    const s = STATUS_STYLE[type];
    if (!s) return null;

    return (
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: s.dot, boxShadow: `0 0 8px ${s.dot}` }}
      />
    );
  };

  const statusMarker = (type: PlantDetail["status"]) => STATUS_STYLE[type];


  const detailStatus = (
    type: PlantDetail["status"] | null,
    selectedCity?: string | null
  ) => {
    if (!type) return null;
    const s = STATUS_STYLE[type];

    return (
      <>
        <div
          className={`rounded-md ${selectedCity ? "w-[35px] h-5" : "w-[50px] h-[30px]"}`}
          style={{
            backgroundColor: s.bg,
            border: `1px solid ${s.border}`,
          }}
        />
        <h1 className="text-sm font-medium">{type}</h1>
      </>
    );
  };


  

  return (
    <div className="w-screen h-full flex pt-4 relative">
    

      {/* OVERLAY BOX (BOTTOM LEFT) */}
      
      <div
        className="
      absolute bottom-10 left-10
      bg-[#071A1F]/80 
      text-white 
      p-4 
      rounded-xl 
      shadow-lg 
      backdrop-blur-sm 
      w-[260px]
      z-50
    "
      >
        {selectedCountry ? (
          <>
            <div className="text-lg font-bold">{selectedCity}</div>
            <div className="text-xs opacity-80">
              {capitals.find((c) => c.code === selectedCity)?.description}
            </div>
            <div className="flex items-center space-x-4 mt-1 text-xs">
              <div className=" opacity-60 ">
                {capitals.find((c) => c.code === selectedCity)?.country}
              </div>
              <div className="flex justify-start items-center space-x-2">
                {detailStatus(capitals.find((c) => c.code === selectedCity)!.status!, selectedCity)}
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-start items-center space-x-2">
              {detailStatus('Healthy')}
            </div>
            <div className="flex justify-start items-center space-x-2">
              {detailStatus('At-Risk')}
            </div>
            <div className="flex justify-start items-center space-x-2">
              {detailStatus('Critical')}
            </div>
          </div>
        )}
      </div>
      {/* LEFT: MAP */}
      <div className="flex-1 flex items-center justify-center relative">
        <ComposableMap>
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow
                dx="0"
                dy="0"
                stdDeviation="3"
                floodColor="black"
                floodOpacity="0.6"
              />
            </filter>
          </defs>
          <defs>
            <linearGradient
              id="popupGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#3F6188" />
              <stop offset="100%" stopColor="#0A1723" />
            </linearGradient>
          </defs>
          <ZoomableGroup
            zoom={position.zoom}
            center={position.coordinates}
            onMoveEnd={(pos) => {
              if (pos.coordinates && pos.coordinates.length === 2) {
                setPosition(pos);
              }
            }}
          >
            <Geographies geography="/features.json">
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    className="tooltip-target"
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={() =>
                      setTooltipContent(geo.properties.name ?? "")
                    }
                    onMouseLeave={() => setTooltipContent("")}
                    style={{
                      default: {
                        fill:
                          selectedCountry.toLowerCase() ===
                          geo.properties.name.toLowerCase()
                            ? "white"
                            : "#A2B9BE",
                        outline: "black",
                        filter:
                          selectedCountry.toLowerCase() ===
                          geo.properties.name.toLowerCase()
                            ? "url(#shadow)"
                            : "none",
                      },
                      hover: { fill: "#34505B", outline: "none" },
                      pressed: { fill: "#34505B", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* MARKERS */}
            {capitals.map((city, index) => {
              if (!city.coords || city.coords.length !== 2) return null;

              const isSelected = selectedCity === city.code;

              // 👉 If some city is selected AND this is NOT that city → hide it
              if (selectedCity && !isSelected) return null;

              return (
                <React.Fragment key={`item-${city.code}-${index}`}>
                  
                  {/* Marker (always shown when selected or nothing selected) */}
                  <Marker coordinates={city.coords}>
                    <foreignObject x={-20} y={-20} width={40} height={40}>
                      <div className="relative w-full h-full flex items-center justify-center">

                        {/* Glow ring (animated) */}
                        <div
                          className="absolute h-4 w-4 glow-ping-dynamic"
                          style={
                            {
                              "--glow-color": statusMarker(city.status).glow,
                            } as CSSVarStyle
                          }
                        />

                        {/* Center dot */}
                        <div
                          className="relative h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: statusMarker(city.status).dot,
                            boxShadow: `0 0 10px ${statusMarker(city.status).dot}`,
                          }}
                        />
                      </div>
                    </foreignObject>
                  </Marker>



                  {/* Annotation ONLY when selected */}
                  {isSelected && (
                    <Annotation
                      subject={city.coords}
                      dx={6}
                      dy={-12}
                      connectorProps={{
                        stroke: "#BDDDE3",
                        strokeWidth: 1.5,
                        strokeLinecap: "round",
                      }}
                    >
                      <rect
                        x={-1}
                        y={-13}
                        width={city.rect[0]}
                        height={city.rect[1]}
                        rx={12}
                        fill="url(#popupGradient)"
                        opacity={0.95}
                        stroke="#A2B9BE"
                        strokeWidth={0.5}
                      />
                      <text
                        x={4}
                        y={0}
                        fill="rgba(230, 247, 251, 1)"
                        fontSize={8}
                        fontWeight="bold"
                      >
                        {city.code}
                      </text>
                    </Annotation>
                  )}
                </React.Fragment>
              );
            })}


          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* RIGHT: LIST PANEL */}
      <div className="w-[37%] min-w-[300px] z-9999 h-full px-8 flex items-start justify-center">
        <div
          className="w-full bg-[#071A1F] rounded-xl max-h-[79vh] overflow-y-auto
                  shadow-[0_0_40px_rgba(100,180,205,0.45)] relative"
        >
          {/* HEADER */}
          {
            selectedCountry ? (
              <div
                className="grid grid-cols-[0.5fr_1.2fr_1fr_1fr_2.1fr] bg-[#34505B] text-sm font-semibold text-[#CFE0EA]
                              rounded-t-xl py-3 px-4 sticky top-0 z-10"
              >
                <div className="rounded-tl-xl">Status</div>
                <div className="rounded-tl-xl px-3">Customer</div>
                <div className="rounded-tr-xl px-4">Country</div>
                <div className="rounded-tr-xl">Office</div>
                <div className="rounded-tr-xl">Description</div>
                <div
                  className="absolute top-3 right-5 rounded-tr-xl  cursor-pointer hover:text-white flex justify-end"
                  onClick={() => {
                    // reset logic here
                    setSelectedCity("");
                    setSelectedCountry("");
                    setTimeout(() => {
                      flyTo([40, 0], 1.2, "zoom-then-pan");
                    }, 30);

                  }}
                >
                  <ArrowUturnLeftIcon className="w-5 h-5 text-[#CFE0EA] hover:text-white transition" />
                </div>
              </div>
            ):
            (
              <div
                className="grid grid-cols-[0.5fr_1.2fr_1fr_1fr_2.1fr] bg-[#34505B] text-sm font-semibold text-[#CFE0EA]
                              rounded-t-xl py-3 px-4 sticky top-0 z-10 text-start"
              >
                <div className="rounded-tl-xl">Status</div>
                <div className="rounded-tl-xl px-3">Customer</div>
                <div className="rounded-tr-xl px-4">Country</div>
                <div className="rounded-tr-xl">Office</div>
                <div className="rounded-tr-xl">Description</div>
              </div>
            )
          }

          {/* LIST */}
          <div className="space-y-4 my-4 px-4 text-start">
            {capitals.map((city) => (
              <ul
                key={city.code}
                className="grid grid-cols-[0.5fr_1.2fr_1fr_1fr_2.1fr] bg-[#0D3241]
                          text-white text-xs font-medium rounded-xl
                          py-3 px-4 items-center hover:bg-[#538398] cursor-pointer
                          hover:border-[#A2B9BE] hover:border border-none
                          transition-all"
                onClick={() => {
                  flyTo(city.coords, 4);
                  setSelectedCity(city.code);
                  setSelectedCountry(city.country);
                }}
                onMouseEnter={() => setTooltipContent(city.code)}
                onMouseLeave={() => setTooltipContent("")}
              >
                 {/* 🔵 Status Dot */}
                <li className="">
                  {statusDot(city.status)}
                </li>

                {/* Customer */}
                <li className="rounded-l-xl ">{city.company}</li>

                {/* Country */}
                <li className="opacity-40 pl-3">{city.country}</li>

                {/* Office */}
                <li className="text-start opacity-90">{city.code}</li>

                {/* Description */}
                <li className="opacity-40 text-start pl-2">{city.description}</li>
                
              </ul>
            ))}
          </div>


        </div>
      </div>
    </div>
  );
};

export default MapChart;
