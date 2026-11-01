// Client API layer for Open Employee Business & Agent modules

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Sale {
  id: string;
  product: string;
  quantity: number;
  unit: string;
  price: number;
  total_amount: number;
  total?: number;
  customer: string;
  raw_text?: string;
  lang: string;
  created_by: string;
  created_at: string;
  timestamp?: string;
}

export interface StockItem {
  product: string;
  quantity: number;
  unit: string;
  min_reorder_level: number;
  unit_cost: number;
  selling_price: number;
  is_low_stock: boolean;
  last_updated: string;
}

export interface FinanceEntry {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  payment_mode: string;
  reference_id?: string;
  description?: string;
  created_at: string;
  timestamp?: string;
}

export interface FinanceSummary {
  total_income: number;
  total_expense: number;
  net_profit: number;
  today_revenue: number;
  today_transactions_count: number;
  monthly_revenue?: number;
  today_expenses?: number;
  net_cashflow?: number;
}

export interface UPIOrder {
  order_id: string;
  amount: number;
  currency: string;
  customer_name: string;
  note: string;
  qr_payload: string;
  upi_intent_url: string;
  qr_code_url: string;
  payment_link?: string;
  status: "pending" | "paid" | "failed";
  created_at: string;
}

export interface ParsedEntry {
  raw_text: string;
  detected_lang: string;
  action_type: "sale" | "stock_in" | "expense" | "unknown";
  product?: string;
  quantity?: number;
  unit?: string;
  amount?: number;
  party?: string;
  confidence: number;
}

export interface ApprovalTask {
  id: string;
  task_id: string;
  action: string;
  target: string;
  amount?: number;
  channel?: "whatsapp" | "exotel_call" | "razorpay_payout" | "gst_portal";
  reason: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
}

export interface WhatsAppInboxItem {
  id: number;
  message_id?: string;
  sender: string;
  recipient?: string;
  direction: "inbound" | "outbound";
  message_type: string;
  text?: string;
  media_url?: string;
  media_id?: string;
  mime_type?: string;
  filename?: string;
  is_invoice?: boolean;
  status: string;
  timestamp: string;
}

export interface AuditEvent {
  id: string;
  actor: "agent" | "owner" | "employee" | "system";
  action: string;
  detail: Record<string, any>;
  status: "success" | "pending" | "rejected" | "failed";
  timestamp: string;
}

