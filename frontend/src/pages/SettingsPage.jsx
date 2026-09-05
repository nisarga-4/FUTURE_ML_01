import {
  Bell,
  Check,
  Database,
  Save,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

import "./SettingsPage.css";

export default function SettingsPage() {
  const initial =
    JSON.parse(
      localStorage.getItem(
        "demandiq-settings"
      ) || "null"
    ) || {
      notifications: true,
      forecastAlerts: true,
      compactNumbers: true,
      defaultRange: "30D",
    };

  const [settings, setSettings] =
    useState(initial);

  const [saved, setSaved] =
    useState(false);

  const saveSettings = () => {
    localStorage.setItem(
      "demandiq-settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(
      () => setSaved(false),
      1600
    );
  };

  return (
    <section className="settings-page">

      <div className="settings-header">

        <div>
          <span>
            SYSTEM PREFERENCES
          </span>

          <h2>Settings</h2>

          <p>
            Configure dashboard behaviour and
            user preferences.
          </p>
        </div>

        <button
          className="save-settings"
          onClick={saveSettings}
        >
          {saved ? (
            <>
              <Check size={16} />
              Saved
            </>
          ) : (
            <>
              <Save size={16} />
              Save Changes
            </>
          )}
        </button>

      </div>

      <div className="settings-grid">

        <article>

          <div className="settings-card-heading">
            <Bell size={20} />

            <div>
              <h3>
                Notifications
              </h3>

              <p>
                Control alerts and system
                messages.
              </p>
            </div>
          </div>

          <label className="setting-row">

            <div>
              <strong>
                System notifications
              </strong>

              <span>
                Receive important platform
                alerts.
              </span>
            </div>

            <input
              type="checkbox"
              checked={
                settings.notifications
              }
              onChange={(event) =>
                setSettings({
                  ...settings,
                  notifications:
                    event.target.checked,
                })
              }
            />

          </label>

          <label className="setting-row">

            <div>
              <strong>
                Forecast alerts
              </strong>

              <span>
                Receive alerts when forecasts
                are updated.
              </span>
            </div>

            <input
              type="checkbox"
              checked={
                settings.forecastAlerts
              }
              onChange={(event) =>
                setSettings({
                  ...settings,
                  forecastAlerts:
                    event.target.checked,
                })
              }
            />

          </label>

        </article>

        <article>

          <div className="settings-card-heading">
            <Database size={20} />

            <div>
              <h3>
                Analytics
              </h3>

              <p>
                Configure dashboard display
                defaults.
              </p>
            </div>
          </div>

          <label className="settings-select-label">
            Default forecast range

            <select
              value={
                settings.defaultRange
              }
              onChange={(event) =>
                setSettings({
                  ...settings,
                  defaultRange:
                    event.target.value,
                })
              }
            >
              <option value="7D">
                7 Days
              </option>

              <option value="30D">
                30 Days
              </option>

              <option value="90D">
                90 Days
              </option>
            </select>
          </label>

          <label className="setting-row">

            <div>
              <strong>
                Compact numbers
              </strong>

              <span>
                Display large values using K
                and M abbreviations.
              </span>
            </div>

            <input
              type="checkbox"
              checked={
                settings.compactNumbers
              }
              onChange={(event) =>
                setSettings({
                  ...settings,
                  compactNumbers:
                    event.target.checked,
                })
              }
            />

          </label>

        </article>

        <article>

          <div className="settings-card-heading">
            <ShieldCheck size={20} />

            <div>
              <h3>
                Security
              </h3>

              <p>
                Current account and access
                information.
              </p>
            </div>
          </div>

          <div className="security-info">

            <div>
              <span>User ID</span>
              <strong>USR-1001</strong>
            </div>

            <div>
              <span>Role</span>
              <strong>Admin</strong>
            </div>

            <div>
              <span>Account Status</span>
              <strong className="settings-active">
                Active
              </strong>
            </div>

          </div>

        </article>

      </div>

    </section>
  );
}