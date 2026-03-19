import json
import os
import time
import sys
from deep_translator import GoogleTranslator

# Fix Windows console unicode issues
sys.stdout.reconfigure(encoding='utf-8')
import time
from deep_translator import GoogleTranslator

# Function to translate html text while keeping it roughly intact
def translate_html(html_content, dest='en', src='ar'):
    if not html_content or html_content.strip() == '':
        return ''
    
    # Split by common block tags if too long
    if len(html_content) > 4000:
        parts = html_content.split('<h2>')
        result_parts = []
        for i, p in enumerate(parts):
            chunk = ('<h2>' if i > 0 else '') + p
            if len(chunk) > 4000:
                # Emergency further split
                subparts = chunk.split('<p>')
                for j, sp in enumerate(subparts):
                    subchunk = ('<p>' if j > 0 else '') + sp
                    if subchunk.strip():
                        try:
                            result_parts.append(GoogleTranslator(source=src, target=dest).translate(subchunk))
                        except Exception as e:
                            result_parts.append(subchunk)
                        time.sleep(1)
            elif chunk.strip():
                try:
                    result_parts.append(GoogleTranslator(source=src, target=dest).translate(chunk))
                except Exception as e:
                    result_parts.append(chunk)
                time.sleep(1)
        return ''.join(filter(None, result_parts))

    # Try one shot translation
    try:
        translated = GoogleTranslator(source=src, target=dest).translate(html_content)
        return translated if translated else html_content
    except Exception as e:
        print(f"Translation error: {e}")
        return html_content

def main():
    json_path = os.path.join(os.path.dirname(__file__), 'store-articles.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        stores = json.load(f)

    updates = 0
    print(f"Loaded {len(stores)} stores.")

    for i, store in enumerate(stores):
        name = store.get('nameEn', store.get('name'))
        desc_en = store.get('longDescriptionEn', '')
        
        # Skip already translated (length > 300)
        if desc_en and len(desc_en) > 300:
            print(f"[{i+1}/{len(stores)}] Skipping {name} - already translated.")
            continue
            
        print(f"[{i+1}/{len(stores)}] Translating article for {name}...")
        
        ar_desc = store.get('longDescription', '')
        # Remove the >4500 error block and translate directly since the chunking handles it
        
        translated = translate_html(ar_desc)
        
        if translated and translated != ar_desc:
            store['longDescriptionEn'] = translated
            updates += 1
            print(f"   -> Successfully translated! length: {len(translated)}")
            
            # Save progressively
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(stores, f, ensure_ascii=False, indent=2)
                
        else:
            print("   -> Failed or no output.")
            
        time.sleep(3) # Wait between requests

    if updates > 0:
        print(f"Translated {updates} new articles into store-articles.json.")
        print("Now we need to run a node script to push to Firebase.")
    else:
        print("No new translations.")

if __name__ == "__main__":
    main()
