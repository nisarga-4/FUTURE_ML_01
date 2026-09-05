import { getDashboardData } from "../services/dashboardApi";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart3,
  Bell,
  BrainCircuit,
  ChevronDown,
  CircleUserRound,
  FileText,
  Gauge,
  LayoutDashboard,
  LineChart,
  LogOut,
  Menu,
  Search,
  Settings,
  Target,
  TrendingUp,
  X,
} from "lucide-react";

import SalesAnalytics from "./SalesAnalytics";
import DemandForecast from "./DemandForecast";
import ModelPerformance from "./ModelPerformance";
import Reports from "./Reports";
import SettingsPage from "./SettingsPage";

import "./Dashboard.css";

/* =========================================================
   SIDEBAR ITEMS
========================================================= */

const navItems = [
  {
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    label: "Sales Analytics",
    icon: BarChart3,
  },
  {
    label: "Demand Forecast",
    icon: TrendingUp,
  },
  {
    label: "Model Performance",
    icon: BrainCircuit,
  },
  {
    label: "Reports",
    icon: FileText,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function formatNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "—";
  }

  return Math.round(numericValue).toLocaleString();
}

function createChartPoints(data) {
  const width = 800;
  const height = 300;

  const topPadding = 25;
  const bottomPadding = 35;

  const minimum =
    Math.min(...data);

  const maximum =
    Math.max(...data);

  const range =
    maximum - minimum || 1;

  return data.map(
    (value, index) => {
      const x =
        data.length === 1
          ? width / 2
          : (index /
              (data.length - 1)) *
            width;

      const normalized =
        (value - minimum) /
        range;

      const y =
        height -
        bottomPadding -
        normalized *
          (height -
            topPadding -
            bottomPadding);

      return {
        x,
        y,
        value,
      };
    }
  );
}

function createSmoothPath(points) {
  if (!points.length) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path =
    `M ${points[0].x} ${points[0].y}`;

  for (
    let index = 0;
    index <
    points.length - 1;
    index++
  ) {
    const current =
      points[index];

    const next =
      points[index + 1];

    const middleX =
      (current.x + next.x) /
      2;

    path += `
      C
      ${middleX} ${current.y},
      ${middleX} ${next.y},
      ${next.x} ${next.y}
    `;
  }

  return path;
}

