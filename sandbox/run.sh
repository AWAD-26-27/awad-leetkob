#!/bin/sh
set -eu

# stdin contains exactly $1 bytes of source followed by the test input.
/usr/bin/head -c "$1" > /work/submission.cpp
[ "$(/usr/bin/wc -c < /work/submission.cpp)" -eq "$1" ]

if ! /usr/bin/env -i PATH=/usr/bin:/bin HOME=/work LANG=C.UTF-8 TMPDIR=/tmp \
  /usr/bin/g++ -std=c++17 -O2 -pipe /work/submission.cpp -o /work/submission \
  </dev/null >&2; then
  exit 42
fi

# The runner consumes this byte before comparing the program's stdout.
printf '\001'
exec /usr/bin/env -i PATH=/usr/bin:/bin HOME=/work LANG=C.UTF-8 TMPDIR=/tmp /work/submission
