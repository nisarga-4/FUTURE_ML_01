import { useEffect, useState } from "react";
import {
  getDashboardData,
  getModelMetrics,
  getForecast,
} from "../services/dashboardApi";
import {
  BarChart3,
  BrainCircuit,
  Download,
  FileSpreadsheet,
  FileText,
  TrendingUp,
} from "lucide-react";

import "./Reports.css";

const reports = [
  {
    title: "Demand Forecast Report",
    description:
      "Future sales demand projections and forecast summary.",
    icon: TrendingUp,
    type: "forecast",
  },
  {
    title: "Sales Analytics Report",
    description:
      "Historical sales trends and business intelligence metrics.",
    icon: BarChart3,
    type: "sales",
  },
  {
    title: "Model Performance Report",
    description:
      "Validation metrics including R², MAPE and RMSE.",
    icon: BrainCircuit,
    type: "model",
  },
];


export default function Reports() {
const [reportData, setReportData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
useEffect(() => {
  let cancelled = false;

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboard, metrics, forecast] = await Promise.all([
        getDashboardData(30),
        getModelMetrics(),
        getForecast(30),
      ]);

      if (!cancelled) {
        setReportData({
          dashboard,
          metrics,
          forecast,
        });
      }
    } catch (err) {
      if (!cancelled) {
        console.error("Reports API error:", err);
        setError("Unable to load report data.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadReports();

  return () => {
    cancelled = true;
  };
}, []);
const reportRows = reportData
  ? {
      forecast: [
        ["Metric", "Value"],
        ["Average Forecast", reportData.dashboard.summary.average],
        ["Minimum Forecast", reportData.dashboard.summary.minimum],
        ["Maximum Forecast", reportData.dashboard.summary.maximum],
        [
          "Forecast Horizon",
          `${reportData.dashboard.summary.forecast_days} Days`,
        ],
      ],

      sales: [
        ["Metric", "Value"],
        ["Average Daily Sales", reportData.dashboard.summary.average],
        ["Peak Sales", reportData.dashboard.summary.maximum],
        [
          "Trend",
          `${reportData.dashboard.summary.trend_percent}%`,
        ],
      ],

      model: [
        ["Metric", "Value"],
        ["R2 Score", reportData.metrics.r2],
        ["MAPE", `${reportData.metrics.mape}%`],
        ["MAE", reportData.metrics.mae],
        ["RMSE", reportData.metrics.rmse],
        ["Status", "Healthy"],
      ],
    }
  : {
      forecast: [],
      sales: [],
      model: [],
    };

  const downloadReport = (
    reportType,
    title
  ) => {
    const csv = reportRows[
      reportType
    ]
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
      `${title
        .toLowerCase()
        .replaceAll(" ", "_")}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <section className="reports-page">

      <div className="reports-header">

        <div>
          <span>
            BUSINESS REPORTING
          </span>

          <h2>Reports</h2>

          <p>
            Export forecasting, analytics and
            model-performance summaries for
            further business analysis.
          </p>
        </div>

      </div>

      <div className="reports-overview">

        <article>
          <FileText size={20} />

          <div>
            <span>Available Reports</span>
            <strong>3</strong>
          </div>
        </article>

        <article>
          <FileSpreadsheet size={20} />

          <div>
            <span>Export Format</span>
            <strong>CSV</strong>
          </div>
        </article>

        <article>
          <Download size={20} />

          <div>
            <span>Download Status</span>
            <strong>Ready</strong>
          </div>
        </article>

      </div>

      <div className="report-card-grid">

        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <article
              key={report.type}
              className="report-card"
            >

              <div className="report-icon">
                <Icon size={23} />
              </div>

              <span>
                ANALYTICS REPORT
              </span>

              <h3>
                {report.title}
              </h3>

              <p>
                {report.description}
              </p>

              <button
                onClick={() =>
                  downloadReport(
                    report.type,
                    report.title
                  )
                }
                disabled={loading || !reportData}
              >
                <Download size={16} />
                Download CSV
              </button>

            </article>
          );
        })}

      </div>

      <article className="report-info-card">

        <div>
          <span>
            REPORTING ENGINE
          </span>

          <h3>
            Export data for deeper analysis
          </h3>

          <p>
            Downloaded CSV files can be opened
            in Excel, Power BI, Tableau or other
            analytics platforms.
          </p>
        </div>

        <FileSpreadsheet size={42} />

      </article>

    </section>
  );
}