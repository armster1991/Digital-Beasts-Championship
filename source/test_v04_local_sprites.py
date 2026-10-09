from pathlib import Path
import base64,re,hashlib
ROOT=Path(__file__).resolve().parents[1]
js=(ROOT/'assets/sprite-data.js').read_text(encoding='utf-8')
m=re.search(r"const DBC_PENC_SPRITE_DATA='data:image/png;base64,([^']+)';",js)
assert m, 'embedded Pendulum Color atlas constant missing'
decoded=base64.b64decode(m.group(1))
actual=(ROOT/'assets/penc-sprites.png').read_bytes()
assert decoded==actual, 'embedded Pendulum Color atlas differs from assets/penc-sprites.png'
sprites=(ROOT/'sprites.js').read_text(encoding='utf-8')
assert "DBC_PENC_SPRITE_DATA" in sprites, 'sprites.js does not use embedded Pendulum Color atlas'
print('PASS v0.4 local sprites: embedded Pendulum Color atlas matches PNG byte-for-byte; file:// canvas preprocessing no longer depends on an external image origin.')
