"""
generate_synthetic.py - High-fidelity synthetic dataset generator for Open Employee kirana store.
Kirana location: Nagpur, Maharashtra, India.
Period: 1 Nov 2025 to 31 Oct 2026 (365 days).
Fixed seed: 42 for 100% deterministic reproducibility.
"""

import os
import csv
import json
import random
import math
from datetime import datetime, date, timedelta, time

# Set fixed seed
SEED = 42
random.seed(SEED)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "out")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. 60 Kirana Products
# ---------------------------------------------------------------------------
PRODUCTS_CATALOG = [
    # Staples & Grains
    {"name": "Sugar (चीनी)", "cat": "Staples", "unit": "kg", "cost": 38.0, "price": 44.0, "reorder": 50.0, "init_stock": 250.0},
    {"name": "Wheat Flour (गेहूं का आटा)", "cat": "Staples", "unit": "kg", "cost": 30.0, "price": 38.0, "reorder": 60.0, "init_stock": 300.0},
    {"name": "Basmati Rice (बासमती चावल)", "cat": "Staples", "unit": "kg", "cost": 75.0, "price": 95.0, "reorder": 30.0, "init_stock": 150.0},
    {"name": "Kolam Rice (कोलम तांदूळ)", "cat": "Staples", "unit": "kg", "cost": 48.0, "price": 58.0, "reorder": 40.0, "init_stock": 200.0},
    {"name": "Toor Dal (तुवर डाळ / अरहर दाल)", "cat": "Pulses", "unit": "kg", "cost": 135.0, "price": 160.0, "reorder": 30.0, "init_stock": 140.0},
    {"name": "Moong Dal (मूंग दाल)", "cat": "Pulses", "unit": "kg", "cost": 105.0, "price": 125.0, "reorder": 20.0, "init_stock": 100.0},
    {"name": "Chana Dal (चना दाल)", "cat": "Pulses", "unit": "kg", "cost": 78.0, "price": 94.0, "reorder": 25.0, "init_stock": 120.0},
    {"name": "Urad Dal (उड़द दाल)", "cat": "Pulses", "unit": "kg", "cost": 110.0, "price": 130.0, "reorder": 20.0, "init_stock": 90.0},
    {"name": "Poha (पोहा / जाड पोहे)", "cat": "Staples", "unit": "kg", "cost": 42.0, "price": 52.0, "reorder": 25.0, "init_stock": 120.0},
    {"name": "Besan (बेसन)", "cat": "Staples", "unit": "kg", "cost": 82.0, "price": 98.0, "reorder": 20.0, "init_stock": 110.0},
    {"name": "Maida (मैदा)", "cat": "Staples", "unit": "kg", "cost": 36.0, "price": 45.0, "reorder": 20.0, "init_stock": 100.0},
    {"name": "Sooji / Rava (रवा / सूजी)", "cat": "Staples", "unit": "kg", "cost": 40.0, "price": 50.0, "reorder": 20.0, "init_stock": 100.0},
    {"name": "Jaggery / Gud (गुड़ / गूळ)", "cat": "Staples", "unit": "kg", "cost": 50.0, "price": 65.0, "reorder": 25.0, "init_stock": 120.0},
    {"name": "Tata Salt (टाटा मीठ / नमक)", "cat": "Staples", "unit": "packet", "cost": 22.0, "price": 28.0, "reorder": 40.0, "init_stock": 180.0},

    # Oils & Ghee
    {"name": "Mustard Oil (सरसों तेल)", "cat": "Oils", "unit": "litre", "cost": 130.0, "price": 155.0, "reorder": 25.0, "init_stock": 130.0},
    {"name": "Refined Sunflower Oil (रिफाइंड तेल)", "cat": "Oils", "unit": "litre", "cost": 125.0, "price": 145.0, "reorder": 30.0, "init_stock": 160.0},
    {"name": "Soyabean Oil (सोयाबीन तेल)", "cat": "Oils", "unit": "litre", "cost": 115.0, "price": 135.0, "reorder": 30.0, "init_stock": 150.0},
    {"name": "Groundnut Oil (शेंगदाणा तेल)", "cat": "Oils", "unit": "litre", "cost": 160.0, "price": 185.0, "reorder": 20.0, "init_stock": 90.0},
    {"name": "Amul Pure Ghee (तूप / घी)", "cat": "Dairy", "unit": "litre", "cost": 560.0, "price": 640.0, "reorder": 10.0, "init_stock": 50.0},
    {"name": "Gowardhan Ghee 500ml", "cat": "Dairy", "unit": "packet", "cost": 290.0, "price": 335.0, "reorder": 12.0, "init_stock": 60.0},

    # Dairy & Daily Fresh
    {"name": "Amul Taaza Milk 500ml", "cat": "Dairy", "unit": "packet", "cost": 26.0, "price": 28.0, "reorder": 30.0, "init_stock": 100.0},
    {"name": "Amul Gold Milk 500ml", "cat": "Dairy", "unit": "packet", "cost": 32.0, "price": 34.0, "reorder": 25.0, "init_stock": 80.0},
    {"name": "Amul Masti Dahi 400g", "cat": "Dairy", "unit": "cup", "cost": 32.0, "price": 35.0, "reorder": 15.0, "init_stock": 50.0},
    {"name": "Amul Butter 100g", "cat": "Dairy", "unit": "pack", "cost": 52.0, "price": 58.0, "reorder": 15.0, "init_stock": 60.0},
    {"name": "Paneer 200g Fresh", "cat": "Dairy", "unit": "pack", "cost": 80.0, "price": 95.0, "reorder": 10.0, "init_stock": 40.0},

    # Beverages & Spices
    {"name": "Tea Powder (चाय पत्ती)", "cat": "Beverages", "unit": "kg", "cost": 280.0, "price": 340.0, "reorder": 15.0, "init_stock": 80.0},
    {"name": "Wagh Bakri Tea 500g", "cat": "Beverages", "unit": "pack", "cost": 240.0, "price": 280.0, "reorder": 15.0, "init_stock": 70.0},
    {"name": "Bru Instant Coffee 50g", "cat": "Beverages", "unit": "jar", "cost": 135.0, "price": 160.0, "reorder": 10.0, "init_stock": 40.0},
    {"name": "Turmeric Powder / Haldi 200g", "cat": "Spices", "unit": "packet", "cost": 45.0, "price": 58.0, "reorder": 20.0, "init_stock": 90.0},
    {"name": "Red Chilli Powder / Mirchi 200g", "cat": "Spices", "unit": "packet", "cost": 65.0, "price": 82.0, "reorder": 20.0, "init_stock": 90.0},
    {"name": "Dhania Powder 200g", "cat": "Spices", "unit": "packet", "cost": 40.0, "price": 52.0, "reorder": 20.0, "init_stock": 80.0},
    {"name": "Everest Garam Masala 100g", "cat": "Spices", "unit": "box", "cost": 68.0, "price": 85.0, "reorder": 15.0, "init_stock": 60.0},
    {"name": "Jeera / Cumin Seeds 200g", "cat": "Spices", "unit": "packet", "cost": 110.0, "price": 140.0, "reorder": 15.0, "init_stock": 60.0},
    {"name": "Mustard Seeds / Rai 200g", "cat": "Spices", "unit": "packet", "cost": 30.0, "price": 40.0, "reorder": 15.0, "init_stock": 70.0},

    # Snacks & Biscuits
    {"name": "Parle-G Biscuit 80g", "cat": "Snacks", "unit": "packet", "cost": 8.5, "price": 10.0, "reorder": 50.0, "init_stock": 250.0},
    {"name": "Britannia Good Day 100g", "cat": "Snacks", "unit": "packet", "cost": 25.0, "price": 30.0, "reorder": 40.0, "init_stock": 180.0},
    {"name": "Marie Gold 200g", "cat": "Snacks", "unit": "packet", "cost": 30.0, "price": 35.0, "reorder": 30.0, "init_stock": 140.0},
    {"name": "Oreo Vanilla 120g", "cat": "Snacks", "unit": "packet", "cost": 32.0, "price": 40.0, "reorder": 20.0, "init_stock": 100.0},
    {"name": "Haldiram Aloo Bhujia 200g", "cat": "Snacks", "unit": "packet", "cost": 45.0, "price": 55.0, "reorder": 25.0, "init_stock": 120.0},
    {"name": "Haldiram Moong Dal 200g", "cat": "Snacks", "unit": "packet", "cost": 45.0, "price": 55.0, "reorder": 20.0, "init_stock": 100.0},
    {"name": "Maggi 2-Minute Noodles 70g", "cat": "Snacks", "unit": "packet", "cost": 12.0, "price": 14.0, "reorder": 60.0, "init_stock": 300.0},
    {"name": "Yippee Noodles 70g", "cat": "Snacks", "unit": "packet", "cost": 11.5, "price": 14.0, "reorder": 30.0, "init_stock": 150.0},

    # Cold Drinks & Summer Refreshers
    {"name": "Thums Up 750ml", "cat": "Beverages", "unit": "bottle", "cost": 35.0, "price": 40.0, "reorder": 25.0, "init_stock": 100.0},
    {"name": "Coca Cola 750ml", "cat": "Beverages", "unit": "bottle", "cost": 35.0, "price": 40.0, "reorder": 25.0, "init_stock": 100.0},
    {"name": "Sprite 750ml", "cat": "Beverages", "unit": "bottle", "cost": 35.0, "price": 40.0, "reorder": 25.0, "init_stock": 100.0},
    {"name": "Frooti Mango Drink 160ml", "cat": "Beverages", "unit": "tetrapack", "cost": 8.5, "price": 10.0, "reorder": 40.0, "init_stock": 160.0},
    {"name": "Maaza Mango 600ml", "cat": "Beverages", "unit": "bottle", "cost": 36.0, "price": 42.0, "reorder": 20.0, "init_stock": 90.0},
    {"name": "Kinley Mineral Water 1L", "cat": "Beverages", "unit": "bottle", "cost": 14.0, "price": 20.0, "reorder": 30.0, "init_stock": 120.0},

    # Personal Care & Toiletries
    {"name": "Lifebuoy Total Soap 125g", "cat": "Personal Care", "unit": "piece", "cost": 28.0, "price": 36.0, "reorder": 30.0, "init_stock": 140.0},
    {"name": "Dettol Original Soap 125g", "cat": "Personal Care", "unit": "piece", "cost": 36.0, "price": 45.0, "reorder": 25.0, "init_stock": 120.0},
    {"name": "Lux Rose Soap 100g", "cat": "Personal Care", "unit": "piece", "cost": 30.0, "price": 38.0, "reorder": 20.0, "init_stock": 100.0},
    {"name": "Colgate Strong Teeth 150g", "cat": "Personal Care", "unit": "tube", "cost": 88.0, "price": 105.0, "reorder": 20.0, "init_stock": 90.0},
    {"name": "Clinic Plus Shampoo 175ml", "cat": "Personal Care", "unit": "bottle", "cost": 110.0, "price": 130.0, "reorder": 15.0, "init_stock": 70.0},
    {"name": "Sunsilk Black Shine 180ml", "cat": "Personal Care", "unit": "bottle", "cost": 120.0, "price": 145.0, "reorder": 15.0, "init_stock": 65.0},
    {"name": "Parachute Coconut Oil 200ml", "cat": "Personal Care", "unit": "bottle", "cost": 80.0, "price": 98.0, "reorder": 20.0, "init_stock": 85.0},

    # Household & Cleaning
    {"name": "Surf Excel Easy Wash 1kg", "cat": "Cleaning", "unit": "packet", "cost": 120.0, "price": 145.0, "reorder": 25.0, "init_stock": 110.0},
    {"name": "Wheel Detergent Powder 1kg", "cat": "Cleaning", "unit": "packet", "cost": 62.0, "price": 75.0, "reorder": 30.0, "init_stock": 130.0},
    {"name": "Vim Dishwash Bar 135g", "cat": "Cleaning", "unit": "bar", "cost": 18.0, "price": 22.0, "reorder": 40.0, "init_stock": 160.0},
    {"name": "Harpiq Power Plus 500ml", "cat": "Cleaning", "unit": "bottle", "cost": 82.0, "price": 99.0, "reorder": 15.0, "init_stock": 75.0},
    {"name": "Cycle Brand Agarbatti 100 sticks", "cat": "Puja", "unit": "box", "cost": 45.0, "price": 60.0, "reorder": 20.0, "init_stock": 95.0},
    {"name": "Homelite Safety Matchbox Bundle", "cat": "Household", "unit": "pack", "cost": 16.0, "price": 20.0, "reorder": 30.0, "init_stock": 120.0},
]

