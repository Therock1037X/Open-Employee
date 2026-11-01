import pytest
from pathlib import Path
from pydantic import ValidationError

from ml.entry_parser.schema import BusinessEntrySchema
from ml.entry_parser.dataset import create_or_load_dataset
from ml.entry_parser.trainer import EntryParserTrainer

def test_pydantic_schema_validation():
    """Validates that valid payloads pass and invalid ones are caught."""
    valid_data = {
        "intent": "sale",
        "product": "Sugar",
        "quantity": "2.5",
        "unit": "kg",
        "amount": "110",
        "customer": "Ramesh",
        "language": "hi",
    }
    schema = BusinessEntrySchema(**valid_data)
    assert schema.intent == "sale"
    assert schema.product == "Sugar"
    assert schema.quantity == 2.5
    assert schema.amount == 110.0
    assert schema.customer == "Ramesh"

    # Invalid intent should raise ValidationError
    with pytest.raises(ValidationError):
        BusinessEntrySchema(intent="unknown_intent_type")

def test_entry_parser_accuracy_thresholds():
    """Verifies that per-field accuracy reaches >=99% on the unseen test set."""
    train_data, val_data, test_data = create_or_load_dataset()
    trainer = EntryParserTrainer()
    results = trainer.evaluate_test_set(test_data)

    field_accuracies = results["per_field_accuracy"]
    for field in ["intent", "product", "quantity", "amount", "customer"]:
        assert field in field_accuracies, f"Field {field} missing from results"
        acc = field_accuracies[field]
        assert acc >= 99.0, f"Field '{field}' accuracy is {acc}%, which is below the 99% requirement"

def test_unseen_entities_generalization():
    """Confirms parser correctly extracts entities that never appeared in train set."""
    trainer = EntryParserTrainer()
    
    # Unseen product "Besan Ladoo" and unseen customer "Tukaram"
    sample = "Tukaram bhau la 2 packet besan laddu dila 240 rupaye"
    parsed = trainer.parse_entry(sample)
    assert parsed.intent == "sale"
    assert parsed.product == "Besan Ladoo"
    assert parsed.quantity == 2.0
    assert parsed.amount == 240.0
    assert parsed.customer == "Tukaram"
