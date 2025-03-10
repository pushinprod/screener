import clsx from "clsx";
import { Grid } from "grid";
import { COLUMNS, generateRows } from "./generateRows";
import { useState, useRef, useEffect } from "react";

export const FastGrid = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [grid, setGrid] = useState<Grid | null>(null);
  const [loadingRows, setLoadingRows] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (container == null) {
      return;
    }

    const t0 = performance.now();
    const grid = new Grid(container, [], COLUMNS);
    setGrid(grid);
    console.info("Ms to initialize grid:", performance.now() - t0);

    setLoadingRows(true);
    generateRows(1000, grid, () => setLoadingRows(false));

    (window as any).__grid = grid;
    return () => {
      grid.destroy();
    };
  }, []);

  return (
    <>
      <div className="mt-1 self-start max-md:mt-2">
        Mini Bloomberg Terminal
      </div>
      <div className="mb-4 mt-1 self-start text-sm max-md:mt-2 sm:text-[13px]">
        Code from:
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