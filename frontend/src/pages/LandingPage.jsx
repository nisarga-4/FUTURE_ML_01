import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BrainCircuit,
  Database,
  LineChart,
  LockKeyhole,
  LogIn,
  Sparkles,
  Target,
} from "lucide-react";

import FlowingWave from "../components/FlowingWave";
import "./LandingPage.css";
import RevealOnScroll from "../components/RevealOnScroll";


export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page dark-theme">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <header className="landing-nav">

        <div className="brand">
          <div className="brand-mark">
            <BarChart3 size={22} />
          </div>

          <div>
            <div className="brand-name">DemandIQ</div>
            <div className="brand-subtitle">
              Sales Forecast Intelligence
            </div>
          </div>
        </div>


        <nav className="nav-links">
          <a href="#home">Home</a>
          <a href="#platform">Platform</a>
          <a href="#analytics">Analytics</a>
          <a href="#performance">Performance</a>
          <a href="#about">About</a>
        </nav>


        <div className="nav-actions">

          <button
            className="login-btn"
            onClick={() => navigate("/signin")}
          >
        <LogIn size={17} />
        Sign In
         </button>

          <button
            className="primary-nav-btn"
            onClick={() => navigate("/signin")}
          >
        Launch Dashboard
        <ArrowRight size={17} />
          </button>

        </div>

      </header>


      <main>

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="hero-section" id="home">

          <div className="hero-bg-wave">
            <FlowingWave />
          </div>


          <div className="hero-content">

            {/* LEFT SIDE */}

            <div className="hero-copy">

              <div className="eyebrow">
                <Sparkles size={15} />
                AI-POWERED SALES FORECASTING
              </div>


              <h1>

                <span className="hero-title-line">
                  Predict Demand.
                </span>

                <span className="hero-title-line hero-gradient-text">
                  Plan Smarter.
                </span>

                <span className="hero-title-line">
                  Grow With Confidence.
                </span>

              </h1>


              <p className="hero-description">
                Turn historical sales data into accurate forecasts and smarter
                business decisions with machine-learning-powered demand
                intelligence.
              </p>


              <div className="hero-actions">

              <button
  type="button"
  className="hero-primary-btn"
  onClick={() => {
    document
      .getElementById("platform")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  }}
>
  Explore DemandIQ
  <ArrowRight size={18} />
</button>
<button 
  type="button"
  className="hero-secondary-btn"
  onClick={() => navigate("/signin")}
>
  Sign In / Create Account
