# Browser support

Staple IT targets the latest two stable releases of Chromium-based browsers
(Edge and Chrome) and Firefox, plus Safari 16 and later on macOS, iPhone and
iPad. Legacy Internet Explorer is not supported.

The core site must remain fully usable without WebGL and without the optional
liquidGL proof of concept. liquidGL is currently default-off and limited to the
small Free IT Audit lens when explicitly enabled. CSS glass is the supported
fallback everywhere.

Features should be implemented with progressive enhancement: if a browser does
not support a decorative effect, navigation, content, forms and calls to action
must still work normally.
