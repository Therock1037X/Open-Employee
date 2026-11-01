from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator, ConfigDict

class BusinessEntrySchema(BaseModel):
    """
    Strict JSON output schema for parsed Indian business commands.
    Used for QLoRA fine-tuning target and runtime inference validation.
    """
    model_config = ConfigDict(extra="forbid")

    intent: Literal["sale", "purchase", "stock_check", "expense", "file_gst", "other"] = Field(
        description="The primary business intent of the entry"
    )
    product: Optional[str] = Field(
        default=None,
        description="Standardized name of the product/commodity (e.g. Sugar, Rice, Atta, Mustard Oil)"
    )
    quantity: Optional[float] = Field(
        default=None,
        description="Numerical quantity involved in transaction"
    )
    unit: Optional[str] = Field(
        default=None,
        description="Unit of measurement (kg, litre, packet, piece, tin, bag, etc.)"
    )
    amount: Optional[float] = Field(
        default=None,
        description="Total monetary value/price in INR"
    )
    customer: Optional[str] = Field(
        default=None,
        description="Name of the customer or supplier involved in the transaction"
    )
    language: Optional[str] = Field(
        default="hi",
        description="Detected source language (hi, mr, hinglish, en)"
    )

    @field_validator("quantity", "amount", mode="before")
    @classmethod
    def parse_numeric(cls, v):
        if v is None or v == "":
            return None
        if isinstance(v, (int, float)):
            return float(v)
        try:
            return float(str(v).replace(",", "").strip())
        except ValueError:
            return None

    @field_validator("product", "customer", mode="before")
    @classmethod
    def clean_strings(cls, v):
        if v is None:
            return None
        v_str = str(v).strip()
        return v_str if v_str and v_str.lower() != "none" and v_str.lower() != "null" else None
