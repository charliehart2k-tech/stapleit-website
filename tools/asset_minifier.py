"""Offline production minifier for Staple IT assets.

CSS is tokenised with vendored tinycss2, so comments/whitespace are handled
without regex-parsing CSS syntax. JavaScript uses a conservative lexical scanner
that preserves strings, template literals and regular-expression literals, then
removes comments and only whitespace that is provably unnecessary between tokens.

The liquidGL vendor file is intentionally excluded from this tool so its pinned
SHA-256 remains unchanged.
"""
from __future__ import annotations

from pathlib import Path
import sys

sys.dont_write_bytecode = True
VENDOR = Path(__file__).resolve().parent / 'vendor' / 'python'
if str(VENDOR) not in sys.path:
    sys.path.insert(0, str(VENDOR))

import tinycss2  # type: ignore
from tinycss2.ast import (  # type: ignore
    WhitespaceToken,
    CurlyBracketsBlock,
    SquareBracketsBlock,
    ParenthesesBlock,
    FunctionBlock,
)


def _css_min_tokens(tokens):
    # First recurse into nested blocks/functions.
    for token in tokens:
        if isinstance(token, (CurlyBracketsBlock, SquareBracketsBlock, ParenthesesBlock)):
            token.content = _css_min_tokens(token.content)
        elif isinstance(token, FunctionBlock):
            token.arguments = _css_min_tokens(token.arguments)

    out = []
    for token in tokens:
        if isinstance(token, WhitespaceToken):
            # Collapse any run to one token. Its final keep/drop decision is
            # made when the next non-whitespace token is known.
            if not out or isinstance(out[-1], WhitespaceToken):
                continue
            token.value = ' '
            out.append(token)
            continue
        out.append(token)

    # Remove whitespace that is always redundant around CSS punctuation and
    # immediately before/after blocks. Descendant-selector spaces are left in
    # place, and + / - are deliberately untouched because calc() needs them.
    cleaned = []
    n = len(out)
    for i, token in enumerate(out):
        if not isinstance(token, WhitespaceToken):
            cleaned.append(token)
            continue
        prev = out[i - 1] if i else None
        nxt = out[i + 1] if i + 1 < n else None
        prev_lit = getattr(prev, 'value', None) if prev else None
        next_lit = getattr(nxt, 'value', None) if nxt else None
        if prev is None or nxt is None:
            continue
        if prev_lit in {':', ';', ','} or next_lit in {':', ';', ','}:
            continue
        if isinstance(prev, (CurlyBracketsBlock, SquareBracketsBlock, ParenthesesBlock)):
            continue
        if isinstance(nxt, (CurlyBracketsBlock, SquareBracketsBlock, ParenthesesBlock)):
            continue
        cleaned.append(token)
    return cleaned


def minify_css(text: str) -> str:
    tokens = tinycss2.parse_component_value_list(text, skip_comments=True)
    tokens = _css_min_tokens(tokens)
    return tinycss2.serialize(tokens).strip() + '\n'


# --- conservative JavaScript lexical minifier ---------------------------------
_WORD_START = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$')
_WORD = _WORD_START | set('0123456789')

# Tokens after which a slash may begin a regular-expression literal.
_REGEX_PREFIX_WORDS = {
    'return', 'throw', 'case', 'delete', 'void', 'typeof', 'instanceof',
    'in', 'of', 'yield', 'await', 'else', 'do',
}
_REGEX_PREFIX_PUNCT = {
    '(', '[', '{', ',', ':', ';', '=', '==', '===', '!=', '!==', '!', '?',
    '&&', '||', '??', '=>', '+', '-', '*', '%', '&', '|', '^', '~', '<',
    '>', '<=', '>=', '+=', '-=', '*=', '%=', '&=', '|=', '^=', '??=', '&&=',
    '||=',
}
_OPERATORS = sorted({
    '===','!==','>>>','**=','&&=','||=','??=','>>>','<<=','>>=','=>','==','!=',
    '<=','>=','++','--','&&','||','??','?.','**','+=','-=','*=','/=','%=','&=',
    '|=','^=','<<','>>','...',
}, key=len, reverse=True)


def _scan_string(src: str, i: int, quote: str):
    start = i
    i += 1
    while i < len(src):
        c = src[i]
        if c == '\\':
            i += 2
            continue
        i += 1
        if c == quote:
            break
    return src[start:i], i


def _scan_template(src: str, i: int):
    # Preserve template literals byte-for-byte. This is intentionally
    # conservative: embedded ${...} whitespace is left alone instead of
    # risking a broken nested expression.
    start = i
    i += 1
    while i < len(src):
        c = src[i]
        if c == '\\':
            i += 2
            continue
        i += 1
        if c == '`':
            break
    return src[start:i], i


