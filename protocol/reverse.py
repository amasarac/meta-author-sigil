import regex as re
from unicodedata import category

# Grapheme clusters (handles emoji, diacritics): \X is supported by `regex` lib
GRAPHEME = re.compile(r"\X", re.U)

def reverse_graphemes(text: str) -> str:
    return "".join(reversed(GRAPHEME.findall(text)))

def reverse_words(text: str) -> str:
    # split on Unicode whitespace while preserving spacing in output shape
    tokens = re.findall(r"\S+|\s+", text, flags=re.U)
    tokens_rev = []
    buf = []
    for t in tokens:
        if t.isspace():
            if buf:
                tokens_rev.extend(reversed(buf)); buf=[]
            tokens_rev.append(t)
        else:
            buf.append(t)
    if buf:
        tokens_rev.extend(reversed(buf))
    return "".join(tokens_rev)

def is_palindrome(text: str) -> bool:
    # compare by grapheme, ignoring spaces/punctuation categories Z* and P*
    g = [g for g in GRAPHEME.findall(text) if category(g[0])[0] not in {"Z","P"}]
    return g == list(reversed(g))
