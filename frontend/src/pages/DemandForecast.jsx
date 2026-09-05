import {useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  CalendarDays,
  Download,
  Sparkles,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

import "./DemandForecast.css";
import { getForecast } from "../services/dashboardApi";


const formatNumber = (value) =>
  Math.round(value).toLocaleString();

const axisFormatter = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }

  return `${Math.round(value / 1000)}K`;
};

export default function DemandForecast() {
  const [horizon, setHorizon] = useState("30D");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadForecast = async () => {
      try {
        setLoading(true);
        setError("");

        const days = Number(horizon.replace("D", ""));
        const response = await getForecast(days);
        console.log(
         "Demand Forecast:",
          horizon,
          "API days:",
          response.forecast?.length
        );

        if (!cancelled) {
          const formatted = response.forecast.map((item) => ({
            day: item.forecast_day,
            date: item.date,
            forecast: item.predicted_sales,
          }));

          setData(formatted);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Forecast API error:", err);
          setError("Unable to load forecast data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadForecast();

    return () => {
      cancelled = true;
    };
  }, [horizon]);

 const statistics = useMemo(() => {
  if (!data.length) {
    return {
      average: 0,
      minimum: 0,
      maximum: 0,
      growth: 0,
    };
  }

  const values = data.map(
    (item) => Number(item.forecast) || 0
  );

  const average =
    values.reduce(
      (sum, value) => sum + value,
      0
    ) / values.length;

  const minimum = Math.min(...values);
  const maximum = Math.max(...values);

  const first = values[0];
  const last = values[values.length - 1];

  const growth =
    first !== 0
      ? ((last - first) / first) * 100
      : 0;

  return {
    average,
    minimum,
    maximum,
    growth,
  };
}, [data]);

  const downloadForecast = () => {
    const rows = [
      ["Day", "Forecast"],
      ...data.map((item) => [
        item.day,
        item.forecast,
      ]),
    ];

    const csv = rows
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `demandiq_forecast_${horizon}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="forecast-page">

      <div className="forecast-page-header">

        <div>
          <span className="forecast-kicker">
            AI DEMAND INTELLIGENCE
          </span>

          <h2>Demand Forecast</h2>

          <p>
            Explore projected sales demand
            across multiple forecasting
            horizons.
          </p>
        </div>

        <button
          className="forecast-download"
          onClick={downloadForecast}
        >
          <Download size={16} />
          Export Forecast
        </button>

      </div>

      <div className="forecast-control-card">

        <div>
          <span>Forecast Horizon</span>

          <strong>
            Select prediction period
          </strong>
        </div>

        <div className="forecast-horizon-buttons">

          {["7D", "30D", "90D"].map(
            (item) => (
              <button
                key={item}
                className={
                  horizon === item
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setHorizon(item)
                }
              >
                {item}
              </button>
            )
          )}

        </div>

      </div>

      <div className="forecast-kpis">

        <article>
          <Sparkles size={20} />

          <div>
            <span>
              Average Demand
            </span>

            <strong>
  {loading
    ? "Loading..."
    : formatNumber(statistics.average)}
</strong>

          </div>
        </article>

        <article>
          <TrendingUp size={20} />

          <div>
            <span>
              Peak Demand
            </span>

            <strong>
  {loading
    ? "Loading..."
    : formatNumber(statistics.maximum)}
</strong>

          </div>
        </article>

        <article>
          <CalendarDays size={20} />

          <div>
            <span>
              Forecast Horizon
            </span>

            <strong>
              {horizon}
            </strong>
          </div>
        </article>

        <article>
          <TriangleAlert size={20} />

          <div>
            <span>
              Expected Growth
            </span>

            <strong>
  {loading
    ? "Loading..."
    : `${statistics.growth >= 0 ? "+" : ""}${statistics.growth.toFixed(1)}%`}
</strong>

          </div>
        </article>

      </div>

      <article className="forecast-chart-card">

        <div className="forecast-chart-heading">

          <div>
            <span>
              FUTURE DEMAND
            </span>

            <h3>
              Projected Sales Demand
            </h3>
          </div>

          <div className="forecast-live-status">
            <i />
            Forecast Ready
          </div>

        </div>

        <div className="forecast-chart-area">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart
              key={horizon}
              data={data}
              margin={{
                top: 20,
                right: 15,
                bottom: 0,
                left: 0,
              }}
            >

              <defs>

                <linearGradient
                  id="forecastAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >

                  <stop
                    offset="0%"
                    stopColor="#d9ff3f"
                    stopOpacity={0.27}
                  />

                  <stop
                    offset="100%"
                    stopColor="#d9ff3f"
                    stopOpacity={0}
                  />

                </linearGradient>

                <linearGradient
                  id="forecastLineGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >

                  <stop
                    offset="0%"
                    stopColor="#12d9ff"
                  />

                  <stop
                    offset="50%"
                    stopColor="#20e0c0"
                  />

                  <stop
                    offset="100%"
                    stopColor="#d9ff3f"
                  />

                </linearGradient>

              </defs>

              <CartesianGrid
                vertical={false}
                stroke="rgba(255,255,255,.04)"
              />

              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                stroke="#556166"
                fontSize={9}
                interval={
                  horizon === "90D"
                    ? 17
                    : horizon === "30D"
                    ? 4
                    : 0
                }
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                stroke="#556166"
                fontSize={9}
                tickFormatter={
                  axisFormatter
                }
              />

              <Tooltip
                formatter={(value) => [
                  formatNumber(value),
                  "Forecast",
                ]}
                contentStyle={{
                  background: "#070b0c",
                  border:
                    "1px solid rgba(255,255,255,.09)",
                  borderRadius: "10px",
                  color: "#fff",
                }}
              />

              <Area
                type="linear"
                dataKey="forecast"
                stroke="url(#forecastLineGradient)"
                strokeWidth={4}
                fill="url(#forecastAreaGradient)"
                animationDuration={1400}
                animationEasing="ease-out"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </article>

      <div className="forecast-bottom-grid">

        <article>
          <span>
            Minimum Demand
          </span>

          <strong>
            {formatNumber(
              statistics.minimum
            )}
          </strong>

          <p>
            Lowest projected demand within
            the selected horizon.
          </p>
        </article>

        <article>
          <span>
            Maximum Demand
          </span>

          <strong>
            {formatNumber(
              statistics.maximum
            )}
          </strong>

          <p>
            Highest projected sales demand
            during the forecast period.
          </p>
        </article>

        <article>
          <span>
            Forecast Status
          </span>

          <strong className="forecast-green">
            Active
          </strong>

          <p>
            Prediction data is available
            for analysis and export.
          </p>
        </article>

      </div>

    </section>
  );
}