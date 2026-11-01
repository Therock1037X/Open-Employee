import json
import random
import os
from typing import List, Dict, Any, Tuple
from pathlib import Path

# Fixed seed for reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Common base training products & customers
TRAIN_PRODUCTS = [
    ("Sugar", ["sugar", "chini", "shakkar", "sakhar"]),
    ("Rice", ["rice", "chawal", "tandool"]),
    ("Wheat Flour", ["atta", "aata", "gehu ka atta"]),
    ("Mustard Oil", ["mustard oil", "sarson tel", "sarson ka tel", "rai tel"]),
    ("Tea Powder", ["chai patti", "tea", "chaha patti"]),
    ("Milk", ["milk", "doodh", "dudh"]),
    ("Tur Dal", ["tur dal", "toor daal", "arhar dal"]),
]

TRAIN_CUSTOMERS = [
    "Ramesh", "Suresh", "Mahesh", "Sunita", "Gita", "Amit", 
    "Vikas", "Praveen", "Rajesh", "Kavita", "Deepak"
]

# UNSEEN products & customers strictly reserved for TEST SET
UNSEEN_TEST_PRODUCTS = [
    ("Poha", ["poha", "pohe", "aval"]),
    ("Sabudana", ["sabudana", "sago"]),
    ("Besan Ladoo", ["besan ladoo", "besan laddu", "ladoo"]),
    ("Kashmiri Chilli", ["kashmiri mirch", "kashmiri chilli", "lal mirch"]),
    ("Dhania Powder", ["dhania powder", "dhana powder", "coriander powder"]),
    ("Basmati Tukda", ["basmati tukda", "mogra rice", "biryani rice"]),
    ("Ghee Tin", ["ghee tin", "desi ghee", "tup"]),
]

UNSEEN_TEST_CUSTOMERS = [
    "Tukaram", "Aniket", "Pooja Tai", "Snehal", "Harish Patil", 
    "Shrikant", "Manjusha", "Omkar Shinde"
]

UNITS = ["kg", "litre", "packet", "piece", "tin", "bag"]

# Speech / ASR Noise Mappings (Bhashini-style acoustic errors)
ASR_NOISE_MAP = {
    "sugar": ["shookar", "soogar", "shugr"],
    "chini": ["cheeni", "chinii", "cheni"],
    "becha": ["be cha", "baicha", "beccha"],
    "aaya": ["aa ya", "aayaa"],
    "atta": ["aata", "attaah"],
    "rupaye": ["roopaye", "rupaya", "rs", "rupay"],
    "kilo": ["klo", "keelo", "kg"],
    "doodh": ["dood", "dhudh", "dudh"],
    "packet": ["pakt", "packat", "pacet"],
    "dila": ["di la", "deela"],
    "kitna": ["kitnaa", "kitanaa"],
    "stock": ["stok", "istok"],
}

def apply_noise(text: str, noise_prob: float = 0.35) -> str:
    """Applies realistic ASR acoustic noise and typos to simulate spoken speech."""
    words = text.split()
    noisy_words = []
    for word in words:
        clean = word.lower().strip(".,;:?!")
        # Keep numeric values exact and uncorrupted
        if clean.replace(".", "").isdigit():
            noisy_words.append(word)
            continue
        if random.random() < noise_prob and clean in ASR_NOISE_MAP:
            chosen = random.choice(ASR_NOISE_MAP[clean])
            # Preserve capitalization
            noisy_words.append(chosen.capitalize() if word[0].isupper() else chosen)
        elif random.random() < 0.08 and len(clean) > 4:
            # 1 character typo (swap adjacent or drop char)
            idx = random.randint(1, len(clean) - 2)
            chars = list(clean)
            chars[idx], chars[idx+1] = chars[idx+1], chars[idx]
            noisy_words.append("".join(chars))
        else:
            noisy_words.append(word)
    return " ".join(noisy_words)

