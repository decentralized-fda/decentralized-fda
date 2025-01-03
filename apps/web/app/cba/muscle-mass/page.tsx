'use client';

import React, { useState } from 'react';
import { MuscleMassReport } from '@/components/health-econ/MuscleMassReport';

export default function MuscleMassAnalysisPage() {
  const [muscleMassIncrease, setMuscleMassIncrease] = useState(5);
  const [populationSize, setPopulationSize] = useState(335000000);

  // Helper function for number formatting
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  return (
    <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold m-0 mb-4 sm:mb-0">
          Heath and Economic Impact of Increasing Muscle Mass
        </h1>
      {/* Input Controls */}
      <div className="mb-12 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Analysis Parameters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Muscle Mass Increase (lbs per person)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="20"
                value={muscleMassIncrease}
                onChange={(e) => setMuscleMassIncrease(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-lg font-semibold min-w-[4rem]">
                {muscleMassIncrease} lbs
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Population Size
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1000"
                max="335000000"
                step="100000"
                value={populationSize}
                onChange={(e) => setPopulationSize(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-lg font-semibold min-w-[8rem]">
                {formatNumber(populationSize)}
              </span>
            </div>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-500">
          Adjust the sliders to see how different parameters affect the analysis results.
        </div>
      </div>

      {/* Report */}
      <MuscleMassReport 
          muscleMassIncrease={muscleMassIncrease}
          populationSize={populationSize} 
      />
    </div>
  );
}