</button>

              </div>


              <div className="trust-row">
                <div className="trust-label">
                   Built for Better Business Decisions
                </div>

                <div className="business-benefits">
                  <span>Predict Demand</span>
                  <span>•</span>            
                  <span>Plan Inventory</span>
                  <span>•</span>
                  <span>Reduce Risk</span>
              </div>
             </div>
             </div>
            {/* RIGHT SIDE FORECAST */}

            <div className="hero-visual">

              <div className="forecast-card">

                <div className="forecast-card-header">

                  <div className="forecast-heading-row">

                    <h3>
                      Sales Demand Outlook
                    </h3>

                    <span className="live-pill">
                      Live Forecast
                    </span>

                  </div>

                </div>


                <div className="forecast-summary-row">

                  <div>
                    <span>Forecast Average</span>
                    <strong>857,138</strong>
                  </div>

                  <div>
                    <span>Peak Demand</span>
                    <strong>967,047</strong>
                  </div>

                  <div>
                    <span>Model Performance</span>
                    <strong>R² 0.9561</strong>
                  </div>

                </div>


                <div className="forecast-chart">

                  <div className="chart-y-axis">
                    <span>1.2M</span>
                    <span>900K</span>
                    <span>600K</span>
                    <span>300K</span>
                    <span>0</span>
                  </div>


                  <div className="chart-body">

                    <div className="chart-grid" />


                    <svg
                      viewBox="0 0 700 280"
                      preserveAspectRatio="none"
                    >

                      <defs>

                        <linearGradient
                          id="forecastLine"
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
                            offset="48%"
                            stopColor="#20e0c0"
                          />

                          <stop
                            offset="100%"
                            stopColor="#d9ff3f"
                          />

                        </linearGradient>


                        <linearGradient
                          id="forecastArea"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >

                          <stop
                            offset="0%"
                            stopColor="#d9ff3f"
                            stopOpacity="0.25"
                          />

                          <stop
                            offset="100%"
                            stopColor="#d9ff3f"
                            stopOpacity="0"
                          />

                        </linearGradient>

                      </defs>


                      <path
                        d="
                          M 0 220
                          C 45 175, 70 205, 110 160
                          S 175 195, 220 145
                          S 285 180, 330 120
                          S 390 160, 440 95
                          S 515 135, 560 80
                          S 625 115, 700 48
                          L 700 280
                          L 0 280
                          Z
                        "
                        fill="url(#forecastArea)"
                      />


                      <path
                        className="chart-line"
                        d="
                          M 0 220
                          C 45 175, 70 205, 110 160
                          S 175 195, 220 145
                          S 285 180, 330 120
                          S 390 160, 440 95
                          S 515 135, 560 80
                          S 625 115, 700 48
                        "
                        fill="none"
                        stroke="url(#forecastLine)"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />


                      <line
                        x1="350"
                        y1="25"
                        x2="350"
                        y2="250"
                        stroke="#8ef430"
                        strokeDasharray="5 6"
                        opacity="0.55"
                      />


                      <circle
                        cx="350"
                        cy="118"
                        r="6"
                        fill="#8ef430"
                      />

                    </svg>


                    <div className="chart-x-axis">
                      <span>May 1</span>
                      <span>May 8</span>
                      <span>May 15</span>
                      <span>May 22</span>
                      <span>May 29</span>
                    </div>

                  </div>

                </div>


                <div className="chart-legend">

                  <span>
                    <i className="legend-dot cyan" />
                    Historical
                  </span>

                  <span>
                    <i className="legend-dot lime" />
                    Forecast
                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>



        {/* =====================================================
            KPI STRIP
        ===================================================== */}

        <section className="metric-strip">

          <div className="metric-item">

            <div className="metric-icon cyan-icon">
              <LineChart size={24} />
            </div>

            <div>
              <strong>95.61%</strong>
              <span>Model R² Score</span>
              <small>High predictive accuracy</small>
            </div>

          </div>


          <div className="metric-item">

            <div className="metric-icon lime-icon">
              <Target size={24} />
            </div>

            <div>
              <strong>3.13%</strong>
              <span>MAPE</span>
              <small>Low prediction error</small>
            </div>

          </div>


          <div className="metric-item">

            <div className="metric-icon lime-icon">
              <BarChart3 size={24} />
            </div>

            <div>
              <strong>30 Days</strong>
              <span>Forecast Horizon</span>
              <small>Future demand insight</small>
            </div>

          </div>


          <div className="metric-item">

            <div className="metric-icon cyan-icon">
              <BrainCircuit size={24} />
            </div>

            <div>
              <strong>AI/ML</strong>
              <span>Powered Engine</span>
              <small>Advanced algorithms</small>
            </div>

          </div>

        </section>



        {/* =====================================================
            WHY CHOOSE US
        ===================================================== */}

        <section
          className="why-section"
          id="platform"
        >

          <div className="why-container">

            <div className="why-heading">

              <span className="why-eyebrow">
                WHY CHOOSE US?
              </span>

              <h2>
                Everything You Need to
                <br />

                <span>
                  Forecast Smarter.
                </span>
              </h2>


              <p>
                From intelligent forecasting to business-ready analytics,
                DemandIQ turns your sales data into clear, actionable
                insights.
              </p>

            </div>



            <div className="why-grid">

              {/* LARGE CARD */}

              <article className="feature-card feature-card-large">

                <div className="feature-number">
                  01
                </div>


                <div className="feature-icon cyan-icon">
                  <LineChart size={26} />
                </div>


                <div className="feature-content">

                  <span className="feature-label">
                    FORECASTING ENGINE
                  </span>

                  <h3>
                    AI-Powered
                    <br />
                    Demand Forecasting
                  </h3>

                  <p>
                    Transform historical sales patterns into intelligent
                    future demand predictions powered by machine learning.
                  </p>

                </div>


                <div className="mini-forecast">

                  <div className="mini-grid" />


                  <svg
                    viewBox="0 0 600 180"
                    preserveAspectRatio="none"
                  >

                    <defs>

                      <linearGradient
                        id="miniLine"
                        x1="0"
                        x2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#08d9f7"
                        />

                        <stop
                          offset="52%"
                          stopColor="#24e6b3"
                        />

                        <stop
                          offset="100%"
                          stopColor="#d7ff29"
                        />

                      </linearGradient>


                      <linearGradient
                        id="miniArea"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#8cff45"
                          stopOpacity=".25"
                        />

                        <stop
                          offset="100%"
                          stopColor="#8cff45"
                          stopOpacity="0"
                        />

                      </linearGradient>

                    </defs>


                    <path
                      className="mini-area"
                      d="
                        M0 145
                        C55 125 70 132 110 105
                        C155 74 180 118 225 86
                        C270 53 295 102 340 69
                        C390 31 420 80 460 51
                        C505 19 530 60 600 18
                        L600 180
                        L0 180
                        Z
                      "
                    />


                    <path
                      className="mini-line"
                      d="
                        M0 145
                        C55 125 70 132 110 105
                        C155 74 180 118 225 86
                        C270 53 295 102 340 69
                        C390 31 420 80 460 51
                        C505 19 530 60 600 18
                      "
                    />

                  </svg>

                </div>

              </article>



              {/* BUSINESS INTELLIGENCE CARD */}

              <article className="feature-card">

                <div className="feature-number">
                  02
                </div>


                <div className="feature-icon lime-icon">
                  <BarChart3 size={26} />
                </div>


                <div className="feature-content">

                  <span className="feature-label">
                    BUSINESS INTELLIGENCE
                  </span>

                  <h3>
                    Analytics Built
                    <br />
                    for Decisions.
                  </h3>

                  <p>
                    Explore business KPIs, demand trends and forecast
                    performance through a clean BI-style analytics
                    experience.
                  </p>

                </div>


                <div className="analytics-bars">

                  <span style={{ "--bar": "48%" }} />
                  <span style={{ "--bar": "67%" }} />
                  <span style={{ "--bar": "55%" }} />
                  <span style={{ "--bar": "82%" }} />
                  <span style={{ "--bar": "72%" }} />
                  <span style={{ "--bar": "94%" }} />

                </div>

              </article>



              {/* MODEL PERFORMANCE CARD */}

              <article className="feature-card">

                <div className="feature-number">
                  03
                </div>


                <div className="feature-icon cyan-icon">
                  <Target size={26} />
                </div>


                <div className="feature-content">

                  <span className="feature-label">
                    MODEL PERFORMANCE
                  </span>

                  <h3>
                    Confidence Behind
                    <br />
                    Every Forecast.
                  </h3>

                  <p>
                    Track model accuracy and forecasting performance so
                    every prediction is backed by measurable results.
                  </p>

                </div>


                <div className="accuracy-display">

                  <div>

                    <strong>
                      95.61%
                    </strong>

                    <span>
                      MODEL R² SCORE
                    </span>

                  </div>


                  <div className="accuracy-ring">
                    <span>R²</span>
                  </div>

                </div>

              </article>

            </div>

          </div>

        </section>



        {/* =====================================================
            MODEL PERFORMANCE
        ===================================================== */}

        <RevealOnScroll className="performance-section" id="performance">

  <div className="performance-left">

    <div className="section-heading">
      <span>MODEL PERFORMANCE</span>

      <h2>
        Built for Accuracy.
        <br />
        Optimized for Results.
      </h2>
    </div>

    <div className="performance-overview">

      <div className="score-ring">
        <div className="score-ring-inner">
          <strong>95.61%</strong>
          <span>Model R² Score</span>
        </div>
      </div>

      <div className="performance-stats">

        <div>
          <strong>3.13%</strong>
          <span>MAPE</span>
          <small>Low prediction error</small>
        </div>

        <div>
          <strong>0.956</strong>
          <span>R² Score</span>
          <small>High explanatory power</small>
        </div>

        <div>
          <strong>30 Days</strong>
          <span>Forecast Horizon</span>
          <small>Future demand insight</small>
        </div>

      </div>

    </div>

  </div>


  <div className="performance-chart-card">

    <div className="card-heading-row">

      <div>
        <span className="chart-card-label">SALES ANALYTICS</span>
        <h3>Actual vs Forecasted Sales</h3>
      </div>

      <div className="chart-controls">
        <button>7 Days</button>
        <button className="active">30 Days</button>
        <button>90 Days</button>
      </div>

    </div>


    <div className="chart-status-row">

      <span>
        <i className="legend-dot cyan" />
        Actual Sales
      </span>

      <span>
        <i className="legend-dot lime" />
        Forecasted Sales
      </span>

      <small>Last updated: Live</small>

    </div>


    <div className="bars">

      {Array.from({ length: 24 }).map((_, index) => (
        <span
          key={index}
          className={index < 12 ? "bar actual" : "bar forecast"}
          style={{
            height: `${35 + ((index * 17) % 60)}%`,
          }}
        />
      ))}

    </div>


    <div className="bars-labels">
      <span>May 1</span>
      <span>May 8</span>
      <span>May 15</span>
      <span>May 22</span>
      <span>May 29</span>
    </div>

  </div>