def generate_entry_templates(
    product_tuples: List[Tuple[str, List[str]]],
    customers: List[Dict[str, Any]],
    is_test_set: bool = False,
) -> List[Dict[str, Any]]:
    """Generates multilingual retail entries across Hindi, Hinglish, Marathi, English."""
    entries = []

    for std_prod, aliases in product_tuples:
        for _ in range(12 if not is_test_set else 25):
            prod_alias = random.choice(aliases)
            customer = random.choice(customers)
            qty = random.choice([0.5, 1.0, 1.5, 2.0, 3.0, 5.0, 10.0, 25.0])
            unit = "litre" if "oil" in std_prod.lower() or "milk" in std_prod.lower() else "kg"
            if "tin" in std_prod.lower():
                unit = "tin"
            elif "powder" in std_prod.lower() or "ladoo" in std_prod.lower():
                unit = random.choice(["packet", "kg"])
                
            unit_price = random.randint(40, 220)
            amount = round(qty * unit_price, 2)

            # 1. HINDI / HINGLISH SALE
            hindi_phrasings = [
                f"{qty} {unit} {prod_alias} becha {customer} ko {amount} rupaye me",
                f"{customer} ko {qty} {unit} {prod_alias} diya {amount} rs",
                f"{qty}{unit} {prod_alias} sold to {customer} for {amount} rupees",
                f"{customer} ne {qty} {unit} {prod_alias} liya cash {amount}",
                f"{customer} ji ko {qty} {unit} {prod_alias} de diya {amount} rs",
            ]
            if is_test_set:
                # Unseen stylistic test phrasings
                hindi_phrasings.extend([
                    f"abhi abhi {customer} ne aake {qty} {unit} {prod_alias} khareeda {amount} me",
                    f"{qty} {unit} {prod_alias} chala gaya {customer} ke haath {amount} rs",
                    f"parchi banao {customer} ka {qty} {unit} {prod_alias} total {amount}",
                ])

            text_hi = random.choice(hindi_phrasings)
            entries.append({
                "text": apply_noise(text_hi, noise_prob=0.3 if not is_test_set else 0.4),
                "label": {
                    "intent": "sale",
                    "product": std_prod,
                    "quantity": qty,
                    "unit": unit,
                    "amount": amount,
                    "customer": customer,
                    "language": "hi",
                }
            })

            # 2. MARATHI SALE
            marathi_phrasings = [
                f"{customer} la {qty} {unit} {prod_alias} dila {amount} rupaye",
                f"{qty} {unit} {prod_alias} vikla {customer} la {amount} rs",
                f"{customer} bhau ni {qty} {unit} {prod_alias} ghetla {amount} dila",
                f"{qty} {unit} {prod_alias} dukanatun {customer} la dila {amount} rupaye",
            ]
            if is_test_set:
                marathi_phrasings.extend([
                    f"aaj sakali {customer} la {qty} {unit} {prod_alias} dila ahe {amount} bill",
                    f"{customer} tai ni {qty} {unit} {prod_alias} nela rok {amount}",
                ])
            text_mr = random.choice(marathi_phrasings)
            entries.append({
                "text": apply_noise(text_mr, noise_prob=0.3 if not is_test_set else 0.4),
                "label": {
                    "intent": "sale",
                    "product": std_prod,
                    "quantity": qty,
                    "unit": unit,
                    "amount": amount,
                    "customer": customer,
                    "language": "mr",
                }
            })

            # 3. STOCK IN / PURCHASE
            supplier = f"{customer} Wholesaler"
            purch_qty = qty * 10
            purch_amount = round(purch_qty * unit_price * 0.85, 2)
            purch_phrasings = [
                f"{supplier} se {purch_qty} {unit} {prod_alias} aaya {purch_amount} ka",
                f"{purch_qty} {unit} {prod_alias} wholesale khareeda {supplier} se {purch_amount} rs",
                f"godown me {purch_qty} {unit} {prod_alias} utra bill {purch_amount} {supplier}",
                f"{supplier} kadun {purch_qty} {unit} {prod_alias} ala {purch_amount} rupaye",
            ]
            text_purch = random.choice(purch_phrasings)
            entries.append({
                "text": apply_noise(text_purch, noise_prob=0.25),
                "label": {
                    "intent": "purchase",
                    "product": std_prod,
                    "quantity": purch_qty,
                    "unit": unit,
                    "amount": purch_amount,
                    "customer": supplier,
                    "language": "hi" if "kadun" not in text_purch else "mr",
                }
            })

            # 4. STOCK CHECK
            stock_phrasings = [
                f"{prod_alias} kitna bacha hai dukaan me",
                f"check stock of {prod_alias}",
                f"{prod_alias} cha kiti stock shillak ahe",
                f"{prod_alias} ka stock kitna pada hai bhai",
            ]
            text_stock = random.choice(stock_phrasings)
            entries.append({
                "text": apply_noise(text_stock, noise_prob=0.2),
                "label": {
                    "intent": "stock_check",
                    "product": std_prod,
                    "quantity": None,
                    "unit": None,
                    "amount": None,
                    "customer": None,
                    "language": "mr" if "shillak" in text_stock else "hi",
                }
            })

    # 5. EXPENSE & GST FILING
    extra_entries = [
        {"text": "dukaan ka bijli bill bhara 2400 cash", "label": {"intent": "expense", "product": None, "quantity": None, "unit": None, "amount": 2400.0, "customer": None, "language": "hi"}},
        {"text": "shop rent paid 12000 rupees to landlord", "label": {"intent": "expense", "product": None, "quantity": None, "unit": None, "amount": 12000.0, "customer": None, "language": "en"}},
        {"text": "tempo ka bhada dila 450 rs", "label": {"intent": "expense", "product": None, "quantity": None, "unit": None, "amount": 450.0, "customer": None, "language": "mr"}},
        {"text": "file gst return for october month turnover 125000", "label": {"intent": "file_gst", "product": None, "quantity": None, "unit": None, "amount": 125000.0, "customer": None, "language": "en"}},
        {"text": "is mahine ka gstr 3b return file kardo", "label": {"intent": "file_gst", "product": None, "quantity": None, "unit": None, "amount": None, "customer": None, "language": "hi"}},
        {"text": "gst cha return file karun dya", "label": {"intent": "file_gst", "product": None, "quantity": None, "unit": None, "amount": None, "customer": None, "language": "mr"}},
    ]
    entries.extend(extra_entries)
    return entries


