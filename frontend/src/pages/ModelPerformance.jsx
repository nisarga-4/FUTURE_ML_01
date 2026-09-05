import { useEffect, useState } from "react";
import { getModelMetrics } from "../services/dashboardApi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  BrainCircuit,
  CircleCheck,
  Gauge,
  Target,
} from "lucide-react";

import "./ModelPerformance.css";

const models = [
  {
    name: "Seasonal Blend",
    score: 95.61,
  },
  {
    name: "HGB A",
    score: 95.47,
  },
  {
    name: "HGB C",
    score: 95.46,
  },
  {
    name: "HGB B",
    score: 95.40,
  },
  {
    name: "HGB F",
    score: 95.40,
  },
];

export default function ModelPerformance() {
const [metrics, setMetrics] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");
useEffect(() => {
  let cancelled = false;

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getModelMetrics();

      if (!cancelled) {
        setMetrics(data);
      }
    } catch (err) {
      if (!cancelled) {
        console.error("Model metrics API error:", err);
        setError("Unable to load model metrics.");
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  };

  loadMetrics();

  return () => {
    cancelled = true;
  };
}, []);
const modelR2 = metrics?.r2 ?? 0;
const modelMAPE = metrics?.mape ?? 0;
const modelRMSE = metrics?.rmse ?? 0;
const modelMAE = metrics?.mae ?? 0;

  return (
    <section className="model-performance-page">

      <div className="model-performance-header">

        <div>
          <span>
            MACHINE LEARNING
          </span>

          <h2>
            Model Performance
          </h2>

          <p>
            Evaluate forecasting accuracy,
            prediction error and model
            reliability.
          </p>
        </div>

        <div className="model-active-pill">
          <CircleCheck size={15} />
          Production model healthy
        </div>

      </div>

      <div className="performance-kpi-grid">

        <article>
          <Gauge size={21} />

          <div>
            <span>R² Score</span>
            <strong>
              {modelR2.toFixed(4)}
            </strong>  
            <small>95.61% accuracy</small>
          </div>
        </article>

        <article>
          <Target size={21} />

          <div>
            <span>MAPE</span>
            <strong>
              {modelMAPE.toFixed(2)}%
            </strong>  
            <small>Low prediction error</small>
          </div>
        </article>

        <article>
          <BrainCircuit size={21} />

          <div>
            <span>RMSE</span>
            <strong>
              {modelRMSE.toLocaleString(undefined, {
                maximumFractionDigits: 2,  
              })}
            </strong>  
            <small>Validation error</small>
          </div>
        </article>

        <article>
          <CircleCheck size={21} />

          <div>
            <span>Model Status</span>
            <strong>Healthy</strong>
            <small>Ready for forecasting</small>
          </div>
        </article>

      </div>

      <div className="model-performance-grid">

        <article className="model-score-card">

          <span className="model-section-label">
            FINAL MODEL
          </span>

          <h3>
            Seasonal Blend
          </h3>

          <div className="big-performance-ring">

            <div>
              <strong>
                {(modelR2 * 100).toFixed(2)}%
              </strong>

              <span>
                R² Score
              </span>
            </div>

          </div>

          <p>
            The ensemble achieved the highest
            overall validation score among
            evaluated models.
          </p>

        </article>

        <article className="model-ranking-card">

          <span className="model-section-label">
            MODEL COMPARISON
          </span>

          <h3>
            Validation Ranking
          </h3>

          <div className="model-ranking-chart">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={models}
                layout="vertical"
                margin={{
                  top: 15,
                  right: 25,
                  left: 30,
                  bottom: 10,
                }}
              >

                <CartesianGrid
                  horizontal={false}
                  stroke="rgba(255,255,255,.04)"
                />

                <XAxis
                  type="number"
                  domain={[94, 96]}
                  tickLine={false}
                  axisLine={false}
                  fontSize={9}
                  stroke="#596569"
                />

                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  width={100}
                  fontSize={9}
                  stroke="#7a8589"
                />

                <Tooltip
                  formatter={(value) => [
                    `${Number(value).toFixed(2)}%`,
                    "R²",
                  ]}
                  contentStyle={{
                    background: "#070b0c",
                    border:
                      "1px solid rgba(255,255,255,.09)",
                    borderRadius: "9px",
                    color: "#fff",
                  }}
                />

                <Bar
                  dataKey="score"
                  radius={[0,5,5,0]}
                  animationDuration={1200}
                >
                  {models.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        index === 0
                          ? "#d9ff3f"
                          : "#12d9ff"
                      }
                    />
                  ))}
                </Bar>

              </BarChart>

            </ResponsiveContainer>

          </div>

        </article>

      </div>

      <div className="model-details">

        <article>
          <span>
            Training Result
          </span>

          <strong>
            Completed
          </strong>

          <p>
            Final ensemble successfully
            trained and validated.
          </p>
        </article>

        <article>
          <span>
            Forecasting Method
          </span>

          <strong>
            Ensemble
          </strong>

          <p>
            Multiple seasonal HGB models
            combined for stronger prediction.
          </p>
        </article>

        <article>
          <span>
            Prediction Error
          </span>

          <strong>
            Low
          </strong>

          <p>
            MAPE remains close to three
            percent on validation data.
          </p>
        </article>

      </div>

    </section>
  );
}