import clsx from "clsx";
import { Grid } from "grid";
import { COLUMNS, generateRows } from "./generateRows";
import { useState, useRef, useEffect } from "react";

export const FastGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingRows, setLoadingRows] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container == null) {
      return;
    }

    const grid = new Grid(container, [], COLUMNS);

    setLoadingRows(true);
    generateRows(grid, () => setLoadingRows(false));
  }, []);

  return (
    <>
      <div className="mb-4 text-sm text-gray-600 max-w-[600px]">
        <span className="font-medium">Disclaimer:</span> The financial data shown is for educational purposes only and may not be accurate or up-to-date. This is not financial advice. Please do your own research and consult qualified professionals before making any investment decisions.
      </div>
      <div className="mt-1 self-start max-md:mt-2">
        Stock Screener
      </div>
      <div className="mb-4 mt-1 self-start text-sm max-md:mt-2 sm:text-[13px]">
        Forked from:
        <a
          className="ml-1 text-blue-600 underline hover:text-blue-800"
          href="https://github.com/gabrielpetersson/fast-grid/"
        >
          Gabriel
        </a>
      </div>

      <div
        ref={containerRef} // attaching grid here
        style={{
          contain: "strict",
        }}
        className={clsx(
          "relative box-border w-full flex-1 overflow-clip border border-gray-700 bg-white",
          loadingRows && "pointer-events-none opacity-70"
        )}
      />
    </>
  );
};