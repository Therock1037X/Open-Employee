"""Business module for Open Employee.
Handles Sales, Stock/Inventory, Finance Ledger, and Razorpay UPI Payments.
"""

from app.modules.business.service import BusinessService, business_service

__all__ = ["BusinessService", "business_service"]
