"""Excel/CSV file parser with auto-analysis."""
import logging
import json
from .base import BaseParser

logger = logging.getLogger(__name__)


class ExcelParser(BaseParser):
    def parse(self, file_path: str) -> dict:
        import pandas as pd
        import numpy as np

        ext = file_path.rsplit(".", 1)[-1].lower()
        if ext == "csv":
            dfs = {"Sheet1": pd.read_csv(file_path)}
        else:
            dfs = pd.read_excel(file_path, sheet_name=None)

        sheets_info = {}
        all_text_parts = []

        for sheet_name, df in dfs.items():
            df = df.dropna(how="all").fillna("")
            info = {
                "name": sheet_name,
                "rows": len(df),
                "cols": len(df.columns),
                "columns": list(df.columns),
                "preview": df.head(5).to_dict(orient="records"),
                "analysis": self._analyze_dataframe(df),
            }
            sheets_info[sheet_name] = info
            all_text_parts.append(f"=== Sheet: {sheet_name} ===")
            all_text_parts.append(df.to_string(index=False))

        text = "\n".join(all_text_parts)

        return {"text": text, "sheets": sheets_info}

    def _analyze_dataframe(self, df) -> dict:
        analysis = {}
        for col in df.columns:
            col_data = df[col]
            try:
                numeric = pd.to_numeric(col_data, errors="coerce")
                valid_numeric = numeric.dropna()
                if len(valid_numeric) > 2:
                    analysis[col] = {
                        "type": "numeric",
                        "min": float(valid_numeric.min()),
                        "max": float(valid_numeric.max()),
                        "mean": float(valid_numeric.mean()),
                        "sum": float(valid_numeric.sum()),
                        "trend": "up" if valid_numeric.iloc[-1] > valid_numeric.iloc[0] else "down",
                    }
                else:
                    analysis[col] = {"type": "text"}
            except (ValueError, TypeError):
                analysis[col] = {"type": "text"}
        return analysis