function getPeriodLabels(period) {
  if (period === "7D") {
    return [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];
  }

  if (period === "30D") {
    return [
      "Day 1",
      "Day 8",
      "Day 15",
      "Day 22",
      "Day 30",
    ];
  }

  return [
    "Day 1",
    "Day 23",
    "Day 45",
    "Day 68",
    "Day 90",
  ];
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function Dashboard() {
  const navigate =
    useNavigate();

  const [
    activeItem,
    setActiveItem,
  ] = useState("Overview");

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(true);

  const [
    period,
    setPeriod,
  ] = useState("30D");

  const currentUser = useMemo(
    () =>
      JSON.parse(
        localStorage.getItem("demandiq-user") || "null"
      ),
    []
  );

  useEffect(() => {
    if (!currentUser) {
      navigate("/signin");
    }
  }, [currentUser, navigate]);

  const [dashboardData, setDashboardData] = useState(null);
const [loadingDashboard, setLoadingDashboard] = useState(true);
const [dashboardError, setDashboardError] = useState("");
useEffect(() => {
  let cancelled = false;

  const loadDashboard = async () => {
    try {
      setLoadingDashboard(true);
      setDashboardError("");
      setDashboardData(null);

      const horizon = Number(period.replace("D", ""));
      const data = await getDashboardData(horizon);

      if (!cancelled) {
        setDashboardData(data);
      }
    } catch (error) {
      if (!cancelled) {
        console.error("Dashboard API error:", error);
        setDashboardError("Unable to load live dashboard data.");
      }
    } finally {
      if (!cancelled) {
        setLoadingDashboard(false);
      }
    }
  };

  loadDashboard();

  return () => {
    cancelled = true;
  };
}, [period]);

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    searchValue,
    setSearchValue,
  ] = useState("");

  /* =======================================================
     CURRENT GRAPH DATA
  ======================================================= */

 const activeChartData = useMemo(() => {
  if (!dashboardData?.forecast) {
    return [];
  }

  return dashboardData.forecast.map(
    (item) => item.predicted_sales
  );
}, [dashboardData]);

  const chartPoints =
    useMemo(
      () =>
        createChartPoints(
          activeChartData
        ),
      [activeChartData]
    );

  const chartPath =
    useMemo(
      () =>
        createSmoothPath(
          chartPoints
        ),
      [chartPoints]
    );

  const areaPath =
    useMemo(() => {
      if (!chartPoints.length) {
        return "";
      }

      const first =
        chartPoints[0];

      const last =
        chartPoints[
          chartPoints.length - 1
        ];

      return `
        ${chartPath}
        L ${last.x} 300
        L ${first.x} 300
        Z
      `;
    }, [
      chartPath,
      chartPoints,
    ]);

  /* =======================================================
     DYNAMIC METRICS
  ======================================================= */

 const forecastAverage =
  dashboardData?.summary?.average ?? 0;

const peakDemand =
  dashboardData?.summary?.maximum ?? 0;

const minimumDemand =
  dashboardData?.summary?.minimum ?? 0;

const trend =
  dashboardData?.summary?.trend_percent ?? 0;

  const modelR2 =
  dashboardData?.model?.r2 ?? 0;

const modelMAPE =
  dashboardData?.model?.mape ?? 0;

const modelRMSE =
  dashboardData?.model?.rmse ?? 0;

  const labels =
    getPeriodLabels(period);

  /* =======================================================
     ACTIONS
  ======================================================= */

  const handleLogout = () => {
    localStorage.removeItem("demandiq-user");
    navigate("/signin");
  };

  const handleSearchSubmit = (
    event
  ) => {
    event.preventDefault();

    const query =
      searchValue
        .trim()
        .toLowerCase();

    if (!query) {
      return;
    }

    const matchingItem =
      [
        ...navItems,
        {
          label: "Settings",
        },
      ].find((item) =>
        item.label
          .toLowerCase()
          .includes(query)
      );

    if (matchingItem) {
      setActiveItem(
        matchingItem.label
      );

      setSearchValue("");
    }
  };

  /* =======================================================
     OVERVIEW
  ======================================================= */

  const renderOverview = () => (
    <>
      {/* =================================================
          WELCOME
      ================================================= */}

      <div className="dashboard-welcome">
        <div>
          <span className="dashboard-kicker">
            SALES FORECAST
            INTELLIGENCE
          </span>

          <h2>
            Good to see you.
            <br />
            Here’s today’s demand
            outlook.
          </h2>
        </div>

        <div className="live-status">
          <span className="live-status-dot" />

          {loadingDashboard
            ? `Generating ${period} forecast...`
            : dashboardError
            ? "Forecast unavailable"
            : "Forecast engine active"}
        </div>
      </div>

      {/* =================================================
          KPI CARDS
      ================================================= */}

      <div className="dashboard-kpis">
        <article className="dashboard-kpi-card">
          <div className="kpi-icon cyan">
            <Gauge size={22} />
          </div>

          <div>
            <span>
              Model R² Score
            </span>

            <strong>
  {loadingDashboard
    ? "Loading..."
    : dashboardError
    ? "—"
    : `${(modelR2 * 100).toFixed(2)}%`}
</strong>

            <small>
              High predictive
              accuracy
            </small>
          </div>
        </article>

        <article className="dashboard-kpi-card">
          <div className="kpi-icon lime">
            <Target size={22} />
          </div>

          <div>
            <span>
              MAPE
            </span>

           <strong>
  {loadingDashboard
    ? "Loading..."
    : dashboardError
    ? "—"
    : `${modelMAPE.toFixed(2)}%`}
</strong> 

            <small>
              Low prediction error
            </small>
          </div>
        </article>

        <article className="dashboard-kpi-card">
          <div className="kpi-icon lime">
            <LineChart size={22} />
          </div>

          <div>
            <span>
              Forecast Horizon
            </span>

            <strong>
              {period}
            </strong>

            <small>
              Selected demand
              coverage
            </small>
          </div>
        </article>

        <article className="dashboard-kpi-card">
          <div className="kpi-icon cyan">
            <BrainCircuit
              size={22}
            />
          </div>

          <div>
            <span>
              Forecast Engine
            </span>

            <strong>
              AI/ML
            </strong>

            <small>
              Model online and
              active
            </small>
          </div>
        </article>
      </div>

      {/* =================================================
          MAIN GRID
      ================================================= */}

      <div className="dashboard-grid">
        {/* ===============================================
            MAIN CHART
        =============================================== */}

        <article className="dashboard-card demand-chart-card">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">
                SALES ANALYTICS
              </span>

              <h3>
                Forecasted Sales Demand
              </h3>
            </div>

            <div className="period-switch">
              {[
                "7D",
                "30D",
                "90D",
              ].map(
                (item) => (
                  <button
                    key={item}
                    type="button"
                    className={
                      period ===
                      item
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPeriod(
                        item
                      )
                    }
                  disabled={loadingDashboard}
                  >
                    {item}
                  </button>
                )
              )}
            </div>
          </div>

          {/* SUMMARY */}

          <div className="dashboard-chart-summary">
            <div>
              <span>
                Forecast Average
              </span>

              <strong>
  {loadingDashboard
    ? "Loading..."
    : dashboardError
    ? "—"
    : formatNumber(forecastAverage)}
</strong>

            </div>

            <div>
              <span>
                Peak Demand
              </span>

              <strong>
  {loadingDashboard
    ? "Loading..."
    : dashboardError
    ? "—"
    : formatNumber(peakDemand)}
</strong>

            </div>

            <div>
              <span>
                Trend
              </span>

              <strong
  className={trend >= 0 ? "positive" : ""}
>
  {loadingDashboard
    ? "Loading..."
    : dashboardError
    ? "—"
    : `${trend >= 0 ? "+" : ""}${trend.toFixed(1)}%`}
</strong>

            </div>
          </div>          {/* GRAPH */}

          {loadingDashboard ? (
            <div
              className="dashboard-chart-loading"
              style={{
                minHeight: "330px",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                color: "#7f8b8f",
                fontSize: "12px",
                letterSpacing: "0.04em",
              }}
            >
              Generating {period} forecast data...
            </div>
          ) : dashboardError ? (
            <div
              className="dashboard-chart-loading"
              style={{
                minHeight: "330px",
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                color: "#ff8f8f",
                fontSize: "12px",
              }}
            >
              {dashboardError}
            </div>
          ) : (
<div
            className="dashboard-line-chart"
            key={period}
          >
            <div className="dashboard-chart-grid" />

            <svg
              viewBox="0 0 800 300"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient
                  id="dashboardLine"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop
                    offset="0%"
                    stopColor="#12d9ff"
                  />

                  <stop
                    offset="45%"
                    stopColor="#20e0c0"
                  />

                  <stop
                    offset="100%"
                    stopColor="#d9ff3f"
                  />
                </linearGradient>

                <linearGradient
                  id="dashboardArea"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    stopColor="#d9ff3f"
                    stopOpacity="0.26"
                  />

                  <stop
                    offset="100%"
                    stopColor="#d9ff3f"
                    stopOpacity="0"
                  />
                </linearGradient>
              </defs>

              <path
                className="dashboard-area"
                d={areaPath}
                fill="url(#dashboardArea)"
              />

              <path
                className="dashboard-line"
                d={chartPath}
                fill="none"
                stroke="url(#dashboardLine)"
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength="1"
              />

              {chartPoints.map(
                (
                  point,
                  index
                ) => (
                  <circle
                    key={`${period}-${index}`}
                    cx={point.x}
                    cy={point.y}
                    r={
                      period ===
                      "7D"
                        ? 4
                        : period ===
                          "30D"
                        ? 2.5
                        : 0
                    }
                    fill="#d9ff3f"
                    className="dashboard-chart-point"
                  />
                )
              )}
            </svg>

            <div className="dashboard-chart-labels">
              {labels.map(
                (label) => (
                  <span
                    key={label}
                  >
                    {label}
                  </span>
                )
              )}
            </div>
          </div>
          )}
        </article>

        {/* ===============================================
            MODEL HEALTH
        =============================================== */}

        <article className="dashboard-card model-card">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">
                MODEL HEALTH
              </span>

              <h3>
                Forecast Confidence
              </h3>
            </div>
          </div>

          <div className="dashboard-score-ring">
            <div>
              <strong>
                {loadingDashboard
                  ? "Loading..."
                  : dashboardError
                  ? "—"
                  : `${(modelR2 * 100).toFixed(2)}%`}
              </strong>

              <span>
                R² Score
              </span>
            </div>
          </div>

          <div className="model-metrics">
            <div>
              <span>
                MAPE
              </span>

              <strong>
                {loadingDashboard
                  ? "Loading..."
                  : dashboardError
                  ? "—"
                  : `${modelMAPE.toFixed(2)}%`}
              </strong>
            </div>

            <div>
              <span>
                RMSE
              </span>

              <strong>
                {loadingDashboard
                  ? "Loading..."
                  : dashboardError
                  ? "—"
                  : formatNumber(modelRMSE)}
              </strong>
            </div>

            <div>
              <span>
                Status
              </span>

              <strong className="positive">
                {loadingDashboard
                  ? "Syncing..."
                  : dashboardError
                  ? "Unavailable"
                  : "Healthy"}
              </strong>
            </div>
          </div>
        </article>

        {/* ===============================================
            FORECAST SUMMARY
        =============================================== */}

        <article className="dashboard-card forecast-card-mini">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">
                FORECAST SUMMARY
              </span>

              <h3>
                Selected {period}
                Period
              </h3>
            </div>
          </div>

          <div className="forecast-summary-list">
            <div>
              <span>
                Average Demand
              </span>

              <strong>
                {loadingDashboard ? "Loading..." : dashboardError ? "—" : formatNumber(forecastAverage)}
              </strong>
            </div>

            <div>
              <span>
                Minimum Demand
              </span>

              <strong>
                {loadingDashboard ? "Loading..." : dashboardError ? "—" : formatNumber(minimumDemand)}
              </strong>
            </div>

            <div>
              <span>
                Maximum Demand
              </span>

              <strong>
                {loadingDashboard ? "Loading..." : dashboardError ? "—" : formatNumber(peakDemand)}
              </strong>
            </div>

            <div>
              <span>
                Forecast Period
              </span>

              <strong>
                {period}
              </strong>
            </div>
          </div>
        </article>

        {/* ===============================================
            ACTIVITY
        =============================================== */}

        <article className="dashboard-card activity-card">
          <div className="dashboard-card-header">
            <div>
              <span className="dashboard-card-label">
                RECENT ACTIVITY
              </span>

              <h3>
                System Updates
              </h3>
            </div>
          </div>

          <div className="activity-list">
            <div>
              <span className="activity-dot cyan" />

              <div>
                <strong>
                  {loadingDashboard
                    ? "Forecast generating"
                    : dashboardError
                    ? "Forecast update failed"
                    : "Forecast generated"}
                </strong>

                <span>
                  {loadingDashboard
                    ? `${period} sales outlook is being prepared`
                    : dashboardError
                    ? "Live forecast data could not be refreshed"
                    : `${period} sales outlook updated`}
                </span>
              </div>

              <small>
                Now
              </small>
            </div>

            <div>
              <span className="activity-dot lime" />

              <div>
                <strong>
                  Model validation
                  complete
                </strong>

                <span>
                  R² score remains
                  0.9561
                </span>
              </div>

              <small>
                12m
              </small>
            </div>

            <div>
              <span className="activity-dot cyan" />

              <div>
                <strong>
                  Analytics refreshed
                </strong>

                <span>
                  Dashboard metrics
                  synchronized
                </span>
              </div>

              <small>
                28m
              </small>
            </div>
          </div>
        </article>
      </div>
    </>
  );

  /* =======================================================
     PAGE SELECTION
  ======================================================= */

  const renderContent = () => {
    switch (activeItem) {
      case "Sales Analytics":
        return (
          <SalesAnalytics />
        );

      case "Demand Forecast":
        return (
          <DemandForecast />
        );

      case "Model Performance":
        return (
          <ModelPerformance />
        );

      case "Reports":
        return <Reports />;

      case "Settings":
        return (
          <SettingsPage />
        );

      case "Overview":
      default:
        return renderOverview();
    }
  };

  /* =========================================================
     MAIN DASHBOARD
  ========================================================= */

  return (
    <div className="dashboard-shell">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen
            ? "open"
            : "collapsed"
        }`}
      >
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <BarChart3
              size={22}
            />
          </div>

          {sidebarOpen && (
            <div>
              <strong>
                DemandIQ
              </strong>

              <span>
                Forecast
                Intelligence
              </span>
            </div>
          )}
        </div>

        <nav className="dashboard-nav">
          <span className="nav-section-title">
            {sidebarOpen
              ? "WORKSPACE"
              : ""}
          </span>

          {navItems.map(
            (item) => {
              const Icon =
                item.icon;

              return (
                <button
                  key={
                    item.label
                  }
                  type="button"
                  className={`dashboard-nav-item ${
                    activeItem ===
                    item.label
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    setActiveItem(
                      item.label
                    );

                    setNotificationsOpen(
                      false
                    );

                    setProfileOpen(
                      false
                    );
                  }}
                  title={
                    !sidebarOpen
                      ? item.label
                      : undefined
                  }
                >
                  <Icon
                    size={19}
                  />

                  {sidebarOpen && (
                    <span>
                      {
                        item.label
                      }
                    </span>
                  )}
                </button>
              );
            }
          )}
        </nav>

        <div className="dashboard-sidebar-bottom">
          <button
            type="button"
            className={`dashboard-nav-item ${
              activeItem ===
              "Settings"
                ? "active"
                : ""
            }`}
            onClick={() =>
              setActiveItem(
                "Settings"
              )
            }
          >
            <Settings
              size={19}
            />

            {sidebarOpen && (
              <span>
                Settings
              </span>
            )}
          </button>

          <button
            type="button"
            className="dashboard-nav-item logout"
            onClick={
              handleLogout
            }
          >
            <LogOut size={19} />

            {sidebarOpen && (
              <span>
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="dashboard-main">
        {/* ===================================================
            TOP BAR
        =================================================== */}

        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="sidebar-toggle"
              onClick={() =>
                setSidebarOpen(
                  (
                    current
                  ) =>
                    !current
                )
              }
            >
              <Menu size={20} />
            </button>

            <div>
              <span className="dashboard-breadcrumb">
                DemandIQ /{" "}
                {activeItem}
              </span>

              <h1>
                {activeItem}
              </h1>
            </div>
          </div>

          <div className="topbar-actions">
            {/* SEARCH */}

            <form
              className="dashboard-search"
              onSubmit={
                handleSearchSubmit
              }
            >
              <Search size={17} />

              <input
                type="text"
                value={
                  searchValue
                }
                onChange={(
                  event
                ) =>
                  setSearchValue(
                    event
                      .target
                      .value
                  )
                }
                placeholder="Search analytics..."
              />

              {searchValue && (
                <button
                  type="button"
                  onClick={() =>
                    setSearchValue(
                      ""
                    )
                  }
                  style={{
                    border:
                      "none",
                    background:
                      "transparent",
                    color:
                      "#657175",
                    display:
                      "grid",
                    placeItems:
                      "center",
                    padding: 0,
                    cursor:
                      "pointer",
                  }}
                >
                  <X
                    size={14}
                  />
                </button>
              )}
            </form>

            {/* NOTIFICATIONS */}

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <button
                type="button"
                className="icon-button"
                onClick={() => {
                  setNotificationsOpen(
                    (
                      current
                    ) =>
                      !current
                  );

                  setProfileOpen(
                    false
                  );
                }}
              >
                <Bell
                  size={18}
                />

                <span className="notification-dot" />
              </button>

              {notificationsOpen && (
                <div
                  style={{
                    position:
                      "absolute",
                    top: 48,
                    right: 0,
                    width: 270,
                    padding: 14,
                    border:
                      "1px solid rgba(255,255,255,.09)",
                    borderRadius:
                      12,
                    background:
                      "#080c0d",
                    boxShadow:
                      "0 20px 60px rgba(0,0,0,.45)",
                    zIndex: 100,
                  }}
                >
                  <strong
                    style={{
                      fontSize:
                        11,
                    }}
                  >
                    Notifications
                  </strong>

                  <div
                    style={{
                      marginTop:
                        12,
                      display:
                        "grid",
                      gap: 10,
                      color:
                        "#758084",
                      fontSize:
                        9,
                    }}
                  >
                    <span>
                      ✓ Forecast
                      engine is
                      active.
                    </span>

                    <span>
                      ✓ Latest model
                      validation
                      completed.
                    </span>

                    <span>
                      ✓ Dashboard
                      metrics were
                      refreshed.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE */}

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <button
                type="button"
                className="profile-button"
                onClick={() => {
                  setProfileOpen(
                    (
                      current
                    ) =>
                      !current
                  );

                  setNotificationsOpen(
                    false
                  );
                }}
              >
                <div className="profile-avatar">
                  <CircleUserRound
                    size={21}
                  />
                </div>

                <div className="profile-copy">
                  <strong>
                    {currentUser?.name || "User"}
                  </strong>

                  <span>
                   {currentUser?.role || "User"} · {currentUser?.user_id || ""}
                  </span>
                </div>

                <ChevronDown
                  size={16}
                />
              </button>

              {profileOpen && (
                <div
                  style={{
                    position:
                      "absolute",
                    top: 52,
                    right: 0,
                    width: 190,
                    padding: 8,
                    border:
                      "1px solid rgba(255,255,255,.09)",
                    borderRadius:
                      11,
                    background:
                      "#080c0d",
                    boxShadow:
                      "0 20px 60px rgba(0,0,0,.45)",
                    zIndex: 100,
                  }}
                >
                  <button
                    type="button"
                    className="dashboard-nav-item"
                    onClick={() => {
                      setActiveItem(
                        "Settings"
                      );

                      setProfileOpen(
                        false
                      );
                    }}
                  >
                    <Settings
                      size={16}
                    />
                    Settings
                  </button>

                  <button
                    type="button"
                    className="dashboard-nav-item logout"
                    onClick={
                      handleLogout
                    }
                  >
                    <LogOut
                      size={16}
                    />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===================================================
            CURRENT PAGE
        =================================================== */}

        <section className="dashboard-content">
          {renderContent()}
        </section>
      </main>
    </div>
  );
}