#!/usr/bin/env python3
"""QA test script for billing API."""
import json
import sys
import urllib.request
import urllib.error

BASE = "http://localhost:8000/api"

passed = 0
failed = 0

def test(name, method, path, body=None, token=None, expected_status=None, expected_contains=None):
    global passed, failed
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    
    try:
        resp = urllib.request.urlopen(req)
        status = resp.status
        resp_data = json.loads(resp.read().decode())
        ok = True
        if expected_status and status != expected_status:
            ok = False
            msg = f"status {status} != expected {expected_status}"
        elif expected_contains and expected_contains not in str(resp_data):
            ok = False
            msg = f"missing '{expected_contains}' in response"
        else:
            msg = "OK"
        
        if ok:
            passed += 1
            print(f"  ✓ {name}: {msg}")
        else:
            failed += 1
            print(f"  ✗ {name}: {msg}")
            print(f"    Response: {json.dumps(resp_data, indent=2)[:200]}")
        return resp_data
    except urllib.error.HTTPError as e:
        status = e.code
        try:
            resp_data = json.loads(e.read().decode())
        except:
            resp_data = {"raw": str(e)}
        
        ok = True
        if expected_status and status != expected_status:
            ok = False
            msg = f"status {status} != expected {expected_status}"
        else:
            msg = f"HTTP {status} (expected)"
        
        if ok:
            passed += 1
            print(f"  ✓ {name}: {msg}")
        else:
            failed += 1
            print(f"  ✗ {name}: {msg}")
            print(f"    Response: {json.dumps(resp_data, indent=2)[:200]}")
        return resp_data
    except Exception as e:
        failed += 1
        print(f"  ✗ {name}: {e}")
        return None


print("\n=== QA: Billing API ===\n")

# 1. GET /plans (public)
print("1. GET /api/billing/plans")
plans = test("List plans (no auth)", "GET", "/billing/plans")
if plans:
    plan_ids = {p["name"]: p["id"] for p in plans}
    print(f"   Plans found: {', '.join(plan_ids.keys())}")
    
    # Verify prices
    assert plans[0]["price"] == 0, "Free should be first with 0 price"
    print(f"   ✓ Free plan price=0")

# 2. Register user
print("\n2. Register user")
user = test("Register", "POST", "/auth/register", 
            body={"email": "qa.billing@test.ru", "password": "TestPass123!", "name": "QA Billing"})
token = user.get("access_token") if user else None

# 3. GET /history (authenticated, empty)
print("\n3. GET /api/billing/history")
test("Payment history (empty)", "GET", "/billing/history", token=token, expected_status=200)

# 4. POST /checkout (free plan - should return 400 since it's free)
print("\n4. Checkout - Free plan")
free_id = plan_ids.get("Free", "")
test("Free plan checkout", "POST", "/billing/checkout",
     body={"plan_id": free_id}, token=token, expected_status=400,
     expected_contains="free")

# 5. POST /checkout (paid plan - no YooKassa keys -> 502)
print("\n5. Checkout - Start plan (no YooKassa keys)")
start_id = plan_ids.get("Start", "")
test("Start plan checkout (no keys)", "POST", "/billing/checkout",
     body={"plan_id": start_id}, token=token, expected_status=502,
     expected_contains="Payment gateway error")

# 6. POST /checkout (no auth -> 401)
print("\n6. Checkout without auth")
test("Checkout no auth", "POST", "/billing/checkout",
     body={"plan_id": start_id}, expected_status=401)

# 7. POST /checkout (invalid plan_id -> 404)
print("\n7. Checkout invalid plan")
test("Checkout invalid plan", "POST", "/billing/checkout",
     body={"plan_id": "non-existent-id"}, token=token, expected_status=404)

# 8. POST /webhook (malformed payload)
print("\n8. Webhook - malformed")
test("Webhook malformed", "POST", "/billing/webhook",
     body={"not": "a valid event"}, expected_status=200)  # returns 200 always

# 9. POST /webhook (success event)
print("\n9. Webhook - payment.succeeded (no matching payment)")
test("Webhook succeeded (no payment)", "POST", "/billing/webhook",
     body={"event": "payment.succeeded", "object": {"id": "fake-id-123", "status": "succeeded", "metadata": {}}},
     expected_status=200)

# Summary
print(f"\n{'='*40}")
print(f"QA Results: {passed} passed, {failed} failed out of {passed+failed} tests")
if failed == 0:
    print("✓ ALL TESTS PASSED")
else:
    print(f"✗ {failed} TEST(S) FAILED")

sys.exit(0 if failed == 0 else 1)
