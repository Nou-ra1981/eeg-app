import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

function computeWelchPSD(signal, fs = 100) {
  const n = signal.length;
  const windowSize = fs;
  const overlap = fs / 2;
  const psd = new Array(fs).fill(0);

  for (let i = 0; i < n - windowSize; i += windowSize - overlap) {
    const segment = signal.slice(i, i + windowSize);
    const mean = segment.reduce((a, b) => a + b, 0) / segment.length;
    const windowed = segment.map(
      (x, idx) =>
        (x - mean) *
        (0.5 - 0.5 * Math.cos((2 * Math.PI * idx) / (windowSize - 1)))
    );
    const fft = windowed.map((val, i) => [
      val * Math.cos((2 * Math.PI * i) / windowSize),
      val * Math.sin((2 * Math.PI * i) / windowSize),
    ]);
    const power = fft.map(([re, im]) => re * re + im * im);
    for (let j = 0; j < fs; j++) psd[j] += power[j] || 0;
  }

  return {
    freq: Array.from({ length: fs }, (_, i) => i),
    power: psd.map((x) => 10 * Math.log10(x / (n / windowSize))),
  };
}

export default function EEGApp() {
  const [signalData, setSignalData] = useState(null);
  const [channel, setChannel] = useState("A3");
  const [view, setView] = useState("time");
  const [compareMode, setCompareMode] = useState(false);

  useEffect(() => {
    Papa.parse("/eeg_data_a3_a4_utc.csv", {
      download: true,
      header: true,
      complete: (results) => {
        const timestamps = results.data.map((row) => row["UTC Timestamp"]);
        const a3 = results.data.map((row) => parseFloat(row["EEG Signal A3 (uV)"]));
        const a4 = results.data.map((row) => parseFloat(row["EEG Signal A4 (uV)"]));
        setSignalData({ timestamps, A3: a3, A4: a4 });
      },
    });
  }, []);

  const computeBandPower = () => {
    if (!signalData) return null;
    const data = signalData[channel];
    const cleaned = data.filter((v) => !isNaN(v));
    const avg = cleaned.reduce((sum, v) => sum + v, 0) / cleaned.length;
    return {
      Delta: avg * 0.25,
      Theta: avg * 0.2,
      Alpha: avg * 0.3,
      Beta: avg * 0.15,
      Gamma: avg * 0.1,
    };
  };

  const bandPower = computeBandPower();

  const createTimeChartData = () => ({
    labels: signalData.timestamps.map((ts) => ts.slice(11, 19)),
    datasets: compareMode
      ? ["A3", "A4"].map((ch) => ({
          label: `EEG ${ch}`,
          data: signalData[ch],
          borderColor: ch === "A3" ? "#00bfff" : "#ff6384",
          fill: false,
          pointRadius: 0,
        }))
      : [
          {
            label: `EEG ${channel}`,
            data: signalData[channel],
            borderColor: "#00bfff",
            fill: false,
            pointRadius: 0,
          },
        ],
  });

  const createPSDChartData = () => {
    const channels = compareMode ? ["A3", "A4"] : [channel];
    const datasets = channels.map((ch) => {
      const { power } = computeWelchPSD(signalData[ch]);
      return {
        label: `EEG ${ch} (PSD)`,
        data: power,
        borderColor: ch === "A3" ? "#00bfff" : "#ff6384",
        fill: false,
        pointRadius: 0,
      };
    });
    return {
      labels: Array.from({ length: 100 }, (_, i) => i),
      datasets,
    };
  };

  const pieChart = bandPower
    ? {
        labels: Object.keys(bandPower),
        datasets: [
          {
            label: "Band Power",
            data: Object.values(bandPower),
            backgroundColor: [
              "#FF6384",
              "#36A2EB",
              "#FFCE56",
              "#4BC0C0",
              "#9966FF",
            ],
          },
        ],
      }
    : null;

  return (
    <div
      className="min-h-screen w-screen text-white"
      style={{
        backgroundImage: "url('/bg-neuro.gif')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <div className="flex flex-col items-center justify-center w-full px-4 py-10">
        <div className="w-full max-w-full bg-black/80 backdrop-blur-md p-10 rounded-lg shadow-2xl">
          <h1 className="text-5xl font-extrabold text-center mb-10 tracking-wide text-cyan-300">
            EEG Signal Analyzer
          </h1>

          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <label className="block font-semibold mb-2 text-white">Select Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="px-4 py-2 rounded bg-white text-black shadow"
              >
                <option value="A3">A3</option>
                <option value="A4">A4</option>
              </select>
            </div>

            <div className="text-center">
              <label className="block font-semibold mb-2 text-white">Select View</label>
              <select
                value={view}
                onChange={(e) => setView(e.target.value)}
                className="px-4 py-2 rounded bg-white text-black shadow"
              >
                <option value="time">Time Domain</option>
                <option value="psd">Power Spectral Density (PSD)</option>
              </select>
            </div>

            <div className="text-center">
              <label className="block font-semibold mb-2 text-white">Compare A3 & A4</label>
              <input
                type="checkbox"
                checked={compareMode}
                onChange={(e) => setCompareMode(e.target.checked)}
                className="w-5 h-5"
              />
            </div>
          </div>

          {signalData && (
            <div className="bg-white text-black rounded-lg p-6 shadow-xl w-full">
              <h2 className="text-2xl font-semibold text-center mb-6">
                EEG Signal ({compareMode ? "A3 & A4" : channel}) – {view === "time" ? "Time Domain" : "Power Spectrum"}
              </h2>
              <div className="w-full" style={{ height: "500px" }}>
                <Line
                  data={view === "time" ? createTimeChartData() : createPSDChartData()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        title: {
                          display: true,
                          text: view === "time" ? "Time (UTC)" : "Frequency (Hz)",
                          color: "#fff",
                        },
                        ticks: {
                          maxRotation: 45,
                          minRotation: 45,
                          color: "#fff",
                          autoSkip: true,
                          maxTicksLimit: 20,
                        },
                        grid: {
                          color: "#fff3",
                        },
                      },
                      y: {
                        title: {
                          display: true,
                          text: view === "time" ? "EEG Signal (uV)" : "Power (dB)",
                          color: "#fff",
                        },
                        beginAtZero: true,
                        ticks: { color: "#fff" },
                        grid: {
                          color: "#fff3",
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: "#000",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}

          {pieChart && (
            <div className="bg-white text-black rounded-lg p-6 shadow-xl w-full mt-10">
              <h2 className="text-2xl font-semibold text-center mb-6">
                Band Power Breakdown ({channel})
              </h2>
              <div className="w-full max-w-md mx-auto" style={{ height: "300px" }}>
                <Pie
                  data={pieChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        labels: { color: "#000" },
                      },
                    },
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}