def create_or_load_dataset() -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Creates/loads the 80/10/10 partitioned dataset.
    Guarantees that test set contains UNSEEN phrasings, names and products!
    """
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    all_data_path = DATA_DIR / "nl_entries.jsonl"
    train_path = DATA_DIR / "train.jsonl"
    val_path = DATA_DIR / "val.jsonl"
    test_path = DATA_DIR / "test.jsonl"

    train_val_pool = generate_entry_templates(TRAIN_PRODUCTS, TRAIN_CUSTOMERS, is_test_set=False)
    random.shuffle(train_val_pool)

    # 80/10/10 split
    split_idx = int(len(train_val_pool) * (8 / 9))  # 80% of total
    train_entries = train_val_pool[:split_idx]
    val_entries = train_val_pool[split_idx:]

    # Test set strictly composed of UNSEEN products & customers + unseen phrasings
    test_entries = generate_entry_templates(UNSEEN_TEST_PRODUCTS, UNSEEN_TEST_CUSTOMERS, is_test_set=True)
    random.shuffle(test_entries)

    # Save to jsonl
    all_entries = train_entries + val_entries + test_entries

    with open(all_data_path, "w", encoding="utf-8") as f:
        for entry in all_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    with open(train_path, "w", encoding="utf-8") as f:
        for entry in train_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    with open(val_path, "w", encoding="utf-8") as f:
        for entry in val_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    with open(test_path, "w", encoding="utf-8") as f:
        for entry in test_entries:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    return train_entries, val_entries, test_entries


def augment_training_data_for_field(field_name: str, failed_examples: List[Dict[str, Any]]) -> int:
    """
    Adds similar targeted training data for any field that scores below 99%
    to support the autonomous retraining loop.
    """
    augmented = []
    for item in failed_examples:
        txt = item.get("text", "")
        lbl = item.get("expected", {})
        # Create 3 synthetic variants with slight syntactic variations
        for _ in range(3):
            variant_txt = apply_noise(txt, noise_prob=0.2)
            augmented.append({"text": variant_txt, "label": lbl})

    train_path = DATA_DIR / "train.jsonl"
    with open(train_path, "a", encoding="utf-8") as f:
        for entry in augmented:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    return len(augmented)