# ---------------------------------------------------------------------------
# 2. 150 Nagpur Customers
# ---------------------------------------------------------------------------
FIRST_NAMES = [
    ("Ramesh", "m"), ("Suresh", "m"), ("Ganesh", "m"), ("Rajesh", "m"), ("Sachin", "m"),
    ("Santosh", "m"), ("Amit", "m"), ("Nitin", "m"), ("Sunil", "m"), ("Pravin", "m"),
    ("Anand", "m"), ("Vikas", "m"), ("Pradeep", "m"), ("Deepak", "m"), ("Vijay", "m"),
    ("Ashok", "m"), ("Manoj", "m"), ("Dinesh", "m"), ("Sanjay", "m"), ("Ajay", "m"),
    ("Rahul", "m"), ("Rohan", "m"), ("Kunal", "m"), ("Chetan", "m"), ("Mahesh", "m"),
    ("Sunita", "f"), ("Kavita", "f"), ("Anita", "f"), ("Rekha", "f"), ("Pooja", "f"),
    ("Sneha", "f"), ("Priya", "f"), ("Madhuri", "f"), ("Archana", "f"), ("Manisha", "f"),
    ("Swati", "f"), ("Shilpa", "f"), ("Neeta", "f"), ("Meena", "f"), ("Sangeeta", "f"),
    ("Jyoti", "f"), ("Deepali", "f"), ("Vaishali", "f"), ("Rashmi", "f"), ("Usha", "f"),
]

