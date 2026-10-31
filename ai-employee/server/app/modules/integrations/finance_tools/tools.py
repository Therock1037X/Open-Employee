from typing import Dict, Any

class FinanceTools:
    """
    Indian GST calculation & retail finance helper:
    Computes CGST, SGST, IGST, and invoice totals.
    """

    GST_SLABS = {
        "food_grains": 0.0,
        "sugar": 0.05,
        "cooking_oil": 0.05,
        "packaged_snacks": 0.12,
        "soaps_cleaning": 0.18,
        "electronics": 0.18,
    }

    @classmethod
    def calculate_tax(cls, item_category: str, taxable_value: float, is_interstate: bool = False) -> Dict[str, Any]:
        rate = cls.GST_SLABS.get(item_category.lower(), 0.05)
        total_tax = round(taxable_value * rate, 2)

        if is_interstate:
            igst = total_tax
            cgst = 0.0
            sgst = 0.0
        else:
            igst = 0.0
            cgst = round(total_tax / 2, 2)
            sgst = round(total_tax / 2, 2)

        return {
            "category": item_category,
            "taxable_value": taxable_value,
            "gst_rate": f"{int(rate * 100)}%",
            "cgst": cgst,
            "sgst": sgst,
            "igst": igst,
            "total_tax": total_tax,
            "invoice_total": round(taxable_value + total_tax, 2),
        }

finance_tools = FinanceTools()
