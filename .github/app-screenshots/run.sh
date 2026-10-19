#!/usr/bin/env bash
# Captures the native screens for the App Store set: iPhone 6.9" and iPad 13", Arabic and English.
# Output: screenshots-output/<lang>-<iphone|ipad>/<scene>.png, plus run.log and a final frame per run
# so a failed step can be seen, not guessed.
set -uo pipefail
# The XCTest driver took longer than Maestro's default to start on the second run of the first job.
export MAESTRO_DRIVER_STARTUP_TIMEOUT=240000
ROOT="$PWD"
OUT="$ROOT/screenshots-output"
FLOWS="$ROOT/.github/app-screenshots"
# Each run replaces the previous one, so nothing stale is mistaken for a fresh capture.
rm -rf "$OUT"
mkdir -p "$OUT"
exec > >(tee -a "$OUT/run.log") 2>&1

xcodebuild -version
xcrun simctl list runtimes

curl -fsSL "$APP_URL" -o /tmp/app.tar.gz
mkdir -p /tmp/app && tar -xzf /tmp/app.tar.gz -C /tmp/app
APP=$(ls -d /tmp/app/*.app | head -1)
echo "app: $APP"

# Newest iOS runtime's device whose name matches.
pick() {
  xcrun simctl list devices available -j | python3 -c '
import json, re, sys
devs = json.load(sys.stdin)["devices"]
hits = [(rt, d) for rt, lst in devs.items() if "iOS" in rt for d in lst if re.search(sys.argv[1], d["name"])]
hits.sort(key=lambda t: t[0])
print(hits[-1][1]["udid"] + " " + hits[-1][1]["name"] if hits else "")' "$1"
}
read -r IPHONE IPHONE_NAME <<<"$(pick 'iPhone 1[6-9] Pro Max')"
read -r IPAD IPAD_NAME <<<"$(pick 'iPad Pro 13')"
echo "iphone: $IPHONE $IPHONE_NAME"
echo "ipad:   $IPAD $IPAD_NAME"

capture() { # <udid> <lang> <device label>
  local U="$1" L="$2" N="$3" D="$OUT/$2-$3"
  mkdir -p "$D"
  echo "=== $L $N ($U)"
  xcrun simctl shutdown "$U" 2>/dev/null || true
  xcrun simctl erase "$U"
  xcrun simctl boot "$U" && xcrun simctl bootstatus "$U" -b
  # Gregorian calendar and Latin digits in Arabic too: the iPad status bar prints the date, and ar_SA
  # alone renders it Hijri in Arabic-Indic digits (the owner's rule is 0–9 everywhere).
  local LOC=en_US; [ "$L" = ar ] && LOC="ar_SA@calendar=gregorian;numbers=latn"
  xcrun simctl spawn "$U" defaults write "Apple Global Domain" AppleLanguages -array "$L"
  xcrun simctl spawn "$U" defaults write "Apple Global Domain" AppleLocale -string "$LOC"
  # A language change takes effect on the next boot.
  xcrun simctl shutdown "$U"
  xcrun simctl boot "$U" && xcrun simctl bootstatus "$U" -b
  xcrun simctl status_bar "$U" override --time "9:41" --dataNetwork wifi --wifiMode active --wifiBars 3 \
    --cellularMode active --cellularBars 4 --batteryState charged --batteryLevel 100 || true
  xcrun simctl ui "$U" appearance light
  xcrun simctl install "$U" "$APP"

  local ENV=()
  if [ "$L" = ar ]; then
    ENV=(-e "CONTINUE=متابعة" -e "STORES_WITH_CODES=متاجر لديها أكواد" -e "CATEGORIES=التصنيفات" -e "TAB_STORES=المتاجر"
         -e "ONTIME=ماكس فاشون" -e "FOLLOW=.*بأكواده الجديدة" -e "WHO_SUITS=لمن يناسب" -e "SHIPPING=الشحن والتوصيل"
         -e "COUPON_ID=iL7vjAgdoI6ibgBg1aC7")
  else
    ENV=(-e "CONTINUE=Continue" -e "STORES_WITH_CODES=Stores with codes" -e "CATEGORIES=Categories" -e "TAB_STORES=Stores"
         -e "ONTIME=Max Fashion" -e "FOLLOW=.*new codes" -e "WHO_SUITS=Who it suits" -e "SHIPPING=Shipping & delivery"
         -e "COUPON_ID=5cQrhlHL1U0B2HYamzkr")
  fi
  # Maestro only writes takeScreenshot files inside its own output folder; they are copied out after.
  maestro --device "$U" test --test-output-dir "$D/_maestro-main" "${ENV[@]}" "$FLOWS/main.yaml" || echo "!! main flow failed ($L $N)"
  xcrun simctl io "$U" screenshot "$D/_after-main.png" || true

  xcrun simctl ui "$U" appearance dark
  maestro --device "$U" test --test-output-dir "$D/_maestro-dark" "${ENV[@]}" "$FLOWS/dark.yaml" || echo "!! dark flow failed ($L $N)"
  xcrun simctl io "$U" screenshot "$D/_after-dark.png" || true
  xcrun simctl ui "$U" appearance light
  for f in home categories stores follow suitability policies code appearance; do
    p=$(find "$D"/_maestro-* -name "$f.png" 2>/dev/null | head -1)
    [ -n "$p" ] && cp "$p" "$D/$f.png" || echo "!! missing $f ($L $N)"
  done
  xcrun simctl shutdown "$U" || true
  ls -la "$D"
}

[ -n "$IPHONE" ] && { capture "$IPHONE" ar iphone; capture "$IPHONE" en iphone; } || echo "!! no iPhone Pro Max simulator"
[ -n "$IPAD" ] && { capture "$IPAD" ar ipad; capture "$IPAD" en ipad; } || echo "!! no iPad Pro 13 simulator"
echo "done"
