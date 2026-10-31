import unittest
from fastapi.testclient import TestClient

from app.main import app
from app.modules.business.service import BusinessService
from app.modules.business.models import (
    SaleCreate,
    StockAdjustmentRequest,
    FinanceEntryCreate,
    UPIOrderCreate,
)


class TestBusinessService(unittest.TestCase):
    def setUp(self):
        self.service = BusinessService()

    def test_initial_stock_seeded(self):
        stock = self.service.list_stock()
        self.assertGreater(len(stock), 0)
        sugar = next((item for item in stock if "Sugar" in item.product), None)
        self.assertIsNotNone(sugar)
        self.assertEqual(sugar.quantity, 45.0)

    def test_record_sale_and_inventory_deduction(self):
        sale_in = SaleCreate(
            product="Sugar (चीनी)",
            quantity=5.0,
            price=45.0,
            unit="kg",
            customer="Ramesh Gupta",
            raw_text="5 kg sugar becha Ramesh ko 45 rs",
            lang="hi",
            created_by="owner",
        )
        sale_res = self.service.record_sale(sale_in)
        self.assertEqual(sale_res.product, "Sugar (चीनी)")
        self.assertEqual(sale_res.quantity, 5.0)
        self.assertEqual(sale_res.total_amount, 225.0)
        self.assertTrue(sale_res.id.startswith("SALE-"))

        # Verify stock was deducted: 45 - 5 = 40
        stock = self.service.list_stock()
        sugar = next(item for item in stock if "Sugar" in item.product)
        self.assertEqual(sugar.quantity, 40.0)

        # Verify finance entry was created
        ledger = self.service.list_finance_entries()
        self.assertTrue(any(f.amount == 225.0 and f.type == "income" for f in ledger))

    def test_stock_adjustment(self):
        adj = StockAdjustmentRequest(
            product="Basmati Rice (बासमती चावल)",
            delta=20.0,
            reason="purchase",
            unit="kg",
            note="Supplier restock",
        )
        res = self.service.adjust_stock(adj)
        self.assertGreaterEqual(res.quantity, 50.0)

    def test_upi_order_lifecycle(self):
        order_in = UPIOrderCreate(
            amount=250.0,
            customer_name="Sita Devi",
            note="Groceries Bill",
        )
        order = self.service.create_upi_order(order_in)
        self.assertEqual(order.status, "pending")
        self.assertIn("upi://pay", order.upi_intent_url)

        # Simulate customer payment
        paid_order = self.service.simulate_upi_payment_success(order.order_id)
        self.assertIsNotNone(paid_order)
        self.assertEqual(paid_order.status, "paid")

        # Verify finance income was logged
        ledger = self.service.list_finance_entries()
        self.assertTrue(any(f.amount == 250.0 and f.category == "upi_collection" for f in ledger))

    def test_multilingual_parser(self):
        parsed = self.service.parse_entry_text("2 kg sugar becha Ramesh ko 90 rs")
        self.assertEqual(parsed.action_type, "sale")
        self.assertEqual(parsed.product.lower(), "sugar")
        self.assertEqual(parsed.quantity, 2.0)
        self.assertEqual(parsed.party, "Ramesh")
        self.assertEqual(parsed.amount, 90.0)


class TestBusinessFastAPIEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_ping_endpoint(self):
        res = self.client.get("/business/ping")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["module"], "business")
        self.assertEqual(data["status"], "ok")

    def test_summary_endpoint(self):
        res = self.client.get("/business/summary")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("finance", data)
        self.assertIn("total_products_count", data)

    def test_sales_and_stock_api(self):
        sale_payload = {
            "product": "Atta (गेहूं का आटा)",
            "quantity": 2.0,
            "unit": "kg",
            "price": 40.0,
            "customer": "Vermaji",
            "raw_text": "2 kg atta becha Vermaji ko 40 rs",
            "lang": "hi",
            "created_by": "owner"
        }
        res = self.client.post("/business/sales", json=sale_payload)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["total_amount"], 80.0)

        # Check stock endpoint
        stock_res = self.client.get("/business/stock")
        self.assertEqual(stock_res.status_code, 200)
        self.assertIsInstance(stock_res.json(), list)

    def test_upi_checkout_api(self):
        upi_payload = {
            "amount": 180.0,
            "customer_name": "Karan Johar",
            "note": "Spice Box Purchase"
        }
        res = self.client.post("/business/upi/create-order", json=upi_payload)
        self.assertEqual(res.status_code, 200)
        order = res.json()
        self.assertEqual(order["status"], "pending")
        order_id = order["order_id"]

        # Check status
        status_res = self.client.get(f"/business/upi/status/{order_id}")
        self.assertEqual(status_res.status_code, 200)
        self.assertEqual(status_res.json()["status"], "pending")

        # Simulate success
        sim_res = self.client.post(f"/business/upi/simulate-success/{order_id}")
        self.assertEqual(sim_res.status_code, 200)
        self.assertEqual(sim_res.json()["status"], "paid")


if __name__ == "__main__":
    unittest.main()
