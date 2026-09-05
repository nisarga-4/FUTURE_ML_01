import { useEffect, useMemo, useState } from "react";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  TrendingUp,
} from "lucide-react";

import { getDashboardData } from "../services/dashboardApi";

import "./SalesAnalytics.css";


const formatNumber = (value) => {
  const number = Number(value || 0);

  return Math.round(number).toLocaleString();
};


const axisFormatter = (value) => {
  const number = Number(value || 0);

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${Math.round(number / 1000)}K`;
  }

  return number.toString();
};


const formatDate = (dateValue) => {
  if (!dateValue) return "";

  const date = new Date(`${dateValue}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};


export default function SalesAnalytics() {
  const [period, setPeriod] = useState("30D");

  const [analyticsData, setAnalyticsData] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {
    let cancelled = false;

    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const horizon = Number(
          period.replace("D", "")
        );

        const data =
          await getDashboardData(horizon);

        if (!cancelled) {
          setAnalyticsData(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(
            "Sales Analytics API error:",
            err
          );

          setError(
            "Unable to load sales analytics."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      cancelled = true;
    };
  }, [period]);


  const selectedDays = Number(
    period.replace("D", "")
  );


  const historicalData = useMemo(() => {
    if (!analyticsData?.historical) {
      return [];
    }

    return analyticsData.historical
      .slice(-selectedDays)
      .map((item) => ({
        date: item.date,
        actual: Number(item.sales),
      }));
  }, [
    analyticsData,
    selectedDays,
  ]);


  const forecastData = useMemo(() => {
    if (!analyticsData?.forecast) {
      return [];
    }

    return analyticsData.forecast.map(
      (item) => ({
        date: item.date,
        forecast: Number(
          item.predicted_sales
        ),
      })
    );
  }, [analyticsData]);


  const salesTrendData = useMemo(() => {
    const historical =
      historicalData.map((item) => ({
        date: item.date,
        displayDate: formatDate(
          item.date
        ),
        actual: item.actual,
        forecast: null,
      }));

    const future =
      forecastData.map((item) => ({
        date: item.date,
        displayDate: formatDate(
          item.date
        ),
        actual: null,
        forecast: item.forecast,
      }));

    return [
      ...historical,
      ...future,
    ];
  }, [
    historicalData,
    forecastData,
  ]);


  const weeklySales = useMemo(() => {
    if (!historicalData.length) {
      return [];
    }

    const groups = [];

    for (
      let index = 0;
      index < historicalData.length;
      index += 7
    ) {
      const chunk =
        historicalData.slice(
          index,
          index + 7
        );

      const total = chunk.reduce(
        (sum, item) =>
          sum + item.actual,
        0
      );

      groups.push({
        week: `Week ${
          groups.length + 1
        }`,
        sales: Math.round(total),
      });
    }

    return groups;
  }, [historicalData]);


  const statistics = useMemo(() => {
    if (!historicalData.length) {
      return {
        average: 0,
        peak: 0,
        minimum: 0,
        growth: 0,
      };
    }

    const values =
      historicalData.map(
        (item) => item.actual
      );

    const average =
      values.reduce(
        (sum, value) =>
          sum + value,
        0
      ) / values.length;

    const peak =
      Math.max(...values);

    const minimum =
      Math.min(...values);

    const first = values[0];

    const last =
      values[
        values.length - 1
      ];

    const growth =
      first !== 0
        ? ((last - first) / first) *
          100
        : 0;

    return {
      average,
      peak,
      minimum,
      growth,
    };
  }, [historicalData]);


  const forecastAverage =
    analyticsData?.summary?.average ??
    0;

  const forecastPeak =
    analyticsData?.summary?.maximum ??
    0;

  const forecastTrend =
    analyticsData?.summary
      ?.trend_percent ?? 0;

  const modelR2 =
    analyticsData?.model?.r2 ?? 0;


  if (
    loading &&
    !analyticsData
  ) {
    return (
      <section className="sales-analytics-page">
        <div
          style={{
            minHeight: "420px",
            display: "grid",
            placeItems: "center",
            color: "#12d9ff",
          }}
        >
          Loading live sales analytics...
        </div>
      </section>
    );
  }


  if (
    error &&
    !analyticsData
  ) {
    return (
      <section className="sales-analytics-page">
        <div
          style={{
            minHeight: "420px",
            display: "grid",
            placeItems: "center",
            color: "#ff7777",
          }}
        >
          {error}
        </div>
      </section>
    );
  }


  return (
    <section className="sales-analytics-page">

      <div className="analytics-page-header">

        <div>
          <span className="analytics-page-kicker">
            BUSINESS INTELLIGENCE
          </span>

          <h2>
            Sales Analytics
          </h2>

          <p>
            Monitor historical sales,
            future demand and forecasting
            performance using live
            machine-learning data.
          </p>
        </div>


        <div
          style={{
            display: "flex",
            gap: "7px",
          }}
        >
          {[
            "7D",
            "30D",
            "90D",
          ].map((item) => (
            <button
              key={item}
              className="analytics-period-button"
              onClick={() =>
                setPeriod(item)
              }
              style={{
                color:
                  period === item
                    ? "#061006"
                    : undefined,

                background:
                  period === item
                    ? "#d9ff3f"
                    : undefined,

                borderColor:
                  period === item
                    ? "#d9ff3f"
                    : undefined,
              }}
            >
              <CalendarDays
                size={15}
              />

              {item}
            </button>
          ))}
        </div>

      </div>


      <div className="analytics-kpis">

        <article>

          <div className="analytics-kpi-icon cyan">
            <TrendingUp
              size={21}
            />
          </div>

          <div>
            <span>
              Average Daily Sales
            </span>

            <strong>
              {formatNumber(
                statistics.average
              )}
            </strong>

            <small
              className={
                statistics.growth >= 0
                  ? "analytics-positive"
                  : ""
              }
            >
              <ArrowUpRight
                size={12}
              />

              {statistics.growth >= 0
                ? "+"
                : ""}

              {statistics.growth.toFixed(
                1
              )}
              % historical movement
            </small>
          </div>

        </article>


        <article>

          <div className="analytics-kpi-icon lime">
            <BarChart3
              size={21}
            />
          </div>

          <div>
            <span>
              Peak Historical Sales
            </span>

            <strong>
              {formatNumber(
                statistics.peak
              )}
            </strong>

            <small>
              Highest observed demand
            </small>
          </div>

        </article>


        <article>

          <div className="analytics-kpi-icon cyan">
            <TrendingUp
              size={21}
            />
          </div>

          <div>
            <span>
              Forecast Accuracy
            </span>

            <strong>
              {(modelR2 * 100).toFixed(
                2
              )}
              %
            </strong>

            <small>
              Real model R² score
            </small>
          </div>

        </article>


        <article>

          <div className="analytics-kpi-icon lime">
            <CalendarDays
              size={21}
            />
          </div>

          <div>
            <span>
              Forecast Window
            </span>

            <strong>
              {period}
            </strong>

            <small>
              Live ML forecast horizon
            </small>
          </div>

        </article>

      </div>


      <div className="sales-analytics-grid">

        <article className="analytics-card analytics-main-chart">

          <div className="analytics-card-header">

            <div>
              <span>
                SALES TREND
              </span>

              <h3>
                Historical Sales &
                Future Forecast
              </h3>
            </div>


            <span className="analytics-live">
              <i />
              Live ML Data
            </span>

          </div>


          <div className="dashboard-chart-summary">

            <div>
              <span>
                Forecast Average
              </span>

              <strong>
                {formatNumber(
                  forecastAverage
                )}
              </strong>
            </div>


            <div>
              <span>
                Forecast Peak
              </span>

              <strong>
                {formatNumber(
                  forecastPeak
                )}
              </strong>
            </div>


            <div>
              <span>
                Forecast Trend
              </span>

              <strong
                className={
                  forecastTrend >= 0
                    ? "positive"
                    : ""
                }
              >
                {forecastTrend >= 0
                  ? "+"
                  : ""}

                {Number(
                  forecastTrend
                ).toFixed(1)}
                %
              </strong>
            </div>

          </div>


          <div className="recharts-wrapper-large">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                key={period}
                data={salesTrendData}
                margin={{
                  top: 20,
                  right: 16,
                  left: 0,
                  bottom: 0,
                }}
              >

                <defs>

                  <linearGradient
                    id="actualArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#12d9ff"
                      stopOpacity={0.2}
                    />

                    <stop
                      offset="100%"
                      stopColor="#12d9ff"
                      stopOpacity={0}
                    />
                  </linearGradient>


                  <linearGradient
                    id="forecastAnalyticsArea"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#d9ff3f"
                      stopOpacity={0.18}
                    />

                    <stop
                      offset="100%"
                      stopColor="#d9ff3f"
                      stopOpacity={0}
                    />
                  </linearGradient>

                </defs>


                <CartesianGrid
                  stroke="rgba(255,255,255,.045)"
                  vertical={false}
                />


                <XAxis
                  dataKey="displayDate"
                  stroke="#526064"
                  tickLine={false}
                  axisLine={false}
                  fontSize={9}
                  interval={
                    period === "90D"
                      ? 19
                      : period === "30D"
                      ? 8
                      : 2
                  }
                />


                <YAxis
                  stroke="#526064"
                  tickLine={false}
                  axisLine={false}
                  fontSize={9}
                  tickFormatter={
                    axisFormatter
                  }
                />


                <Tooltip
                  contentStyle={{
                    background:
                      "#080c0d",

                    border:
                      "1px solid rgba(255,255,255,.09)",

                    borderRadius:
                      "10px",

                    color:
                      "#fff",
                  }}
                  formatter={(
                    value,
                    name
                  ) => [
                    formatNumber(value),

                    name === "actual"
                      ? "Historical Sales"
                      : "ML Forecast",
                  ]}
                />


                <Legend />


                <Area
                  type="linear"
                  dataKey="actual"
                  name="Historical Sales"
                  connectNulls={false}
                  stroke="#12d9ff"
                  strokeWidth={3}
                  fill="url(#actualArea)"
                  animationDuration={
                    1200
                  }
                />


                <Area
                  type="linear"
                  dataKey="forecast"
                  name="ML Forecast"
                  connectNulls={false}
                  stroke="#d9ff3f"
                  strokeWidth={3}
                  fill="url(#forecastAnalyticsArea)"
                  animationDuration={
                    1400
                  }
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </article>


        <article className="analytics-card weekly-chart-card">

          <div className="analytics-card-header">

            <div>
              <span>
                HISTORICAL PERFORMANCE
              </span>

              <h3>
                Sales by Week
              </h3>
            </div>

          </div>


          <div className="recharts-wrapper-small">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                key={period}
                data={weeklySales}
              >

                <CartesianGrid
                  stroke="rgba(255,255,255,.04)"
                  vertical={false}
                />


                <XAxis
                  dataKey="week"
                  stroke="#526064"
                  tickLine={false}
                  axisLine={false}
                  fontSize={9}
                  interval={0}
                />


                <YAxis
                  stroke="#526064"
                  tickLine={false}
                  axisLine={false}
                  fontSize={9}
                  tickFormatter={
                    axisFormatter
                  }
                />


                <Tooltip
                  cursor={{
                    fill:
                      "rgba(255,255,255,.025)",
                  }}
                  contentStyle={{
                    background:
                      "#080c0d",

                    border:
                      "1px solid rgba(255,255,255,.09)",

                    borderRadius:
                      "9px",

                    color:
                      "#fff",
                  }}
                  formatter={(value) => [
                    formatNumber(value),
                    "Weekly Sales",
                  ]}
                />


                <Bar
                  dataKey="sales"
                  fill="#d9ff3f"
                  radius={[
                    5,
                    5,
                    0,
                    0,
                  ]}
                  animationDuration={
                    1100
                  }
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </article>

      </div>

    </section>
  );
}