// In-memory persistent client cache if backend is unreachable
let localSales: Sale[] = [
  {
    id: "SALE-INIT001",
    product: "Sugar (चीनी)",
    quantity: 2.0,
    unit: "kg",
    price: 45.0,
    total_amount: 90.0,
    customer: "Ramesh Gupta",
    raw_text: "2 kg sugar becha Ramesh ko 90 rs",
    lang: "hi",
    created_by: "owner",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "SALE-INIT002",
    product: "Toor Dal (अरहर दाल)",
    quantity: 1.5,
    unit: "kg",
    price: 165.0,
    total_amount: 247.5,
    customer: "Pooja Sharma",
    raw_text: "1.5 kg toor dal becha 247 rs",
    lang: "hi",
    created_by: "owner",
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
];

let localStock: StockItem[] = [
  { product: "Sugar (चीनी)", quantity: 43.0, unit: "kg", min_reorder_level: 20.0, unit_cost: 38.0, selling_price: 45.0, is_low_stock: false, last_updated: new Date().toISOString() },
  { product: "Atta (गेहूं का आटा)", quantity: 12.0, unit: "kg", min_reorder_level: 15.0, unit_cost: 32.0, selling_price: 40.0, is_low_stock: true, last_updated: new Date().toISOString() },
  { product: "Mustard Oil (सरसों तेल)", quantity: 8.0, unit: "L", min_reorder_level: 10.0, unit_cost: 130.0, selling_price: 155.0, is_low_stock: true, last_updated: new Date().toISOString() },
  { product: "Toor Dal (अरहर दाल)", quantity: 23.5, unit: "kg", min_reorder_level: 10.0, unit_cost: 140.0, selling_price: 165.0, is_low_stock: false, last_updated: new Date().toISOString() },
  { product: "Basmati Rice (बासमती चावल)", quantity: 30.0, unit: "kg", min_reorder_level: 15.0, unit_cost: 75.0, selling_price: 95.0, is_low_stock: false, last_updated: new Date().toISOString() },
  { product: "Tea Leaves (चाय पत्ती)", quantity: 14.0, unit: "kg", min_reorder_level: 5.0, unit_cost: 280.0, selling_price: 340.0, is_low_stock: false, last_updated: new Date().toISOString() },
];

let localFinance: FinanceEntry[] = [
  { id: "FIN-001", type: "income", category: "sale", amount: 90.0, payment_mode: "cash", reference_id: "SALE-INIT001", description: "Sale to Ramesh Gupta", created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: "FIN-002", type: "income", category: "sale", amount: 247.5, payment_mode: "upi", reference_id: "SALE-INIT002", description: "Sale to Pooja Sharma", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "FIN-003", type: "expense", category: "utilities", amount: 450.0, payment_mode: "cash", description: "Shop electricity bill payment", created_at: new Date(Date.now() - 14400000).toISOString() },
];

let localApprovals: ApprovalTask[] = [
  {
    id: "APP-001",
    task_id: "TASK-SUPPLY-ATTA",
    action: "Auto-Supplier Purchase Order",
    target: "Shree Krishna Mills (+91 9876543210)",
    amount: 1600.0,
    channel: "whatsapp",
    reason: "Atta stock fell to 12 kg (threshold: 15 kg). Agent drafted purchase order for 50 kg.",
    status: "pending",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "APP-002",
    task_id: "TASK-VOICE-RESTOCK",
    action: "Exotel Outbound Voice Call (Hindi)",
    target: "Mustard Oil Vendor Rajesh (+91 9811223344)",
    amount: 2600.0,
    channel: "exotel_call",
    reason: "Mustard oil critically low (8 L). Agent drafted automated voice negotiation call script.",
    status: "pending",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "APP-003",
    task_id: "TASK-WA-PROMO",
    action: "WhatsApp Broadcast Promotion",
    target: "142 Active Regular Customers",
    channel: "whatsapp",
    reason: "Agent generated festive discount campaign for Basmati Rice & Dal to clear inventory.",
    status: "pending",
    created_at: new Date(Date.now() - 5400000).toISOString(),
  },
];

let localAuditEvents: AuditEvent[] = [
  {
    id: "AUD-001",
    actor: "agent",
    action: "low_stock_detected",
    status: "success",
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    detail: { product: "Atta", current_stock: 12.0, threshold: 15.0, action: "queued_for_approval" },
  },
  {
    id: "AUD-002",
    actor: "agent",
    action: "drafted_whatsapp_order",
    status: "pending",
    timestamp: new Date(Date.now() - 1700000).toISOString(),
    detail: { supplier: "Shree Krishna Mills", quantity: "50 kg", cost: 1600.0 },
  },
  {
    id: "AUD-003",
    actor: "owner",
    action: "sale_recorded_voice",
    status: "success",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    detail: { raw_text: "2 kg sugar becha Ramesh ko 90 rs", amount: 90.0, payment_mode: "cash" },
  },
  {
    id: "AUD-004",
    actor: "system",
    action: "bhashini_tts_synthesized",
    status: "success",
    timestamp: new Date(Date.now() - 3500000).toISOString(),
    detail: { lang: "hi", text_length: 64, target: "exotel_outbound" },
  },
];

// Helper to fetch with timeout and fallback
async function fetchWithFallback<T>(url: string, options?: RequestInit, fallback?: () => T): Promise<T> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    return await res.json();
  } catch (err) {
    if (fallback) {
      return fallback();
    }
    throw err;
  }
}