LAST_NAMES = [
    ("Patil", "mr"), ("Kulkarni", "mr"), ("Deshmukh", "mr"), ("Joshi", "mr"), ("Shinde", "mr"),
    ("Gaikwad", "mr"), ("Pawar", "mr"), ("Bhosale", "mr"), ("Chavan", "mr"), ("Wagh", "mr"),
    ("Sharma", "hi"), ("Gupta", "hi"), ("Verma", "hi"), ("Mishra", "hi"), ("Tiwari", "hi"),
    ("Yadav", "hi"), ("Singh", "hi"), ("Pandey", "hi"), ("Dubey", "hi"), ("Shukla", "hi"),
    ("Agrawal", "hi"), ("Chouksey", "hi"), ("Tembhekar", "mr"), ("Bawankar", "mr"), ("Thakur", "hi"),
    ("Mehta", "en"), ("Shah", "en"), ("Fernandes", "en"), ("D'Souza", "en"), ("Banerjee", "en"),
]

def generate_customers(n=150):
    customers = []
    used_names = set()
    for i in range(1, n + 1):
        fn, gender = random.choice(FIRST_NAMES)
        ln, lang_pref = random.choice(LAST_NAMES)
        name = f"{fn} {ln}"
        while name in used_names:
            fn, _ = random.choice(FIRST_NAMES)
            ln, lang_pref = random.choice(LAST_NAMES)
            name = f"{fn} {ln}"
        used_names.add(name)

        phone = f"9{random.randint(700000000, 999999999)}"
        # language mix: 50% Marathi, 40% Hindi, 10% English
        rand_lang = random.random()
        if rand_lang < 0.50:
            lang = "mr"
        elif rand_lang < 0.90:
            lang = "hi"
        else:
            lang = "en"

        credit_limit = random.choice([2000.0, 3000.0, 5000.0, 8000.0, 10000.0, 15000.0])
        customers.append({
            "customer_id": f"CUST-{i:03d}",
            "name": name,
            "phone": phone,
            "language": lang,
            "credit_limit": credit_limit,
            "current_balance": 0.0,
            "address": f"Plot {random.randint(12, 450)}, Wardha Road / Dharampeth, Nagpur",
        })
    return customers

