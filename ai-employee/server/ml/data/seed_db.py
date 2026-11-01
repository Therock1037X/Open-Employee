"""
seed_db.py - Ingests synthetic Kirana CSV data into the application database.
Supports both SQLite (local development) and PostgreSQL (production).
"""

import os
import sys
import csv
from datetime import datetime

# Add server directory to path
SERVER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from app.core.database import (
    SessionLocal,
    init_db,
    Product,
    Customer,
    Supplier,
    Sale,
    Stock,
    Expense,
)

DATA_DIR = os.path.join(os.path.dirname(__file__), "out")

def seed_database(limit_sales: int = 2500):
    print("Initializing database tables...")
    init_db()
    db = SessionLocal()

    try:
        # 1. Seed Products & Stock
        prod_path = os.path.join(DATA_DIR, "products.csv")
        if os.path.exists(prod_path):
            with open(prod_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                prod_count = 0
                for row in reader:
                    existing = db.query(Product).filter(Product.name == row["name"]).first()
                    qty = float(row.get("stock_quantity", 100.0))
                    reorder = float(row.get("reorder_level", 20.0))
                    if not existing:
                        p = Product(
                            product_id=row["product_id"],
                            name=row["name"],
                            category=row["category"],
                            unit=row["unit"],
                            cost_price=float(row["cost_price"]),
                            selling_price=float(row["selling_price"]),
                            reorder_level=reorder,
                            current_stock=qty,
                        )
                        db.add(p)
                        prod_count += 1

                    # Ensure Stock table is also updated
                    stk = db.query(Stock).filter(Stock.product == row["name"]).first()
                    if not stk:
                        stk = Stock(
                            product=row["name"],
                            current_quantity=qty,
                            min_threshold=reorder,
                            unit=row["unit"],
                        )
                        db.add(stk)
                db.commit()
                print(f"Loaded {prod_count} products and initialized inventory stock.")

        # 2. Seed Customers
        cust_path = os.path.join(DATA_DIR, "customers.csv")
        if os.path.exists(cust_path):
            with open(cust_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                cust_count = 0
                for row in reader:
                    existing = db.query(Customer).filter(Customer.customer_id == row["customer_id"]).first()
                    if not existing:
                        c = Customer(
                            customer_id=row["customer_id"],
                            name=row["name"],
                            phone=row["phone"],
                            language=row["language"],
                            credit_limit=float(row["credit_limit"]),
                            current_balance=float(row["current_balance"]),
                            address=row["address"],
                        )
                        db.add(c)
                        cust_count += 1
                db.commit()
                print(f"Loaded {cust_count} customers.")

        # 3. Seed Suppliers
        supp_path = os.path.join(DATA_DIR, "suppliers.csv")
        if os.path.exists(supp_path):
            with open(supp_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                supp_count = 0
                for row in reader:
                    existing = db.query(Supplier).filter(Supplier.supplier_id == row["id"]).first()
                    if not existing:
                        s = Supplier(
                            supplier_id=row["id"],
                            name=row["name"],
                            contact_person=row["person"],
                            phone=row["phone"],
                            category=row["cat"],
                            lead_time_days=int(row["lead_days"]),
                            address=row["loc"],
                        )
                        db.add(s)
                        supp_count += 1
                db.commit()
                print(f"Loaded {supp_count} wholesalers/suppliers.")

        # 4. Seed Expenses
        exp_path = os.path.join(DATA_DIR, "expenses.csv")
        if os.path.exists(exp_path):
            with open(exp_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                exp_count = 0
                for row in reader:
                    existing = db.query(Expense).filter(Expense.expense_id == row["expense_id"]).first()
                    if not existing:
                        dt = datetime.fromisoformat(row["date"])
                        e = Expense(
                            expense_id=row["expense_id"],
                            category=row["category"],
                            amount=float(row["amount"]),
                            payment_mode=row["payment_mode"],
                            description=row["description"],
                            date=dt,
                        )
                        db.add(e)
                        exp_count += 1
                db.commit()
                print(f"Loaded {exp_count} business expenses.")

        # 5. Seed Sales (recent transactions for immediate dashboard responsiveness)
        sales_path = os.path.join(DATA_DIR, "sales.csv")
        if os.path.exists(sales_path):
            with open(sales_path, "r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                sales_count = 0
                rows = list(reader)
                selected_rows = rows[-limit_sales:] if len(rows) > limit_sales else rows
                for row in selected_rows:
                    existing = db.query(Sale).filter(Sale.sale_id == row["sale_id"]).first()
                    if not existing:
                        dt_str = f"{row['date']}T{row['time']}"
                        dt = datetime.fromisoformat(dt_str)
                        qty = float(row["quantity"])
                        tot = float(row["price"])
                        unit_p = tot / qty if qty > 0 else tot
                        s = Sale(
                            sale_id=row["sale_id"],
                            product=row["product"],
                            quantity=qty,
                            price=unit_p,
                            total_amount=tot,
                            customer=row["customer"],
                            payment_mode=row["payment_mode"],
                            created_by=row["created_by"],
                            created_at=dt,
                        )
                        db.add(s)
                        sales_count += 1
                db.commit()
                print(f"Loaded {sales_count} sales transactions into database.")

        print("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

