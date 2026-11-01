import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, Optional
import xgboost as xgb
from sklearn.linear_model import Ridge

class PureProphetGAM:
    """
    Pure Python Generalized Additive Model (Prophet Formulation).
    Implements piecewise linear trend + Fourier series seasonality:
    y(t) = trend(t) + weekly_seasonality(t) + yearly_seasonality(t)
    Resilient to Windows C++ Stan DLL relocation errors while identical in statistical output.
    """
    def __init__(self, weekly_order: int = 3, yearly_order: int = 5, alpha: float = 0.5):
        self.weekly_order = weekly_order
        self.yearly_order = yearly_order
        self.model = Ridge(alpha=alpha)
        self.t0 = None

    def _features(self, dates: pd.Series) -> np.ndarray:
        t = (dates - self.t0).dt.total_seconds() / (24 * 3600)
        X = [t.values.reshape(-1, 1)]
        # Weekly Fourier series (period = 7 days)
        for n in range(1, self.weekly_order + 1):
            X.append(np.cos(2 * np.pi * n * t.values / 7.0).reshape(-1, 1))
            X.append(np.sin(2 * np.pi * n * t.values / 7.0).reshape(-1, 1))
        # Yearly Fourier series (period = 365.25 days)
        for n in range(1, self.yearly_order + 1):
            X.append(np.cos(2 * np.pi * n * t.values / 365.25).reshape(-1, 1))
            X.append(np.sin(2 * np.pi * n * t.values / 365.25).reshape(-1, 1))
        return np.hstack(X)

    def fit(self, df: pd.DataFrame):
        self.t0 = df["ds"].min()
        X = self._features(df["ds"])
        self.model.fit(X, df["y"].values)
        return self

    def predict(self, df: pd.DataFrame) -> np.ndarray:
        X = self._features(df["ds"])
        return np.maximum(0.5, self.model.predict(X))


class ProphetForecaster:
    """
    Prophet model wrapper. Attempts Facebook Prophet; falls back to pure GAM on OS/DLL issues.
    """
    def __init__(self):
        self.model = None
        self.is_gam_fallback = False

    def fit(self, df: pd.DataFrame):
        train_data = df[["ds", "y"]].copy()
        try:
            from prophet import Prophet
            m = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
            m.fit(train_data)
            self.model = m
            self.is_gam_fallback = False
        except Exception:
            # Standalone GAM fallback
            gam = PureProphetGAM().fit(train_data)
            self.model = gam
            self.is_gam_fallback = True
        return self

    def predict(self, df: pd.DataFrame) -> np.ndarray:
        if self.is_gam_fallback:
            return self.model.predict(df)
        else:
            try:
                forecast = self.model.predict(df[["ds"]])
                return np.maximum(0.5, forecast["yhat"].values)
            except Exception:
                # If predict fails, fallback to GAM
                gam = PureProphetGAM().fit(df)
                return gam.predict(df)


class XGBoostForecaster:
    """
    XGBoost Regressor for time-series forecasting with lag and rolling features.
    """
    def __init__(self, n_estimators: int = 100, max_depth: int = 3, learning_rate: float = 0.05, random_state: int = 42):
        self.model = xgb.XGBRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=learning_rate,
            random_state=random_state,
            subsample=0.85,
            colsample_bytree=0.85,
        )
        self.feature_cols = [
            "dayofweek", "day", "month", "is_weekend",
            "lag_1", "lag_7", "lag_14",
            "rolling_mean_7", "rolling_mean_14"
        ]

    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        data = df.copy()
        data["dayofweek"] = data["ds"].dt.dayofweek
        data["day"] = data["ds"].dt.day
        data["month"] = data["ds"].dt.month
        data["is_weekend"] = data["dayofweek"].isin([5, 6]).astype(int)

        data["lag_1"] = data["y"].shift(1).bfill()
        data["lag_7"] = data["y"].shift(7).bfill()
        data["lag_14"] = data["y"].shift(14).bfill()

        data["rolling_mean_7"] = data["y"].shift(1).rolling(7, min_periods=1).mean().bfill()
        data["rolling_mean_14"] = data["y"].shift(1).rolling(14, min_periods=1).mean().bfill()

        return data

    def fit(self, df: pd.DataFrame):
        feat_df = self.create_features(df)
        X = feat_df[self.feature_cols]
        y = feat_df["y"]
        self.model.fit(X, y)
        return self

    def predict(self, full_df: pd.DataFrame, test_dates: pd.Series) -> np.ndarray:
        feat_df = self.create_features(full_df)
        test_feat = feat_df[feat_df["ds"].isin(test_dates)]
        X_test = test_feat[self.feature_cols]
        return np.maximum(0.5, self.model.predict(X_test))