# ---------------------------------------------------------------------------
# 3. 10 Nagpur Wholesalers / Suppliers
# ---------------------------------------------------------------------------
SUPPLIERS = [
    {"id": "SUP-001", "name": "Nagpur Central Grain Mart", "person": "Kishore Bhai Agrawal", "phone": "9823011223", "cat": "Staples & Grains", "lead_days": 2, "loc": "Itwari Market, Nagpur"},
    {"id": "SUP-002", "name": "Vidarbha Oil Mills & Traders", "person": "Sudhakar Deshmukh", "phone": "9823044556", "cat": "Oils & Ghee", "lead_days": 3, "loc": "Kalamna Market Yard, Nagpur"},
    {"id": "SUP-003", "name": "Amul Nagpur City Depot", "person": "Prashant Joshi", "phone": "9823077889", "cat": "Dairy Products", "lead_days": 1, "loc": "MIDC Hingna, Nagpur"},
    {"id": "SUP-004", "name": "Mahavir Tea & Spices Wholesaler", "person": "Bhanwarlal Jain", "phone": "9823099001", "cat": "Beverages & Spices", "lead_days": 2, "loc": "Gandhibagh, Nagpur"},
    {"id": "SUP-005", "name": "Haldiram Snack Distributors", "person": "Rajendra Shahu", "phone": "9823122334", "cat": "Snacks & Confectionery", "lead_days": 1, "loc": "Surya Nagar, Nagpur"},
    {"id": "SUP-006", "name": "Surya FMCG & Soap Supplies", "person": "Mahesh Chandak", "phone": "9823155667", "cat": "Personal Care & Cleaning", "lead_days": 3, "loc": "Ganjakhet, Itwari, Nagpur"},
    {"id": "SUP-007", "name": "Bhandara Rice Mills Agency", "person": "Satish Patil", "phone": "9823188990", "cat": "Rice & Pulses", "lead_days": 2, "loc": "Cotton Market, Nagpur"},
    {"id": "SUP-008", "name": "Coca-Cola & Beverage Depot", "person": "Sameer Khan", "phone": "9823211223", "cat": "Cold Drinks & Water", "lead_days": 1, "loc": "Kamptee Road, Nagpur"},
    {"id": "SUP-009", "name": "Parle & Britannia Agency", "person": "Virendra Kulkarni", "phone": "9823244556", "cat": "Biscuits & Bakery", "lead_days": 2, "loc": "Sitabuldi, Nagpur"},
    {"id": "SUP-010", "name": "Shri Ganesh General Provision", "person": "Gajanan Bhoyar", "phone": "9823277889", "cat": "Household & Puja Items", "lead_days": 2, "loc": "Mahal, Nagpur"},
]

# ---------------------------------------------------------------------------
# 4. Festival & Calendar Factors (1 Nov 2025 to 31 Oct 2026)
# ---------------------------------------------------------------------------
FESTIVALS = [
    # date, name, surge_multiplier, surge_categories
    (date(2025, 11, 8), date(2025, 11, 14), "Diwali", 3.2, ["Staples", "Dairy", "Beverages", "Snacks", "Puja"]),
    (date(2026, 1, 12), date(2026, 1, 15), "Makar Sankranti", 2.2, ["Staples"]),
    (date(2026, 3, 2), date(2026, 3, 5), "Holi", 2.4, ["Snacks", "Dairy", "Beverages", "Staples"]),
    (date(2026, 3, 20), date(2026, 3, 23), "Eid-ul-Fitr", 2.6, ["Dairy", "Oils", "Staples"]),
    (date(2026, 4, 13), date(2026, 4, 15), "Gudi Padwa", 2.0, ["Dairy", "Staples", "Puja"]),
    (date(2026, 8, 26), date(2026, 8, 29), "Raksha Bandhan", 2.3, ["Snacks", "Dairy"]),
    (date(2026, 9, 14), date(2026, 9, 24), "Ganesh Chaturthi", 3.5, ["Staples", "Dairy", "Puja", "Beverages"]),
    (date(2026, 10, 10), date(2026, 10, 20), "Navratri & Dussehra", 2.5, ["Staples", "Dairy", "Puja"]),
]

def get_day_modifiers(curr_date: date):
    # Base multiplier
    mult = 1.0
    festival_name = None
    surge_cats = []

    # Weekend effect: Saturday and Sunday
    if curr_date.weekday() in (5, 6):
        mult *= 1.35
    elif curr_date.weekday() == 4: # Friday evening slight uptick
        mult *= 1.10

    # Month-start salary cycle: 1st to 5th
    if 1 <= curr_date.day <= 5:
        mult *= 1.40

    # Festival surge check
    for start_f, end_f, fname, fsurge, fcats in FESTIVALS:
        if start_f <= curr_date <= end_f:
            mult *= fsurge
            festival_name = fname
            surge_cats = fcats
            break

    # Seasonality check:
    # Summer (March to June): Cold drinks & water surge, Dairy curd surge
    is_summer = 3 <= curr_date.month <= 6
    # Monsoon (July to September): Hot tea, spices, snacks surge
    is_monsoon = 7 <= curr_date.month <= 9

    # Slow upward trend over 365 days (5% organic customer growth)
    day_idx = (curr_date - date(2025, 11, 1)).days
    trend_factor = 1.0 + (0.05 * (day_idx / 365.0))
    mult *= trend_factor

    return mult, festival_name, surge_cats, is_summer, is_monsoon

