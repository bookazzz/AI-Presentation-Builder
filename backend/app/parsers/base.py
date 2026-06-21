"""Base parser interface."""
from abc import ABC, abstractmethod


class BaseParser(ABC):
    @abstractmethod
    def parse(self, file_path: str) -> dict:
        """Parse a file and return extracted data."""
        pass