</RevealOnScroll>


        {/* =====================================================
            PLATFORM CAPABILITIES
        ===================================================== */}

        <section
          className="capabilities-section"
          id="analytics"
        >

          <div className="section-heading">

            <span>
              PLATFORM CAPABILITIES
            </span>

            <h2>
              Powerful Tools. Smarter Decisions.
            </h2>

          </div>


          <div className="capabilities-grid">

            <div className="capability">

              <Database />

              <h4>
                Data Integration
              </h4>

              <p>
                Connect and prepare forecasting data.
              </p>

            </div>


            <div className="capability">

              <LineChart />

              <h4>
                Advanced Analytics
              </h4>

              <p>
                Explore sales behavior and trends.
              </p>

            </div>


            <div className="capability">

              <Target />

              <h4>
                Demand Forecasting
              </h4>

              <p>
                Generate future demand predictions.
              </p>

            </div>


            <div className="capability">

              <Bell />

              <h4>
                Smart Alerts
              </h4>

              <p>
                Identify unusual demand patterns.
              </p>

            </div>


            <div className="capability">

              <LockKeyhole />

              <h4>
                Secure & Reliable
              </h4>

              <p>
                Controlled access to forecasting tools.
              </p>

            </div>

          </div>

        </section>



        {/* =====================================================
            FOOTER
        ===================================================== */}

        <footer
          className="site-footer"
          id="about"
        >

          <div className="footer-brand">

            <div className="brand">

              <div className="brand-mark">
                <BarChart3 size={20} />
              </div>


              <div>

                <div className="brand-name">
                  DemandIQ
                </div>

                <div className="brand-subtitle">
                  Sales Forecast Intelligence
                </div>

              </div>

            </div>


            <p>
              Intelligent sales forecasting and analytics for smarter
              business planning.
            </p>

          </div>



          <div className="footer-column">

            <h4>
              Product
            </h4>

            <a href="#platform">
              Platform
            </a>

            <a href="#analytics">
              Analytics
            </a>

            <a href="#performance">
              Performance
            </a>

          </div>



          <div className="footer-column">

            <h4>
              Company
            </h4>

            <a href="#about">
              About
            </a>

            <a href="#about">
              Project
            </a>

            <a href="#about">
              Contact
            </a>

          </div>



          <div className="footer-column">

            <h4>
              Resources
            </h4>

            <a href="#analytics">
              Forecasts
            </a>

            <a href="#performance">
              Model Metrics
            </a>

            <a href="#platform">
              Business Insights
            </a>

          </div>

        </footer>

      </main>

    </div>
  );
}