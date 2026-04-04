"""
DarkGuard — ML Training Script
Trains a TF-IDF + LinearSVC dark pattern classifier.
"""

import os
import pickle
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

# Training data — curated examples per pattern type
TRAINING_DATA = [
    # FAKE_URGENCY
    ("Only 2 left in stock - order soon", "FAKE_URGENCY"),
    ("Sale ends in 00:15:32", "FAKE_URGENCY"),
    ("Limited time offer! Hurry!", "FAKE_URGENCY"),
    ("3 people are viewing this right now", "FAKE_URGENCY"),
    ("This deal expires at midnight!", "FAKE_URGENCY"),
    ("Selling fast! Only 1 left!", "FAKE_URGENCY"),
    ("केवल 2 बचे हैं - जल्दी ऑर्डर करें", "FAKE_URGENCY"),
    ("सीमित समय ऑफर", "FAKE_URGENCY"),
    ("Don't miss out! 87% claimed!", "FAKE_URGENCY"),
    ("Last chance to buy at this price", "FAKE_URGENCY"),

    # HIDDEN_CHARGES
    ("Service fee: ₹49 (added at checkout)", "HIDDEN_CHARGES"),
    ("Convenience fee may apply", "HIDDEN_CHARGES"),
    ("Processing fee of $2.99", "HIDDEN_CHARGES"),
    ("Handling charges extra", "HIDDEN_CHARGES"),
    ("Additional packaging fee ₹30", "HIDDEN_CHARGES"),
    ("Platform fee will be added", "HIDDEN_CHARGES"),
    ("सेवा शुल्क: ₹49", "HIDDEN_CHARGES"),
    ("Extra charges for priority delivery", "HIDDEN_CHARGES"),

    # ROACH_MOTEL
    ("To cancel, please call our support line", "ROACH_MOTEL"),
    ("Cancellation requires written notice 30 days prior", "ROACH_MOTEL"),
    ("Contact customer care to unsubscribe", "ROACH_MOTEL"),
    ("You cannot cancel your subscription online", "ROACH_MOTEL"),
    ("To delete your account, send an email to support", "ROACH_MOTEL"),
    ("Cancellation fee of $50 applies", "ROACH_MOTEL"),

    # TRICK_QUESTION
    ("Uncheck this box if you prefer not to receive emails", "TRICK_QUESTION"),
    ("Do you not want to opt out of notifications?", "TRICK_QUESTION"),
    ("Select 'No' if you don't want to not receive updates", "TRICK_QUESTION"),
    ("I disagree with opting out of marketing", "TRICK_QUESTION"),

    # COOKIE_MANIPULATION
    ("Accept All Cookies", "COOKIE_MANIPULATION"),
    ("We use cookies. By continuing, you agree.", "COOKIE_MANIPULATION"),
    ("Accept cookies to continue browsing", "COOKIE_MANIPULATION"),
    ("Reject is hidden in settings > privacy > advanced", "COOKIE_MANIPULATION"),

    # CONFIRMSHAMING
    ("No thanks, I don't want to save money", "CONFIRMSHAMING"),
    ("I'll pass on this amazing deal", "CONFIRMSHAMING"),
    ("No, I prefer paying full price", "CONFIRMSHAMING"),
    ("I don't need protection from dark patterns", "CONFIRMSHAMING"),
    ("No thanks, I hate saving", "CONFIRMSHAMING"),

    # BAIT_SWITCH
    ("Price changed from ₹499 to ₹899", "BAIT_SWITCH"),
    ("The item you selected is no longer available at that price", "BAIT_SWITCH"),
    ("Product has been substituted", "BAIT_SWITCH"),
    ("This offer has been updated since you last viewed it", "BAIT_SWITCH"),

    # MISDIRECTION
    ("★ Recommended ★ Premium Plan (pre-selected)", "MISDIRECTION"),
    ("Best value! (highlighted option)", "MISDIRECTION"),
    ("Protection plan added to your cart", "MISDIRECTION"),
    ("Insurance already included for your safety", "MISDIRECTION"),
    ("Default: Premium membership selected", "MISDIRECTION"),
]


def train_model():
    """Train and save the dark pattern classifier."""
    texts = [t[0] for t in TRAINING_DATA]
    labels = [t[1] for t in TRAINING_DATA]

    # Create TF-IDF features
    vectorizer = TfidfVectorizer(
        max_features=5000,
        ngram_range=(1, 3),
        stop_words="english",
    )

    X = vectorizer.fit_transform(texts)
    y = np.array(labels)

    # Train classifier
    model = LinearSVC(max_iter=1000, C=1.0)
    model.fit(X, y)

    # Evaluate
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    model_eval = LinearSVC(max_iter=1000, C=1.0)
    model_eval.fit(X_train, y_train)
    y_pred = model_eval.predict(X_test)
    print("\n📊 Model Evaluation:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # Save model and vectorizer
    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, "model.pkl")
    vec_path = os.path.join(output_dir, "vectorizer.pkl")

    with open(model_path, "wb") as f:
        pickle.dump(model, f)
    with open(vec_path, "wb") as f:
        pickle.dump(vectorizer, f)

    print(f"\n✅ Model saved to {model_path}")
    print(f"✅ Vectorizer saved to {vec_path}")
    print(f"📈 Classes: {list(model.classes_)}")


if __name__ == "__main__":
    train_model()
