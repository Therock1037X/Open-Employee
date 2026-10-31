import random
from datetime import datetime
from fastapi import FastAPI, Form, Request
from fastapi.responses import HTMLResponse

app = FastAPI(title="Goods and Services Tax (GST) Mock Portal")

HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>GST Portal - Government of India (Mock)</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen text-gray-800">
    <!-- Header -->
    <header class="bg-[#1b3f75] text-white p-4 shadow-md">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center font-bold text-blue-900">GST</div>
                <div>
                    <h1 class="text-lg font-bold">Goods and Services Tax Portal</h1>
                    <p class="text-xs text-blue-200">Government of India (Automated Filing Demo)</p>
                </div>
            </div>
            <div class="text-xs text-blue-200">
                Authorized Session | Ref: 27AABCT3518Q1ZB
            </div>
        </div>
    </header>

    <div class="max-w-4xl mx-auto my-8 p-6 bg-white rounded-xl shadow-lg border border-gray-200">
        {{ content | safe }}
    </div>

    <footer class="text-center text-xs text-gray-500 py-6">
        Simulated GST Network for Playwright Computer-Use Validation.
    </footer>
</body>
</html>
"""

@app.get("/", response_class=HTMLResponse)
def index():
    content = """
    <div class="text-center py-6">
        <h2 class="text-2xl font-bold text-gray-800 mb-2">GST Common Portal Login</h2>
        <p class="text-sm text-gray-500 mb-6">Enter registered GSTIN and filing credentials</p>
        <form action="/dashboard" method="post" class="max-w-md mx-auto space-y-4 text-left">
            <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">GSTIN / Username</label>
                <input type="text" name="gstin" id="gstin-input" value="27AABCT3518Q1ZB" required class="w-full border rounded-lg p-2.5 text-sm font-mono border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none">
            </div>
            <div>
                <label class="block text-xs font-semibold text-gray-700 mb-1">Password</label>
                <input type="password" name="password" id="password-input" value="DemoPass@2026" required class="w-full border rounded-lg p-2.5 text-sm border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none">
            </div>
            <button type="submit" id="login-submit-btn" class="w-full py-3 bg-[#1b3f75] hover:bg-blue-900 text-white font-semibold rounded-lg shadow transition">
                Secure Login to Portal
            </button>
        </form>
    </div>
    """
    return HTML_TEMPLATE.replace("{{ content | safe }}", content)

@app.post("/dashboard", response_class=HTMLResponse)
def dashboard(gstin: str = Form("27AABCT3518Q1ZB")):
    content = f"""
    <div>
        <div class="border-b pb-4 mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-xl font-bold text-gray-900">Return Filing Dashboard</h2>
                <p class="text-xs text-gray-500">Taxpayer: SHREE GANESH TRADERS | GSTIN: <span class="font-mono text-blue-800 font-bold">{gstin}</span></p>
            </div>
            <span class="px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">ACTIVE REGISTRATION</span>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
            <div class="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <h4 class="text-xs font-bold text-blue-900 mb-1">Return Due: GSTR-3B</h4>
                <p class="text-xs text-gray-600">Monthly Summary Return for OCT-2026</p>
                <a href="/returns/gstr-3b" id="prepare-gstr3b-btn" class="mt-3 inline-block px-4 py-2 bg-[#1b3f75] text-white text-xs font-semibold rounded hover:bg-blue-900">
                    Prepare Online &rarr;
                </a>
            </div>
            <div class="p-4 rounded-lg bg-gray-50 border border-gray-200">
                <h4 class="text-xs font-bold text-gray-900 mb-1">Previous Filing Status</h4>
                <p class="text-xs text-gray-600">SEP-2026: Filed (ARN: AA2709260081294)</p>
            </div>
        </div>
    </div>
    """
    return HTML_TEMPLATE.replace("{{ content | safe }}", content)

@app.get("/returns/gstr-3b", response_class=HTMLResponse)
def gstr3b_form():
    content = """
    <div>
        <h2 class="text-xl font-bold text-gray-900 mb-1">Form GSTR-3B Filing (OCT-2026)</h2>
        <p class="text-xs text-gray-500 mb-6">Details of outward supplies and tax liability calculation</p>

        <form action="/returns/submit" method="post" id="gst-filing-form" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Taxable Turnover (₹)</label>
                    <input type="number" step="0.01" id="turnover-input" name="turnover" value="125000.00" required class="w-full border rounded-lg p-2.5 text-sm font-mono border-gray-300">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Integrated Tax / IGST (₹)</label>
                    <input type="number" step="0.01" id="igst-input" name="igst" value="0.00" class="w-full border rounded-lg p-2.5 text-sm font-mono border-gray-300">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">Central Tax / CGST (₹)</label>
                    <input type="number" step="0.01" id="cgst-input" name="cgst" value="3125.00" required class="w-full border rounded-lg p-2.5 text-sm font-mono border-gray-300">
                </div>
                <div>
                    <label class="block text-xs font-semibold text-gray-700 mb-1">State Tax / SGST (₹)</label>
                    <input type="number" step="0.01" id="sgst-input" name="sgst" value="3125.00" required class="w-full border rounded-lg p-2.5 text-sm font-mono border-gray-300">
                </div>
            </div>

            <div class="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                <span>⚠️ By submitting, you electronically sign (EVC) this tax return.</span>
            </div>

            <button type="submit" id="file-return-submit-btn" class="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow transition">
                Confirm & File GSTR-3B Return
            </button>
        </form>
    </div>
    """
    return HTML_TEMPLATE.replace("{{ content | safe }}", content)

@app.post("/returns/submit", response_class=HTMLResponse)
def submit_return(
    turnover: float = Form(125000.0),
    cgst: float = Form(3125.0),
    sgst: float = Form(3125.0),
):
    arn = f"AA271026{random.randint(1000000, 9999999)}"
    now = datetime.utcnow().strftime("%d-%m-%Y %H:%M:%S UTC")
    content = f"""
    <div class="text-center py-6">
        <div class="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">✓</div>
        <h2 class="text-2xl font-bold text-gray-900 mb-1">Return Successfully Filed!</h2>
        <p class="text-sm text-gray-600 mb-6">Form GSTR-3B has been filed and verified with Electronic Verification Code (EVC).</p>

        <div class="max-w-md mx-auto p-4 bg-gray-50 rounded-xl border border-gray-200 text-left text-xs space-y-2 mb-6">
            <div class="flex justify-between">
                <span class="text-gray-500">Application Reference Number (ARN):</span>
                <span class="font-mono font-bold text-blue-900 text-sm" id="arn-value">{arn}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-500">Filing Date & Time:</span>
                <span class="font-medium text-gray-700">{now}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-500">Taxable Turnover:</span>
                <span class="font-medium text-gray-700">₹{turnover:,.2f}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-500">Total Tax Paid (CGST+SGST):</span>
                <span class="font-bold text-emerald-700">₹{(cgst + sgst):,.2f}</span>
            </div>
        </div>

        <a href="/" class="text-xs text-blue-700 hover:underline">Return to Portal Home</a>
    </div>
    """
    return HTML_TEMPLATE.replace("{{ content | safe }}", content)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
