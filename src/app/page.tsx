"use client";

import { useState } from "react";
import { CONFIG, ConfigType } from "../utils/config";

import About from "@/components/About";
import Descriptive from "@/components/Descriptive";
import Distribution from "@/components/Distribution";
import Score from "@/components/Score";
import Correlation from "@/components/Correlation";
import Prediction from "@/components/Prediction";
import Metric from "@/components/Metric";
import Residual from "@/components/Residual";

export default function Home() {
  const [hasData, setHasData] = useState(false);
  const [config, setConfig] = useState<ConfigType>(CONFIG);

  return (
    <main className="bg-fixed bg-center bg-cover">

      {/* Always visible */}
      <About setHasData={setHasData} config={config} setConfig={setConfig} />

      {/* After CSV */}
      {hasData && (
        <>
          <Descriptive />
          <Distribution />
          <Score />
          <Correlation />
          <Metric />
          <Residual />
          <Prediction />
        </>
      )}

    </main>
  );
}
