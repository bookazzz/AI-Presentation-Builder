import asyncio, json, os
import httpx

BASE = "http://localhost:8000/api"

async def main():
    async with httpx.AsyncClient() as cl:
        # Login
        r = await cl.post(f"{BASE}/auth/login", json={"email":"test-open@test.com","password":"Test123"})
        token = r.json()["access_token"]
        print(f"Token: {token[:20]}...")
        
        # Create presentation
        r = await cl.post(f"{BASE}/presentations", json={
            "title": "Отчёт по продажам 2024",
            "source_text": "Продажи компании выросли на 20% в 2024 году. Основной рост обеспечили регионы: Москва +25%, СПб +30%, регионы +15%. Запущен новый продукт AI Analytics, который принёс 5 млн выручки. Retention улучшился с 75% до 82%. Плановый показатель на 2025 год — рост 30%.",
            "presentation_type": "business",
            "audience": "director",
            "style": "business",
            "language": "ru",
            "slides_count": 8
        }, headers={"Authorization": f"Bearer {token}"})
        pres = r.json()
        pres_id = pres.get("id")
        print(f"Created: {pres_id}")
        
        # Generate outline
        print("\n=== Generating outline... ===")
        r = await cl.post(f"{BASE}/presentations/{pres_id}/generate-outline", 
                         json={"slides_count": 8},
                         headers={"Authorization": f"Bearer {token}"},
                         timeout=120)
        outline_data = r.json()
        print(f"Outline status: {r.status_code}")
        print(f"Response: {json.dumps(outline_data, ensure_ascii=False)[:300]}")
        
        # Get presentation with outline
        r = await cl.get(f"{BASE}/presentations/{pres_id}",
                        headers={"Authorization": f"Bearer {token}"})
        data = r.json()
        print(f"\nPresentation status: {data.get('status')}")
        
        pres_json = data.get("presentation_json")
        if isinstance(pres_json, str):
            pres_json = json.loads(pres_json)
        if isinstance(pres_json, dict) and "slides" in pres_json:
            print(f"Slides count: {len(pres_json['slides'])}")
            for s in pres_json["slides"]:
                content_preview = ""
                if s.get("content"):
                    content_preview = " | " + s["content"][0][:50]
                print(f"  [{s.get('type','?')}] {s.get('title','?')}{content_preview}")
        
        # Generate full slides
        print("\n=== Generating full slides... ===")
        r = await cl.post(f"{BASE}/presentations/{pres_id}/generate-slides",
                         headers={"Authorization": f"Bearer {token}"},
                         timeout=120)
        print(f"Slides gen: {r.status_code}")
        print(f"Response: {json.dumps(r.json(), ensure_ascii=False)[:300]}")
        
        # Export PPTX
        print("\n=== Exporting PPTX... ===")
        r = await cl.post(f"{BASE}/presentations/{pres_id}/export/pptx",
                         headers={"Authorization": f"Bearer {token}"},
                         timeout=60)
        print(f"PPTX export: {r.status_code}")
        print(f"Response: {json.dumps(r.json(), ensure_ascii=False)[:300]}")
        
        # Export PDF
        print("\n=== Exporting PDF... ===")
        r = await cl.post(f"{BASE}/presentations/{pres_id}/export/pdf",
                         headers={"Authorization": f"Bearer {token}"},
                         timeout=60)
        print(f"PDF export: {r.status_code}")
        print(f"Response: {json.dumps(r.json(), ensure_ascii=False)[:300]}")
        
        print("\n=== Done! ===")

asyncio.run(main())