def _scan_regex(src: str, i: int):
    start = i
    i += 1
    in_class = False
    while i < len(src):
        c = src[i]
        if c == '\\':
            i += 2
            continue
        if c == '[':
            in_class = True
        elif c == ']':
            in_class = False
        elif c == '/' and not in_class:
            i += 1
            while i < len(src) and src[i].isalpha():
                i += 1
            break
        i += 1
    return src[start:i], i


def _previous_significant(tokens):
    for kind, value in reversed(tokens):
        if kind not in {'ws', 'comment'}:
            return kind, value
    return None, None


def _slash_is_regex(tokens):
    kind, value = _previous_significant(tokens)
    if value is None:
        return True
    if kind == 'word' and value in _REGEX_PREFIX_WORDS:
        return True
    if kind == 'punct' and value in _REGEX_PREFIX_PUNCT:
        return True
    return False


def _js_tokens(src: str):
    tokens = []
    i = 0
    n = len(src)
    while i < n:
        c = src[i]
        if c.isspace():
            j = i + 1
            while j < n and src[j].isspace():
                j += 1
            tokens.append(('ws', ' '))
            i = j
            continue
        if c in {'"', "'"}:
            value, i = _scan_string(src, i, c)
            tokens.append(('literal', value))
            continue
        if c == '`':
            value, i = _scan_template(src, i)
            tokens.append(('literal', value))
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '/':
            j = src.find('\n', i + 2)
            i = n if j < 0 else j
            tokens.append(('comment', ''))
            continue
        if c == '/' and i + 1 < n and src[i + 1] == '*':
            j = src.find('*/', i + 2)
            i = n if j < 0 else j + 2
            tokens.append(('comment', ''))
            continue
        if c == '/' and _slash_is_regex(tokens):
            value, i = _scan_regex(src, i)
            tokens.append(('literal', value))
            continue
        if c in _WORD_START:
            j = i + 1
            while j < n and src[j] in _WORD:
                j += 1
            tokens.append(('word', src[i:j]))
            i = j
            continue
        if c.isdigit() or (c == '.' and i + 1 < n and src[i + 1].isdigit()):
            j = i + 1
            while j < n and (src[j].isalnum() or src[j] in '._xX+-'):
                # Stop +/- unless it belongs to an exponent.
                if src[j] in '+-' and src[j - 1] not in 'eE':
                    break
                j += 1
            tokens.append(('number', src[i:j]))
            i = j
            continue
        op = None
        for candidate in _OPERATORS:
            if src.startswith(candidate, i):
                op = candidate
                break
        if op:
            tokens.append(('punct', op))
            i += len(op)
        else:
            tokens.append(('punct', c))
            i += 1
    return tokens


def _needs_space(prev, nxt):
    if prev is None or nxt is None:
        return False
    pk, pv = prev
    nk, nv = nxt
    if pk in {'word', 'number'} and nk in {'word', 'number'}:
        return True
    # Prevent accidental ++ / -- creation when two separate operators meet.
    if pv.endswith('+') and nv.startswith('+'):
        return True
    if pv.endswith('-') and nv.startswith('-'):
        return True
    # A numeric literal followed by a dot can become a different token.
    if pk == 'number' and nv.startswith('.'):
        return True
    return False


def minify_js(text: str) -> str:
    raw = _js_tokens(text)
    significant = [(k, v) for k, v in raw if k not in {'ws', 'comment'}]
    output = []
    sig_index = 0
    pending_space = False
    prev_sig = None
    for kind, value in raw:
        if kind in {'ws', 'comment'}:
            pending_space = True
            continue
        next_sig = significant[sig_index]
        sig_index += 1
        if pending_space and _needs_space(prev_sig, next_sig):
            output.append(' ')
        output.append(value)
        prev_sig = next_sig
        pending_space = False
    return ''.join(output).strip() + '\n'


def minify_file(src: Path, dst: Path | None = None) -> tuple[int, int]:
    dst = dst or src
    text = src.read_text(encoding='utf-8')
    if src.suffix.lower() == '.css':
        result = minify_css(text)
    elif src.suffix.lower() == '.js':
        result = minify_js(text)
    else:
        raise ValueError(f'Unsupported asset type: {src}')
    dst.write_text(result, encoding='utf-8')
    return len(text.encode('utf-8')), len(result.encode('utf-8'))


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('files', nargs='+')
    args = parser.parse_args()
    for name in args.files:
        path = Path(name)
        before, after = minify_file(path)
        saving = (1 - after / before) * 100 if before else 0
        print(f'{path}: {before} -> {after} bytes ({saving:.1f}% smaller)')
