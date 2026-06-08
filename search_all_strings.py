import re
import json

file_path = r"C:\Users\jahan\.gemini\antigravity\brain\42c65725-4574-4d8b-8022-d0909dd83905\.system_generated\steps\56\content.md"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's search for "timeline" or "media" in a case-insensitive way
print("Scanning for timeline media keys...")
matches = re.findall(r'"(edge_owner_to_timeline_media|edge_saved_media|timeline_media)"', content)
print("Matches found:", matches)

# Let's search for strings that look like captions or descriptions
# Instagram JSON structure: {"node": {"text": "..."}}
# Let's look for "node" structures containing "text"
# Let's search for the word "node" and print the next 200 characters
nodes = re.findall(r'"node"\s*:\s*\{([^}]+)\}', content)
print("Found 'node' blocks:", len(nodes))
for i, node in enumerate(nodes[:20]):
    print(f"Node {i}: {node[:120]}")

# Let's search for any RERA number, phone, email, price or location in the whole file
print("\nScanning for project keywords in the entire file:")
keywords = ["rera", "pr/gj", "Vaishno", "Circle", "Gota", "Ahmedabad", "BHK", "Developer", "Lakh", "Crore", "price", "contact", "phone", "email"]
for kw in keywords:
    matches_kw = re.findall(rf'([^"\n]*?{kw}[^"\n]*)', content, re.IGNORECASE)
    if matches_kw:
        print(f"Keyword '{kw}' matches ({len(matches_kw)}):")
        for m in list(set(matches_kw))[:5]:
            print("  -", m.strip()[:150])