# ---------------------------------------------------------------------------
# 5. Generate Simulation Data
# ---------------------------------------------------------------------------
def run_simulation():
    customers = generate_customers(150)
    customer_dict = {c["customer_id"]: c for c in customers}

    # Tracking states
    product_stocks = {p["name"]: p["init_stock"] for p in PRODUCTS_CATALOG}
    sales_rows = []
    stock_movements = []
    payments_rows = []
    expenses_rows = []
    marketing_rows = []

    start_date = date(2025, 11, 1)
    end_date = date(2026, 10, 31)
    total_days = (end_date - start_date).days + 1

    sale_seq = 1
    move_seq = 1
    pay_seq = 1
    exp_seq = 1
    mkt_seq = 1

    curr_date = start_date

    while curr_date <= end_date:
        mult, festival_name, surge_cats, is_summer, is_monsoon = get_day_modifiers(curr_date)

        # Base daily transaction target: 150-300 transactions/day adjusted by mult
        target_tx_count = int(random.uniform(150, 240) * (mult ** 0.65))
        # Keep realistic bounds: minimum 150, peak festival up to 380
        target_tx_count = max(150, min(380, target_tx_count))

        day_sales = []

        # Kirana opening hours: 07:00 AM to 10:00 PM (15 hours)
        for _ in range(target_tx_count):
            # Time of day distribution: peak morning (8-11am) & evening (5-9pm)
            hour_bucket = random.choices(
                population=[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21],
                weights=   [4, 12, 14, 10,  6,  4,  3,  2,  3,  5, 12, 16, 18, 14,  6],
                k=1
            )[0]
            tx_time = time(hour_bucket, random.randint(0, 59), random.randint(0, 59))

            # Select product based on festival & seasonal category weightings
            weights = []
            for p in PRODUCTS_CATALOG:
                w = 1.0
                if p["cat"] in surge_cats:
                    w *= 2.8
                if is_summer and (p["cat"] == "Beverages" or "Dahi" in p["name"] or "Water" in p["name"]):
                    w *= 2.5
                if is_monsoon and (p["name"].startswith("Tea") or p["cat"] == "Snacks"):
                    w *= 1.8
                weights.append(w)

            prod = random.choices(PRODUCTS_CATALOG, weights=weights, k=1)[0]
            prod_name = prod["name"]

            # Quantities purchased by walk-in households
            if prod["unit"] == "kg":
                qty = random.choice([0.5, 1.0, 1.0, 2.0, 2.0, 5.0, 10.0])
            elif prod["unit"] in ("litre", "packet", "piece", "bar", "bottle", "tube", "pack", "cup", "box"):
                qty = float(random.choice([1, 1, 1, 2, 2, 3, 4]))
            else:
                qty = 1.0

            # Price calculation
            unit_price = prod["price"]
            total_price = round(qty * unit_price, 2)

            # Customer selection: 70% registered repeat customer, 30% walk-in customer
            if random.random() < 0.70:
                cust = random.choice(customers)
                cust_name = cust["name"]
                cust_id = cust["customer_id"]
            else:
                cust_name = "Walk-in Customer"
                cust_id = None

            # Payment mode: 52% UPI (PhonePe/GPay), 33% Cash, 15% Kirana Udhaari (Credit)
            if cust_id:
                pay_mode = random.choices(["UPI", "Cash", "Credit"], weights=[50, 32, 18], k=1)[0]
            else:
                pay_mode = random.choices(["UPI", "Cash"], weights=[60, 40], k=1)[0]

            created_by = random.choices(["owner", "employee"], weights=[65, 35], k=1)[0]

            sale_id = f"SALE-{curr_date.strftime('%Y%m%d')}-{sale_seq:05d}"
            sale_seq += 1

            # Update running stock
            curr_stock = product_stocks.get(prod_name, 100.0)
            new_stock = max(0.0, curr_stock - qty)
            product_stocks[prod_name] = new_stock

            sales_rows.append({
                "sale_id": sale_id,
                "date": curr_date.isoformat(),
                "time": tx_time.strftime("%H:%M:%S"),
                "product": prod_name,
                "quantity": qty,
                "unit": prod["unit"],
                "price": total_price,
                "customer": cust_name,
                "payment_mode": pay_mode,
                "created_by": created_by,
            })

            # Stock movement for sale
            stock_movements.append({
                "movement_id": f"MOV-{move_seq:06d}",
                "date": curr_date.isoformat(),
                "time": tx_time.strftime("%H:%M:%S"),
                "product": prod_name,
                "movement_type": "sale",
                "quantity": -qty,
                "running_stock": round(new_stock, 2),
                "notes": f"Sale ref {sale_id}",
            })
            move_seq += 1

            # Record Payments table entry
            is_overdue = False
            if pay_mode == "Credit":
                # 8% of credit sales eventually flag as overdue
                if random.random() < 0.08:
                    is_overdue = True
                pmt_type = "credit_given"
            else:
                pmt_type = "payment_received"

            payments_rows.append({
                "payment_id": f"PAY-{pay_seq:06d}",
                "date": curr_date.isoformat(),
                "time": tx_time.strftime("%H:%M:%S"),
                "customer": cust_name,
                "amount": total_price,
                "payment_mode": pay_mode,
                "type": pmt_type,
                "is_overdue": "true" if is_overdue else "false",
                "reference_sale_id": sale_id,
            })
            pay_seq += 1

            # Check if stock dropped below reorder level -> automatic supplier restocking
            if new_stock <= prod["reorder"]:
                reorder_qty = round(prod["reorder"] * 3.5, 0)
                product_stocks[prod_name] = new_stock + reorder_qty
                stock_movements.append({
                    "movement_id": f"MOV-{move_seq:06d}",
                    "date": curr_date.isoformat(),
                    "time": "14:30:00",
                    "product": prod_name,
                    "movement_type": "purchase",
                    "quantity": reorder_qty,
                    "running_stock": round(product_stocks[prod_name], 2),
                    "notes": f"Restocked via Wholesaler auto-po",
                })
                move_seq += 1

        # Periodic Udhaari credit repayments (people clearing weekly or monthly tabs)
        repay_count = random.randint(3, 8)
        for _ in range(repay_count):
            repay_cust = random.choice(customers)
            repay_amount = round(random.choice([250.0, 500.0, 800.0, 1200.0, 2000.0]), 2)
            repay_mode = random.choice(["UPI", "Cash"])
            payments_rows.append({
                "payment_id": f"PAY-{pay_seq:06d}",
                "date": curr_date.isoformat(),
                "time": "19:15:00",
                "customer": repay_cust["name"],
                "amount": repay_amount,
                "payment_mode": repay_mode,
                "type": "credit_repaid",
                "is_overdue": "false",
                "reference_sale_id": "REPAY-CREDIT-LEDGER",
            })
            pay_seq += 1

        # -------------------------------------------------------------------
        # Expenses Simulation (Monthly rent, electricity, salaries, transport)
        # -------------------------------------------------------------------
        # Rent on 1st of every month
        if curr_date.day == 1:
            expenses_rows.append({
                "expense_id": f"EXP-{exp_seq:05d}",
                "date": curr_date.isoformat(),
                "category": "Rent",
                "amount": 22000.0,
                "payment_mode": "UPI / Bank Transfer",
                "description": f"Shop monthly rent for {curr_date.strftime('%B %Y')}",
            })
            exp_seq += 1

        # Electricity bill on 10th of every month
        if curr_date.day == 10:
            elec_amt = round(random.uniform(4800, 7200) * (1.3 if is_summer else 1.0), 2)
            expenses_rows.append({
                "expense_id": f"EXP-{exp_seq:05d}",
                "date": curr_date.isoformat(),
                "category": "Electricity",
                "amount": elec_amt,
                "payment_mode": "UPI",
                "description": f"MSEDCL Electricity Bill for {curr_date.strftime('%B %Y')}",
            })
            exp_seq += 1

        # Employee Salaries on 5th of every month (2 store assistants)
        if curr_date.day == 5:
            expenses_rows.append({
                "expense_id": f"EXP-{exp_seq:05d}",
                "date": curr_date.isoformat(),
                "category": "Salary",
                "amount": 14000.0,
                "payment_mode": "Bank Transfer",
                "description": "Salary for Assistant Rahul Wankhede",
            })
            exp_seq += 1
            expenses_rows.append({
                "expense_id": f"EXP-{exp_seq:05d}",
                "date": curr_date.isoformat(),
                "category": "Salary",
                "amount": 13000.0,
                "payment_mode": "Bank Transfer",
                "description": "Salary for Assistant Santosh Sahu",
            })
            exp_seq += 1

        # Weekly transport & tempo freight on Tuesdays
        if curr_date.weekday() == 1:
            freight_amt = round(random.uniform(1400, 2400), 2)
            expenses_rows.append({
                "expense_id": f"EXP-{exp_seq:05d}",
                "date": curr_date.isoformat(),
                "category": "Transport / Freight",
                "amount": freight_amt,
                "payment_mode": "Cash",
                "description": "Goods tempo unloading & freight from Kalamna / Itwari market",
            })
            exp_seq += 1

        # -------------------------------------------------------------------
        # Marketing Posts Simulation (Weekly WhatsApp / Instagram posts)
        # -------------------------------------------------------------------
        if curr_date.weekday() == 4: # Every Friday marketing broadcast
            if festival_name:
                caption_hi = f"🪔 {festival_name} स्पेशल धमाका ऑफर! हमारे यहाँ फ्रेश शुद्ध घी, मावा, आटा और ड्रायफ्रूट्स पर विशेष छूट। आज ही विजिट करें या घर बैठे वॉट्सऐप पर ऑर्डर करें! 📦"
                caption_mr = f"🎉 {festival_name} निमित्त भव्य किराणा डिस्काउंट! शुद्ध तूप, बासमती तांदूळ, आणि साखर विशेष दरात उपलब्ध. त्वरित व्हॉट्सॲपवर ऑर्डर नोंदवा! ✨"
            else:
                caption_hi = f"🛍️ वीकेंड ग्रोसरी सेल! बासमती चावल, फॉर्च्यून तेल और ताज़ा दालों पर बंपर बचत। ऑर्डर के लिए अभी रिप्लाई करें!"
                caption_mr = f"🌟 आठवडा बाजार विशेष बचत! दर्जेदार धान्य, तेल आणि दैनंदिन गरजेच्या वस्तू घाऊक दरात. आजच भेट द्या!"

            post_lang = random.choice(["hi", "mr", "hinglish"])
            caption = caption_mr if post_lang == "mr" else caption_hi

            views = random.randint(220, 680)
            replies = int(views * random.uniform(0.04, 0.12))
            orders_conv = int(replies * random.uniform(0.35, 0.65))

            marketing_rows.append({
                "post_id": f"MKT-{mkt_seq:04d}",
                "date": curr_date.isoformat(),
                "platform": random.choice(["WhatsApp Status & Broadcast", "Instagram & WhatsApp"]),
                "language": post_lang,
                "caption": caption,
                "festival_tag": festival_name or "Regular Promo",
                "views": views,
                "replies": replies,
                "converted_orders": orders_conv,
            })
            mkt_seq += 1

        curr_date += timedelta(days=1)

    print(f"Generated {len(sales_rows)} sales records across 365 days.")
    print(f"Generated {len(stock_movements)} stock movements.")
    print(f"Generated {len(payments_rows)} payments entries.")
    print(f"Generated {len(expenses_rows)} business expenses.")
    print(f"Generated {len(marketing_rows)} marketing posts.")

    # -----------------------------------------------------------------------
    # Write CSV Outputs
    # -----------------------------------------------------------------------
    # 1. products.csv
    with open(os.path.join(OUTPUT_DIR, "products.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["product_id", "name", "category", "unit", "cost_price", "selling_price", "reorder_level", "stock_quantity"])
        for idx, p in enumerate(PRODUCTS_CATALOG, 1):
            writer.writerow([
                f"PRD-{idx:03d}",
                p["name"],
                p["cat"],
                p["unit"],
                p["cost"],
                p["price"],
                p["reorder"],
                round(product_stocks.get(p["name"], 50.0), 2)
            ])

    # 2. customers.csv
    with open(os.path.join(OUTPUT_DIR, "customers.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["customer_id", "name", "phone", "language", "credit_limit", "current_balance", "address"])
        writer.writeheader()
        writer.writerows(customers)

    # 3. suppliers.csv
    with open(os.path.join(OUTPUT_DIR, "suppliers.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "name", "person", "phone", "cat", "lead_days", "loc"])
        writer.writeheader()
        writer.writerows(SUPPLIERS)

    # 4. sales.csv
    with open(os.path.join(OUTPUT_DIR, "sales.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["sale_id", "date", "time", "product", "quantity", "unit", "price", "customer", "payment_mode", "created_by"])
        writer.writeheader()
        writer.writerows(sales_rows)

    # 5. stock_movements.csv
    with open(os.path.join(OUTPUT_DIR, "stock_movements.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["movement_id", "date", "time", "product", "movement_type", "quantity", "running_stock", "notes"])
        writer.writeheader()
        writer.writerows(stock_movements)

    # 6. payments.csv
    with open(os.path.join(OUTPUT_DIR, "payments.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["payment_id", "date", "time", "customer", "amount", "payment_mode", "type", "is_overdue", "reference_sale_id"])
        writer.writeheader()
        writer.writerows(payments_rows)

    # 7. expenses.csv
    with open(os.path.join(OUTPUT_DIR, "expenses.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["expense_id", "date", "category", "amount", "payment_mode", "description"])
        writer.writeheader()
        writer.writerows(expenses_rows)

    # 8. marketing_posts.csv
    with open(os.path.join(OUTPUT_DIR, "marketing_posts.csv"), "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["post_id", "date", "platform", "language", "caption", "festival_tag", "views", "replies", "converted_orders"])
        writer.writeheader()
        writer.writerows(marketing_rows)

    print("Successfully exported all 8 synthetic CSVs to server/ml/data/out/")

    # -----------------------------------------------------------------------
    # 9. Generate 20,000 nl_entries.jsonl pairs
    # -----------------------------------------------------------------------
    generate_nl_training_set(20000)

def generate_nl_training_set(n=20000):
    """
    Generates 20,000 realistic Kirana natural language entries with
    Hindi, Marathi, English, and Hinglish variants, typos, spoken phrasing,
    and ASR-speech noise.
    """
    jsonl_path = os.path.join(os.path.dirname(__file__), "nl_entries.jsonl")
    print(f"Generating {n} natural language training pairs in {jsonl_path}...")

    # Templates per language
    # Slots: {qty} {unit} {prod} {cust} {amt} {pay}
    INTENT_TEMPLATES = {
        "sale": {
            "hinglish": [
                "{qty} {unit} {prod} becha {cust} ko {amt} rs me",
                "{cust} ko {qty} {unit} {prod} diya {amt} rupaye",
                "sold {qty} {unit} {prod} to {cust} for {amt} {pay}",
                "{prod} {qty} {unit} bik gaya {amt} me {cust}",
                "{cust} took {qty} {unit} {prod} bill {amt} {pay}",
                "{qty} {unit} {prod} sale hua {amt} rs {cust} se",
                "{cust} ne {qty} {unit} {prod} liya {amt} ka",
            ],
            "hindi": [
                "{cust} को {qty} {unit} {prod} बेचा {amt} रुपये में",
                "{qty} {unit} {prod} {cust} को दिया कुल {amt} रुपये",
                "{prod} {qty} {unit} बिका {amt} का {cust} को",
                "{cust} ने {qty} {unit} {prod} लिया {amt} रुपये नगद",
            ],
            "marathi": [
                "{cust} ला {qty} {unit} {prod} विकले {amt} रुपयांना",
                "{qty} {unit} {prod} {cust} यांना दिले {amt} रुपये",
                "{cust} ने {qty} {unit} {prod} नेले {amt} रुपये",
                "{prod} {qty} {unit} विक्री केली {amt} रुपये {cust}",
            ],
            "english": [
                "Sold {qty} {unit} of {prod} to {cust} for {amt} rupees via {pay}",
                "{qty} {unit} {prod} sold to {cust} amount {amt}",
                "Delivered {qty} {unit} {prod} to {cust} for Rs {amt}",
            ]
        },
        "purchase": {
            "hinglish": [
                "{qty} {unit} {prod} kharida {cust} se {amt} rs me",
                "wholesaler {cust} se {qty} {unit} {prod} aaya {amt} ka",
                "bought {qty} {unit} {prod} from {cust} total {amt}",
                "restocked {qty} {unit} {prod} bill {amt} from {cust}",
            ],
            "hindi": [
                "{cust} से {qty} {unit} {prod} खरीदा {amt} रुपये में",
                "{qty} {unit} {prod} नया माल आया {cust} से {amt} का",
            ],
            "marathi": [
                "{cust} कडून {qty} {unit} {prod} खरेदी केले {amt} रुपये",
                "नवीन माल आला {qty} {unit} {prod} {amt} रुपये {cust} कडून",
            ],
            "english": [
                "Purchased {qty} {unit} {prod} from supplier {cust} for {amt}",
                "Stock in {qty} {unit} {prod} from {cust} amount {amt}",
            ]
        },
        "expense": {
            "hinglish": [
                "{prod} ka bill bhara {amt} rs {pay}",
                "{amt} rupaye diya {prod} ke liye",
                "paid {amt} for {prod} via {pay}",
                "{prod} kharcha hua {amt} rs",
            ],
            "hindi": [
                "{prod} का भुगतान किया {amt} रुपये",
                "{amt} रुपये {prod} के लिए दिए",
            ],
            "marathi": [
                "{prod} चे बिल भरले {amt} रुपये {pay}",
                "{amt} रुपये खर्च झाले {prod} साठी",
            ],
            "english": [
                "Paid Rs {amt} for {prod} via {pay}",
                "Expense recorded {amt} for {prod}",
            ]
        }
    }

    TYPO_MAP = {
        "sugar": ["sugr", "shugar", "suagr", "shakkar", "chini", "chinni"],
        "oil": ["oyl", "oill", "tel", "tell"],
        "atta": ["ata", "aata", "aatat", "flour"],
        "rice": ["ric", "riice", "chawal", "chaawal", "tandul"],
        "dal": ["daal", "dall", "dhal"],
        "biscuit": ["biskit", "biskut", "biscut"],
        "soap": ["sop", "sope", "sabun"],
        "becha": ["becah", "bechaa", "bik gaya"],
        "kharida": ["kharid", "khrida", "khreeda"],
    }

    PRODUCTS = ["Sugar", "Mustard Oil", "Atta", "Basmati Rice", "Toor Dal", "Tea Powder", "Biscuits", "Lifebuoy Soap", "Milk", "Maggi Noodles"]
    CUSTOMERS = ["Ramesh", "Suresh", "Ganesh", "Sunita", "Pooja", "Amit", "Kulkarni Ji", "Patil Saheb", "Sharmaji", "Deshmukh"]
    SUPPLIERS_SHORT = ["Nagpur Wholesaler", "Vidarbha Oil Depot", "Kalamna Grain", "Amul Agency", "Haldiram Wholesaler"]
    EXPENSES_SHORT = ["shop rent", "electricity bill", "tempo freight", "store assistant salary", "tea expense"]
    UNITS = ["kg", "packet", "litre", "piece", "box", "bori"]
    PAY_MODES = ["cash", "upi", "credit"]

    with open(jsonl_path, "w", encoding="utf-8") as f:
        for idx in range(n):
            intent_choice = random.choices(["sale", "purchase", "expense"], weights=[75, 18, 7], k=1)[0]
            lang_choice = random.choices(["hinglish", "hindi", "marathi", "english"], weights=[45, 25, 20, 10], k=1)[0]

            template = random.choice(INTENT_TEMPLATES[intent_choice][lang_choice])

            if intent_choice == "sale":
                prod = random.choice(PRODUCTS)
                cust = random.choice(CUSTOMERS)
                qty = float(random.choice([1, 2, 5, 10]))
                unit = "kg" if "Oil" not in prod and "Soap" not in prod and "Biscuit" not in prod else ("litre" if "Oil" in prod else "packet")
                amt = float(int(qty * random.choice([40, 50, 90, 140, 160])))
                pay = random.choice(PAY_MODES)
            elif intent_choice == "purchase":
                prod = random.choice(PRODUCTS)
                cust = random.choice(SUPPLIERS_SHORT)
                qty = float(random.choice([25, 50, 100, 200]))
                unit = "kg" if "Oil" not in prod else "litre"
                amt = float(int(qty * random.choice([35, 45, 80, 130])))
                pay = "bank"
            else:
                prod = random.choice(EXPENSES_SHORT)
                cust = "Landlord / Vendor"
                qty = 1.0
                unit = "service"
                amt = float(random.choice([500, 1500, 4500, 14000, 22000]))
                pay = random.choice(["cash", "upi"])

            raw = template.format(
                qty=int(qty) if qty.is_integer() else qty,
                unit=unit,
                prod=prod,
                cust=cust,
                amt=int(amt),
                pay=pay
            )

            # Introduce realistic speech / typo noise in 30% of samples
            if random.random() < 0.30:
                words = raw.split()
                if words:
                    target_w = random.choice(words)
                    lower_w = target_w.lower()
                    if lower_w in TYPO_MAP:
                        rep = random.choice(TYPO_MAP[lower_w])
                        raw = raw.replace(target_w, rep, 1)

            entry_record = {
                "text": raw,
                "language": lang_choice,
                "parsed": {
                    "intent": intent_choice,
                    "product": prod,
                    "quantity": qty,
                    "unit": unit,
                    "amount": amt,
                    "customer": cust,
                    "payment_mode": pay,
                }
            }
            f.write(json.dumps(entry_record, ensure_ascii=False) + "\n")

    print(f"Successfully generated {n} entries in {jsonl_path}!")

if __name__ == "__main__":
    run_simulation()
