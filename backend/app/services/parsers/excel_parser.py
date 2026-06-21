"""Excel (.xlsx, .csv) parser with auto-analytics.

Reads sheets, detects headers/types, calculates metrics,
identifies trends, anomalies, and generates insights.
"""
import os
import re
from datetime import datetime
from typing import List, Optional, Tuple

import pandas as pd
import numpy as np

from .base import BaseParser, ParseResult


class ExcelParser(BaseParser):
    supported_extensions = ["xlsx", "xls", "csv"]

    MAX_SHEETS = 10
    MAX_ROWS = 20_000

    def parse(self, file_path: str, original_name: str) -> ParseResult:
        ext = original_name.rsplit(".", 1)[-1].lower() if "." in original_name else ""
        title = os.path.splitext(original_name)[0]

        if ext == "csv":
            return self._parse_csv(file_path, title)
        return self._parse_excel(file_path, title)

    # ──────────────────────────────────────────────
    # CSV parser
    # ──────────────────────────────────────────────

    def _parse_csv(self, file_path: str, title: str) -> ParseResult:
        try:
            df = pd.read_csv(file_path, encoding_errors="replace")
        except Exception:
            df = pd.read_csv(file_path, encoding="latin1", encoding_errors="replace")

        if df.empty:
            return ParseResult(
                content_type="excel",
                raw_text="",
                title=title,
                errors=["CSV file is empty"],
            )

        sheet_data = self._analyze_dataframe(df, "Sheet1")
        insights = self._generate_insights(df, sheet_data)

        return ParseResult(
            content_type="excel",
            raw_text=self._dataframe_to_text(df),
            title=title,
            sheets=[sheet_data],
            charts=insights.get("charts", []),
            insights=insights.get("texts", []),
        )

    # ──────────────────────────────────────────────
    # Excel parser
    # ──────────────────────────────────────────────

    def _parse_excel(self, file_path: str, title: str) -> ParseResult:
        xl = pd.ExcelFile(file_path, engine="openpyxl")
        sheet_names = xl.sheet_names[: self.MAX_SHEETS]

        all_text_parts = []
        sheets_data = []
        all_insights = []
        all_charts = []

        for sheet_name in sheet_names:
            df = xl.parse(sheet_name)
            if df.empty:
                continue

            sheet_data = self._analyze_dataframe(df, sheet_name)
            sheets_data.append(sheet_data)
            all_text_parts.append(self._dataframe_to_text(df, sheet_name))

            insights = self._generate_insights(df, sheet_data)
            all_insights.extend(insights.get("texts", []))
            all_charts.extend(insights.get("charts", []))

        return ParseResult(
            content_type="excel",
            raw_text="\n\n".join(all_text_parts),
            title=title,
            sheets=sheets_data,
            charts=all_charts,
            insights=all_insights,
        )

    # ──────────────────────────────────────────────
    # DataFrame analysis
    # ──────────────────────────────────────────────

    def _analyze_dataframe(self, df: pd.DataFrame, sheet_name: str) -> dict:
        """Analyze a single dataframe and return structured metadata."""
        # Truncate rows
        if len(df) > self.MAX_ROWS:
            df = df.head(self.MAX_ROWS)

        headers = list(df.columns)
        numeric_cols = []
        date_cols = []
        categorical_cols = []
        text_cols = []

        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                numeric_cols.append(str(col))
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                date_cols.append(str(col))
            elif df[col].nunique() < len(df) * 0.3 and df[col].nunique() > 1:
                categorical_cols.append(str(col))
            else:
                text_cols.append(str(col))

        # Convert date-like string columns
        for col in df.select_dtypes(include=["object"]).columns:
            try:
                parsed = pd.to_datetime(df[col], errors="coerce")
                if parsed.notna().sum() > len(df) * 0.5:
                    date_cols.append(str(col))
                    if col in numeric_cols:
                        numeric_cols.remove(col)
                    if col in categorical_cols:
                        categorical_cols.remove(col)
                    if col in text_cols:
                        text_cols.remove(col)
            except Exception:
                pass

        # Numeric summary
        num_summary = {}
        for col in numeric_cols:
            series = df[col].dropna()
            if len(series) == 0:
                continue
            num_summary[col] = {
                "min": float(series.min()),
                "max": float(series.max()),
                "mean": float(series.mean()),
                "sum": float(series.sum()),
                "count": int(len(series)),
            }

        return {
            "name": sheet_name,
            "rows": len(df),
            "cols": len(headers),
            "headers": headers[:20],  # limit
            "numeric_cols": numeric_cols[:15],
            "date_cols": date_cols[:10],
            "categorical_cols": categorical_cols[:15],
            "text_cols": text_cols[:10],
            "numeric_summary": num_summary,
        }

    # ──────────────────────────────────────────────
    # Insights generator
    # ──────────────────────────────────────────────

    def _generate_insights(self, df: pd.DataFrame, sheet_data: dict) -> dict:
        """Generate automatic insights and chart suggestions."""
        texts: List[str] = []
        charts: List[dict] = []
        numeric_cols = sheet_data.get("numeric_cols", [])
        date_cols = sheet_data.get("date_cols", [])
        categorical_cols = sheet_data.get("categorical_cols", [])

        if not numeric_cols:
            return {"texts": texts, "charts": charts}

        # ── Trend over time ──
        if date_cols and numeric_cols:
            date_col = date_cols[0]
            num_col = numeric_cols[0]
            try:
                trend_df = df[[date_col, num_col]].dropna().copy()
                trend_df[date_col] = pd.to_datetime(trend_df[date_col], errors="coerce")
                trend_df = trend_df.sort_values(date_col)
                if len(trend_df) >= 2:
                    first_val = trend_df[num_col].iloc[0]
                    last_val = trend_df[num_col].iloc[-1]
                    change = ((last_val - first_val) / first_val * 100) if first_val != 0 else 0
                    if abs(change) > 1:
                        direction = "рост" if change > 0 else "падение"
                        texts.append(
                            f"Динамика {num_col}: {direction} на {abs(change):.1f}% "
                            f"(с {first_val:.1f} до {last_val:.1f})"
                        )

                    # Best / worst period
                    max_row = trend_df.loc[trend_df[num_col].idxmax()]
                    min_row = trend_df.loc[trend_df[num_col].idxmin()]
                    texts.append(
                        f"Максимум {num_col}: {max_row[num_col]:.1f} ({max_row[date_col].strftime('%d.%m.%Y')})"
                    )
                    texts.append(
                        f"Минимум {num_col}: {min_row[num_col]:.1f} ({min_row[date_col].strftime('%d.%m.%Y')})"
                    )

                    # Chart
                    labels = trend_df[date_col].dt.strftime("%d.%m").tolist()[:30]
                    values = trend_df[num_col].tolist()[:30]
                    charts.append({
                        "type": "line",
                        "title": f"Динамика {num_col}",
                        "labels": labels,
                        "values": values,
                        "sheet": sheet_data["name"],
                        "x": date_col,
                        "y": num_col,
                    })
            except Exception:
                pass

        # ── Category breakdown ──
        if categorical_cols and numeric_cols:
            for cat_col in categorical_cols[:2]:
                num_col = numeric_cols[0]
                try:
                    grouped = df.groupby(cat_col)[num_col].sum().sort_values(ascending=False)
                    if len(grouped) >= 2:
                        top = grouped.index[0]
                        top_val = grouped.iloc[0]
                        total = grouped.sum()
                        share = top_val / total * 100 if total > 0 else 0
                        texts.append(
                            f"Лидер по {num_col}: «{top}» — {top_val:.1f} ({share:.1f}% от общего объёма)"
                        )

                        # Top-N chart
                        top_n = grouped.head(10)
                        charts.append({
                            "type": "bar",
                            "title": f"Топ-{len(top_n)}: {cat_col} по {num_col}",
                            "labels": [str(k) for k in top_n.index.tolist()],
                            "values": [float(v) for v in top_n.values.tolist()],
                            "sheet": sheet_data["name"],
                            "x": cat_col,
                            "y": num_col,
                        })

                        # Pie for small categories
                        if len(grouped) <= 6:
                            charts.append({
                                "type": "pie",
                                "title": f"Доля по {cat_col}",
                                "labels": [str(k) for k in grouped.index.tolist()],
                                "values": [float(v) for v in grouped.values.tolist()],
                                "sheet": sheet_data["name"],
                            })
                except Exception:
                    pass

        # ── Summary stats ──
        for col in numeric_cols[:3]:
            summary = sheet_data.get("numeric_summary", {}).get(col, {})
            if summary:
                texts.append(
                    f"{col}: среднее {summary['mean']:.1f}, "
                    f"сумма {summary['sum']:.1f}, "
                    f"минимум {summary['min']:.1f}, максимум {summary['max']:.1f}"
                )

                # KPI table
                charts.append({
                    "type": "kpi_table",
                    "title": f"Ключевые показатели: {col}",
                    "data": {
                        "min": round(summary["min"], 2),
                        "max": round(summary["max"], 2),
                        "avg": round(summary["mean"], 2),
                        "sum": round(summary["sum"], 2),
                        "count": summary["count"],
                    },
                    "sheet": sheet_data["name"],
                })

        # ── Anomaly detection ──
        for col in numeric_cols[:2]:
            try:
                series = df[col].dropna()
                if len(series) >= 5:
                    mean = series.mean()
                    std = series.std()
                    if std > 0:
                        anomalies = series[(series - mean).abs() > 2 * std]
                        if len(anomalies) > 0:
                            texts.append(
                                f"Обнаружено {len(anomalies)} аномальных значений по «{col}» "
                                f"(выход за 2σ от среднего {mean:.1f})"
                            )
            except Exception:
                pass

        return {"texts": texts, "charts": charts}

    # ──────────────────────────────────────────────
    # Helpers
    # ──────────────────────────────────────────────

    def _dataframe_to_text(self, df: pd.DataFrame, sheet_name: Optional[str] = None) -> str:
        """Convert dataframe to readable text representation."""
        parts = []
        if sheet_name:
            parts.append(f"[Лист: {sheet_name}]")

        parts.append(f"Столбцы: {', '.join(str(c) for c in df.columns)}")
        parts.append(f"Строк: {len(df)}")
        parts.append("")
        parts.append(df.to_string(index=False, max_rows=50))
        return "\n".join(parts)
