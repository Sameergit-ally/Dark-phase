"""
DarkGuard — ONNX Export Script
Exports trained scikit-learn model to ONNX format for TensorFlow.js.
"""

import os
import pickle
import numpy as np

def export_to_onnx():
    """Convert the trained model to ONNX format."""
    try:
        from skl2onnx import convert_sklearn
        from skl2onnx.common.data_types import FloatTensorType
    except ImportError:
        print("❌ skl2onnx not installed. Install with: pip install skl2onnx")
        return

    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "model.pkl")
    vec_path = os.path.join(base_dir, "vectorizer.pkl")

    if not os.path.exists(model_path) or not os.path.exists(vec_path):
        print("❌ Model files not found. Run train.py first.")
        return

    with open(model_path, "rb") as f:
        model = pickle.load(f)
    with open(vec_path, "rb") as f:
        vectorizer = pickle.load(f)

    # Get feature count
    n_features = len(vectorizer.get_feature_names_out())

    # Convert to ONNX
    initial_type = [("float_input", FloatTensorType([None, n_features]))]
    onnx_model = convert_sklearn(model, initial_types=initial_type)

    # Save ONNX file
    onnx_path = os.path.join(base_dir, "darkguard_model.onnx")
    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())

    print(f"✅ ONNX model exported to {onnx_path}")
    print(f"📏 Features: {n_features}")
    print(f"📦 Classes: {list(model.classes_)}")

    # Also save vocabulary for the extension
    vocab_path = os.path.join(base_dir, "vocabulary.json")
    import json
    vocab = {word: int(idx) for word, idx in zip(
        vectorizer.get_feature_names_out(),
        range(n_features)
    )}
    with open(vocab_path, "w") as f:
        json.dump(vocab, f)
    print(f"📖 Vocabulary saved to {vocab_path}")


if __name__ == "__main__":
    export_to_onnx()
