const API_BASE_URL = "https://future-ml-01-m3gs.onrender.com";

async function request(endpoint) {
  const response = await fetch(
    `${API_BASE_URL}${endpoint}`
  );

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status}`
    );
  }

  return response.json();
}

export function getDashboardData(horizon = 30) {
  return request(
    `/api/dashboard?horizon=${horizon}`
  );
}

export function getForecast(days = 30) {
  return request(
    `/api/forecast?horizon=${days}`
  );
}

export function getModelMetrics() {
  return request("/api/model/metrics");
}

export function getHistoricalSales(days = 120) {
  return request(
    `/api/historical?days=${days}`
  );
}

export async function loginUser(
  userId,
  password
) {
  const response = await fetch(
    `${API_BASE_URL}/api/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail || "Login failed"
    );
  }

  return data;
}

export async function createUser(
  name,
  userId,
  password
) {
  const response = await fetch(
    `${API_BASE_URL}/api/users`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        user_id: userId,
        password,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.detail ||
        "Unable to create account"
    );
  }

  return data;
}