from pydantic import BaseModel
from fastapi import HTTPException
from database import (
    get_connection,
    verify_password,
    hash_password,
)
from database import initialize_database
from fastapi import (
    FastAPI,
    HTTPException,
    Query,
)

from fastapi.middleware.cors import (
    CORSMiddleware,
)

from model_service import (
    generate_forecast,
    get_dashboard_data,
    get_forecast_summary,
    get_historical_sales,
    get_model_metrics,
)


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="DemandIQ API",
    description=(
        "Sales Demand Forecasting "
        "Backend API"
    ),
    version="1.0.0",
)

initialize_database()

class LoginRequest(BaseModel):
    user_id: str
    password: str
class CreateUserRequest(BaseModel):
    user_id: str
    name: str
    password: str    
@app.post("/api/users")
def create_user(request: CreateUserRequest):
    user_id = request.user_id.strip()
    name = request.name.strip()
    password = request.password

    if not user_id:
        raise HTTPException(
            status_code=400,
            detail="User ID is required",
        )

    if not name:
        raise HTTPException(
            status_code=400,
            detail="Name is required",
        )

    if len(password) < 6:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 6 characters",
        )

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE user_id = ?
        """,
        (user_id,),
    )

    existing_user = cursor.fetchone()

    if existing_user is not None:
        connection.close()

        raise HTTPException(
            status_code=400,
            detail="User ID already exists",
        )

    email = (
        f"{user_id.lower()}"
        "@demandiq.local"
    )

    cursor.execute(
    """
    INSERT INTO users (
        user_id,
        name,
        email,
        role,
        status,
        password_hash,
        created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    """,
    (
        user_id,
        name,
        email,
        "User",
        "Active",
        hash_password(password),
    ),
)

    connection.commit()
    connection.close()

    return {
        "status": "success",
        "message": "Account created successfully",
        "user": {
            "user_id": user_id,
            "name": name,
            "role": "User",
            "status": "Active",
        },
    }

@app.post("/api/login")
def login(request: LoginRequest):
    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE user_id = ?
        """,
        (request.user_id,),
    )

    user = cursor.fetchone()
    connection.close()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid user ID or password",
        )

    if user["status"] != "Active":
        raise HTTPException(
            status_code=403,
            detail="User account is inactive",
        )

    if not verify_password(
        request.password,
        user["password_hash"],
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid user ID or password",
        )

    return {
        "status": "success",
        "user": {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "status": user["status"],
        },
    }


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "application":
            "DemandIQ",

        "service":
            "Sales Demand "
            "Forecasting API",

        "status":
            "running",

        "version":
            "1.0.0",
    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/api/health")
def health():
    return {
        "status":
            "healthy",

        "model_loaded":
            True,

        "forecast_engine":
            "active",
    }


# ============================================================
# MODEL METRICS
# ============================================================

@app.get(
    "/api/model/metrics"
)
def model_metrics():
    return (
        get_model_metrics()
    )


# ============================================================
# HISTORICAL SALES
# ============================================================

@app.get(
    "/api/historical"
)
def historical_sales(
    days: int = Query(
        default=120,
        ge=1,
        le=1684,
    )
):
    return {
        "days":
            days,

        "data":
            get_historical_sales(
                days
            ),
    }


# ============================================================
# FORECAST
# ============================================================

@app.get(
    "/api/forecast"
)
def forecast(
    horizon: int = Query(
        default=30
    ),

    promotion: float | None = None,

    transactions: float | None = None,

    oil_price: float | None = None,
):
    try:
        forecast_data = (
            generate_forecast(
                horizon=horizon,
                promotion=promotion,
                transactions=transactions,
                oil_price=oil_price,
            )
        )

        summary = (
            get_forecast_summary(
                forecast_data
            )
        )

        return {
            "status":
                "success",

            "horizon":
                horizon,

            "summary":
                summary,

            "forecast":
                forecast_data,
        }

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )


# ============================================================
# COMPLETE DASHBOARD DATA
# ============================================================

@app.get(
    "/api/dashboard"
)
def dashboard(
    horizon: int = Query(
        default=30
    )
):
    try:
        return (
            get_dashboard_data(
                horizon=horizon
            )
        )

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )
        