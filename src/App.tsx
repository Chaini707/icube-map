import { useCallback, useState } from 'react';
import './App.css'
// import AsiaMap from './AsiaMap'
import MapChart from './MapChart';
import { Tooltip as ReactTooltip } from 'react-tooltip'
import Clock from './Clock';



function App() {
  
  const [content, setContent] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [position, setPosition] = useState<{
    zoom: number;
    coordinates: [number, number];
  }>({
    zoom: 1,
    coordinates: [0, 0],
  });

  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  const flyTo = useCallback(
    async (
      targetCoords: [number, number],
      finalZoom: number,
      mode: "pan-then-zoom" | "zoom-then-pan" = "pan-then-zoom"
    ) => {
      const panStep = () =>
        new Promise<void>((resolve) => {
          const duration = 700;
          const start = performance.now();
          const initial = position.coordinates;

          const animate = () => {
            const now = performance.now();
            const p = Math.min((now - start) / duration, 1);
            const eased = 0.5 - Math.cos(p * Math.PI) / 2;

            setPosition((prev) => ({
              ...prev,
              coordinates: [
                initial[0] + (targetCoords[0] - initial[0]) * eased,
                initial[1] + (targetCoords[1] - initial[1]) * eased,
              ],
            }));

            if (p < 1) requestAnimationFrame(animate);
            else resolve();
          };

          animate();
        });

      const zoomStep = () =>
        new Promise<void>((resolve) => {
          const duration = 600;
          const start = performance.now();
          const initialZoom = position.zoom;

          const animate = () => {
            const now = performance.now();
            const p = Math.min((now - start) / duration, 1);
            const eased = 0.5 - Math.cos(p * Math.PI) / 2;

            setPosition((prev) => ({
              ...prev,
              zoom: initialZoom + (finalZoom - initialZoom) * eased,
            }));

            if (p < 1) requestAnimationFrame(animate);
            else resolve();
          };

          animate();
        });

      // ⭐ Choose sequence dynamically
      if (mode === "pan-then-zoom") {
        await panStep();
        await zoomStep();
      } else {
        await zoomStep();
        await panStep();
      }
    },

    [position.zoom, position.coordinates, setPosition]
  );




  return (
    <div className='h-screen'>
  <div className="flex h-[15%] justify-between items-center p-4">

    {/* Logo */}
    <img src="./icube-logo.png" alt="icube" className='px-4 cursor-pointer' onClick={()=>{
      // setPosition({zoom:1,coordinates:[0,0]})
      setTimeout(() => {
          flyTo([40, 0], 1.2, "zoom-then-pan");
        }, 30);
      setSelectedCity("")
      setSelectedCountry("")
    }}/>

    {/* Date Time Section with Gradient Border */}
    <div className="relative rounded-3xl">

      {/* Gradient Border Layer */}
      <div
        className="absolute inset-0 rounded-3xl p-px"
        style={{
          background:
            "linear-gradient(106.43deg, rgba(255,255,255,0) 1.06%, rgba(255,255,255,0) 33.57%, rgba(255,255,255,0.3) 70.08%, rgba(255,255,255,0) 97.09%)",
        }}
      >
        <div className="w-full h-full rounded-3xl bg-transparent"></div>
      </div>

      {/* Content */}
      <Clock />
    </div>
  </div>

  {/* Map Section */}
  <div className='h-[85%]'>
    <MapChart setTooltipContent={setContent}  position={position}
        setPosition={setPosition}
        selectedCity={selectedCity} 
        setSelectedCity={setSelectedCity}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        flyTo={flyTo}
        />
    <ReactTooltip anchorSelect=".tooltip-target" place="top">
      {content}
    </ReactTooltip>
  </div>
</div>


  );
}

export default App