export const api = {
  // Sales
  async getSales(): Promise<Sale[]> {
    return fetchWithFallback<Sale[]>("/business/sales", undefined, () => [...localSales]);
  },

  async createSale(sale: {
    product: string;
    quantity: number;
    price: number;
    unit?: string;
    customer?: string;
    raw_text?: string;
    lang?: string;
  }): Promise<Sale> {
    return fetchWithFallback<Sale>(
      "/business/sales",
      { method: "POST", body: JSON.stringify({ ...sale, created_by: "owner" }) },
      () => {
        const total = sale.quantity * sale.price;
        const newSale: Sale = {
          id: `SALE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          product: sale.product,
          quantity: sale.quantity,
          unit: sale.unit || "unit",
          price: sale.price,
          total_amount: total,
          customer: sale.customer || "Walk-in Customer",
          raw_text: sale.raw_text,
          lang: sale.lang || "hi",
          created_by: "owner",
          created_at: new Date().toISOString(),
        };
        localSales.unshift(newSale);
        // deduct stock
        const stockItem = localStock.find((s) => s.product.toLowerCase().includes(sale.product.toLowerCase()));
        if (stockItem) {
          stockItem.quantity = Math.max(0, stockItem.quantity - sale.quantity);
          stockItem.is_low_stock = stockItem.quantity <= stockItem.min_reorder_level;
        }
        // credit finance
        localFinance.unshift({
          id: `FIN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          type: "income",
          category: "sale",
          amount: total,
          payment_mode: "cash",
          reference_id: newSale.id,
          description: `Sale of ${sale.product}`,
          created_at: new Date().toISOString(),
        });
        // log audit
        localAuditEvents.unshift({
          id: `AUD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          actor: "owner",
          action: "sale_created",
          status: "success",
          timestamp: new Date().toISOString(),
          detail: { product: sale.product, quantity: sale.quantity, total },
        });
        return newSale;
      }
    );
  },

  async parseEntry(text: string): Promise<ParsedEntry> {
    return fetchWithFallback<ParsedEntry>(
      "/business/sales/parse",
      { method: "POST", body: JSON.stringify({ text }) },
      () => {
        const lower = text.toLowerCase();
        let action_type: "sale" | "stock_in" | "expense" = "sale";
        if (lower.includes("bill") || lower.includes("rent") || lower.includes("paid")) action_type = "expense";
        if (lower.includes("kharida") || lower.includes("restock")) action_type = "stock_in";

        let product = "Sugar (चीनी)";
        if (lower.includes("atta") || lower.includes("आटा")) product = "Atta (गेहूं का आटा)";
        if (lower.includes("oil") || lower.includes("tel") || lower.includes("तेल")) product = "Mustard Oil (सरसों तेल)";
        if (lower.includes("dal") || lower.includes("दाल")) product = "Toor Dal (अरहर दाल)";
        if (lower.includes("rice") || lower.includes("chawal") || lower.includes("चावल")) product = "Basmati Rice (बासमती चावल)";
        if (lower.includes("tea") || lower.includes("chai") || lower.includes("चाय")) product = "Tea Leaves (चाय पत्ती)";

        const nums = text.match(/\d+(\.\d+)?/g);
        const qty = nums && nums[0] ? parseFloat(nums[0]) : 1.0;
        const amount = nums && nums[1] ? parseFloat(nums[1]) : (action_type === "expense" ? qty : qty * 45.0);

        let party = "Walk-in Customer";
        const partyMatch = text.match(/([a-zA-Z\u0900-\u097F]+)\s+ko\b/i);
        if (partyMatch && partyMatch[1]) party = partyMatch[1];

        return {
          raw_text: text,
          detected_lang: /[\u0900-\u097F]/.test(text) ? "hi" : "hinglish",
          action_type,
          product,
          quantity: qty,
          unit: "kg",
          amount,
          party,
          confidence: 0.92,
        };
      }
    );
  },

  // Stock
  async getStock(): Promise<StockItem[]> {
    return fetchWithFallback<StockItem[]>("/business/stock", undefined, () => [...localStock]);
  },

  async adjustStock(product: string, delta: number, reason: "sale" | "purchase" | "adjust"): Promise<StockItem> {
    return fetchWithFallback<StockItem>(
      "/business/stock/movement",
      { method: "POST", body: JSON.stringify({ product, delta, reason }) },
      () => {
        let item = localStock.find((s) => s.product.toLowerCase().includes(product.toLowerCase()));
        if (!item) {
          item = {
            product,
            quantity: Math.max(0, delta),
            unit: "unit",
            min_reorder_level: 10,
            unit_cost: 0,
            selling_price: 0,
            is_low_stock: delta <= 10,
            last_updated: new Date().toISOString(),
          };
          localStock.push(item);
        } else {
          item.quantity = Math.max(0, item.quantity + delta);
          item.is_low_stock = item.quantity <= item.min_reorder_level;
          item.last_updated = new Date().toISOString();
        }
        return item;
      }
    );
  },

  // Finance
  async getFinanceSummary(): Promise<FinanceSummary> {
    return fetchWithFallback<FinanceSummary>("/business/finance/summary", undefined, () => {
      const income = localFinance.filter((f) => f.type === "income").reduce((acc, f) => acc + f.amount, 0);
      const expense = localFinance.filter((f) => f.type === "expense").reduce((acc, f) => acc + f.amount, 0);
      return {
        total_income: income,
        total_expense: expense,
        net_profit: income - expense,
        today_revenue: income,
        today_transactions_count: localFinance.length,
      };
    });
  },

  async getFinanceLedger(): Promise<FinanceEntry[]> {
    return fetchWithFallback<FinanceEntry[]>("/business/finance/ledger", undefined, () => [...localFinance]);
  },

  // UPI Payments
  async createUPIOrder(order: { amount: number; customer_name?: string; note?: string }): Promise<UPIOrder> {
    const fallbackOrderId = `UPI-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const fallbackUpi = `upi://pay?pa=openemployee.merchant@icici&pn=Open%20Employee%20Store&am=${order.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(order.note || "Store Payment")}&tr=${fallbackOrderId}`;
    const fallbackQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=${encodeURIComponent(fallbackUpi)}`;

    return fetchWithFallback<UPIOrder>(
      "/integrations/upi/order",
      {
        method: "POST",
        body: JSON.stringify({
          amount: order.amount,
          customer_name: order.customer_name || "Customer",
          description: order.note || "Store Payment",
        }),
      },
      () => {
        return {
          order_id: fallbackOrderId,
          amount: order.amount,
          currency: "INR",
          customer_name: order.customer_name || "Customer",
          note: order.note || "Store Payment",
          qr_payload: fallbackUpi,
          upi_intent_url: fallbackUpi,
          qr_code_url: fallbackQr,
          payment_link: fallbackUpi,
          status: "pending",
          created_at: new Date().toISOString(),
        };
      }
    );
  },

  // Bhashini Indian Regional Voice & Translation Services
  async translateText(text: string, sourceLang = "hi", targetLang = "en"): Promise<{ translated_text: string; provider: string }> {
    return fetchWithFallback(
      "/voice/translate",
      {
        method: "POST",
        body: JSON.stringify({ text, source_lang: sourceLang, target_lang: targetLang }),
      },
      () => ({ translated_text: text, provider: "Bhashini Offline Fallback" })
    );
  },

  async synthesizeSpeech(text: string, lang = "hi"): Promise<{ audio_base64?: string; status: string }> {
    return fetchWithFallback(
      "/voice/tts",
      {
        method: "POST",
        body: JSON.stringify({ text, lang }),
      },
      () => ({ status: "SYNTHESIZED" })
    );
  },

  async simulateUPISuccess(orderId: string): Promise<UPIOrder> {
    return fetchWithFallback<UPIOrder>(
      `/business/upi/simulate-success/${orderId}`,
      { method: "POST" },
      () => {
        return {
          order_id: orderId,
          amount: 250,
          currency: "INR",
          customer_name: "Customer",
          note: "Store Payment",
          qr_payload: "",
          upi_intent_url: "",
          qr_code_url: "",
          payment_link: "",
          status: "paid",
          created_at: new Date().toISOString(),
        };
      }
    );
  },

  // Approvals Gate
  async getApprovals(): Promise<ApprovalTask[]> {
    return [...localApprovals];
  },

  async resolveApproval(id: string, decision: "approved" | "rejected"): Promise<ApprovalTask> {
    const task = localApprovals.find((a) => a.id === id);
    if (task) {
      task.status = decision;
      localAuditEvents.unshift({
        id: `AUD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        actor: "owner",
        action: `approval_${decision}`,
        status: decision === "approved" ? "success" : "rejected",
        timestamp: new Date().toISOString(),
        detail: { approval_id: id, action: task.action, target: task.target, amount: task.amount },
      });
    }
    return task || localApprovals[0];
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditEvent[]> {
    return [...localAuditEvents];
  },

  // WhatsApp Cloud API Integrations
  async getWhatsAppInbox(limit = 50): Promise<WhatsAppInboxItem[]> {
    return fetchWithFallback<WhatsAppInboxItem[]>(
      `/integrations/whatsapp/inbox?limit=${limit}`,
      { method: 'GET' },
      () => localWhatsAppInbox
    );
  },

  async sendWhatsAppMessage(payload: {
    to_phone: string;
    text: string;
    image_url?: string;
    approved?: boolean;
  }): Promise<any> {
    return fetchWithFallback<any>(
      '/integrations/whatsapp/send',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => ({
        status: 'SENT',
        recipient: payload.to_phone,
        text: payload.text,
        channel: 'WhatsApp Cloud API (Mock/Simulated)',
      })
    );
  },

  async sendWhatsAppTemplate(payload: {
    to_phone: string;
    template_name?: string;
    language_code?: string;
    components?: any[];
    approved?: boolean;
  }): Promise<any> {
    return fetchWithFallback<any>(
      '/integrations/whatsapp/send-template',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => ({
        status: 'SENT',
        recipient: payload.to_phone,
        template_name: payload.template_name || 'hello_world',
        channel: 'WhatsApp Cloud API (Mock/Simulated)',
      })
    );
  },

  async postWhatsAppStatus(payload: {
    text?: string;
    image_url?: string;
    to_phone?: string;
    approved?: boolean;
  }): Promise<any> {
    return fetchWithFallback<any>(
      '/integrations/whatsapp/post-status',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      () => ({
        status: 'PUBLISHED',
        type: 'marketing_status',
        text: payload.text,
        image_url: payload.image_url,
        channel: 'WhatsApp Cloud API (Mock/Simulated)',
      })
    );
  },
};


let localWhatsAppInbox: WhatsAppInboxItem[] = [
  {
    id: 1,
    message_id: 'wamid.inbound.001',
    sender: '919876543210',
    recipient: 'business',
    direction: 'inbound',
    message_type: 'text',
    text: 'Namaste, need 5 bags of sugar and 2 tin mustard oil delivered tomorrow.',
    status: 'received',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 2,
    message_id: 'wamid.inbound.002',
    sender: '919811223344',
    recipient: 'business',
    direction: 'inbound',
    message_type: 'document',
    filename: 'Tax_Invoice_Vendor_October.pdf',
    mime_type: 'application/pdf',
    is_invoice: true,
    text: 'Attached wholesale supplier GST invoice for October dispatch.',
    status: 'received',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];
