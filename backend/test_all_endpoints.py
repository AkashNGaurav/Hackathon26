import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db import SessionLocal
from app.models import User

client = TestClient(app)


def ensure_test_user():
    db = SessionLocal()
    user = db.query(User).filter(User.username == "test_alloc_user").first()
    if not user:
        user = User(
            email="test_alloc@example.com",
            username="test_alloc_user",
            hashed_password="hashed_pwd_123",
            country="Germany",
            kyc_completed=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    db.close()
    return user


def test_all():
    print("==================================================")
    print("           API ENDPOINTS TEST RUNNER              ")
    print("==================================================\n")

    # 1. Health Check
    res = client.get("/api/health")
    assert res.status_code == 200
    print(f"[PASS] 1. GET /api/health -> Status: {res.status_code}, Response: {res.json()}")

    # --- USER REGISTRATION TEST ---
    print("\n--------------------------------------------------")
    print("        TESTING USER REGISTRATION (AUTH)          ")
    print("--------------------------------------------------")
    reg_payload = {
        "email": "user@example.com",
        "username": "finsight_user",
        "password": "StrongPassword123!",
        "country": "Germany"
    }

    # Clean up existing test user if present
    db = SessionLocal()
    db.query(User).filter(User.username == "finsight_user").delete()
    db.commit()
    db.close()

    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code == 201
    reg_data = res_reg.json()
    assert "access_token" in reg_data
    assert reg_data["token_type"] == "bearer"
    assert reg_data["user"]["email"] == "user@example.com"
    assert reg_data["user"]["username"] == "finsight_user"
    assert reg_data["user"]["country"] == "Germany"
    assert reg_data["user"]["kyc_completed"] is False
    print(f"[PASS] POST /api/auth/register -> Status: 201 Created")
    print(f"       Access Token: {reg_data['access_token'][:30]}...")
    print(f"       User Profile: {reg_data['user']}")

    # Decode and verify JWT claims
    from app.auth_utils import decode_access_token
    claims = decode_access_token(reg_data["access_token"])
    assert claims["sub"] == "finsight_user"
    assert claims["email"] == "user@example.com"
    assert "user_id" in claims
    assert "exp" in claims
    assert "iat" in claims
    print(f"[PASS] JWT Token Decoded Claims: {claims}")

    # Test Duplicate Registration
    res_dup = client.post("/api/auth/register", json=reg_payload)
    assert res_dup.status_code == 400
    print(f"[PASS] Duplicate User Registration -> Status: {res_dup.status_code} (400 Bad Request as expected)")
    print("--------------------------------------------------\n")


    # 2. Recommendations
    res = client.get("/api/recommendations?risk_profile=moderate&investment_horizon=5")
    assert res.status_code == 200
    print(f"[PASS] 2. GET /api/recommendations -> Status: {res.status_code}")

    # 3. Sentiment Analysis
    res = client.get("/api/sentiment")
    assert res.status_code == 200
    print(f"[PASS] 3. GET /api/sentiment -> Status: {res.status_code}")

    # 4. List Expenses
    res = client.get("/api/expenses")
    assert res.status_code == 200
    print(f"[PASS] 4. GET /api/expenses -> Status: {res.status_code}, Count: {len(res.json())}")

    # 5. Create Expense
    expense_payload = {
        "category": "Stocks Investment",
        "amount": 500.0,
        "currency": "EUR",
        "description": "Test expense entry"
    }
    res = client.post("/api/expenses", json=expense_payload)
    assert res.status_code == 200
    print(f"[PASS] 5. POST /api/expenses -> Status: {res.status_code}, Created Expense ID: {res.json().get('id')}")

    # 6. Create Asset
    asset_payload = {
        "asset_code": "INFY_IN",
        "asset_name": "Infosys Limited",
        "asset_type": "STOCKS",
        "issuer": "Infosys Ltd",
        "symbol": "INFY",
        "exchange": "NSE",
        "currency": "INR",
        "current_price": "1550.7500",
        "risk_level": "MODERATE",
        "logo_url": "https://example.com/infosys.png",
        "is_active": True
    }
    res_create_asset = client.post("/api/assets", json=asset_payload)
    assert res_create_asset.status_code == 201
    created_asset = res_create_asset.json()
    created_asset_id = created_asset["id"]
    print(f"[PASS] 6. POST /api/assets -> Status: {res_create_asset.status_code}, Created Asset ID: {created_asset_id}")

    # 7. List Assets
    res = client.get("/api/assets?asset_type=STOCKS")
    assert res.status_code == 200
    print(f"[PASS] 7. GET /api/assets -> Status: {res.status_code}, Returned Assets Count: {len(res.json())}")

    # 8. Get Asset by ID
    res = client.get(f"/api/assets/{created_asset_id}")
    assert res.status_code == 200
    print(f"[PASS] 8. GET /api/assets/{{id}} -> Status: {res.status_code}, Asset Name: {res.json()['asset_name']}")

    # 9. Update Asset
    update_payload = {"current_price": "1600.0000", "risk_level": "HIGH"}
    res = client.put(f"/api/assets/{created_asset_id}", json=update_payload)
    assert res.status_code == 200
    assert res.json()["current_price"] == "1600.0000"
    print(f"[PASS] 9. PUT /api/assets/{{id}} -> Status: {res.status_code}, Updated Price: {res.json()['current_price']}")

    # --- ASSET ALLOCATION TESTS ---
    print("\n--------------------------------------------------")
    print("        TESTING ASSET ALLOCATION ENDPOINTS        ")
    print("--------------------------------------------------")
    test_user = ensure_test_user()

    alloc_payload = {
        "user_id": str(test_user.id),
        "asset_id": created_asset_id,
        "quantity": "25.0000",
        "average_buy_price": "1500.0000",
        "current_value": "40000.0000"
    }

    # 10. POST /api/asset-allocations
    res_alloc = client.post("/api/asset-allocations", json=alloc_payload)
    assert res_alloc.status_code == 201
    alloc_data = res_alloc.json()
    alloc_id = alloc_data["id"]
    # Verify auto-calculated invested_amount (25 * 1500 = 37500)
    assert float(alloc_data["invested_amount"]) == 37500.0
    print(f"[PASS] 10. POST /api/asset-allocations -> Status: 201 Created, Alloc ID: {alloc_id}, Auto Invested Amount: {alloc_data['invested_amount']}")

    # 11. GET /api/asset-allocations
    res_list_alloc = client.get(f"/api/asset-allocations?user_id={test_user.id}")
    assert res_list_alloc.status_code == 200
    print(f"[PASS] 11. GET /api/asset-allocations -> Status: 200 OK, Returned Count: {len(res_list_alloc.json())}")

    # 12. GET /api/asset-allocations/{id}
    res_get_alloc = client.get(f"/api/asset-allocations/{alloc_id}")
    assert res_get_alloc.status_code == 200
    assert res_get_alloc.json()["user_id"] == str(test_user.id)
    print(f"[PASS] 12. GET /api/asset-allocations/{{id}} -> Status: 200 OK, User ID: {res_get_alloc.json()['user_id']}")

    # 13. Delete Asset (will cascade or cleanup)
    res = client.delete(f"/api/assets/{created_asset_id}")
    assert res.status_code == 200
    print(f"[PASS] 13. DELETE /api/assets/{{id}} -> Status: {res.status_code}")

    print("\n--------------------------------------------------")
    print("        RUNNING INPUT VALIDATION TESTS            ")
    print("--------------------------------------------------")

    # V1. Test Invalid Asset Type Enum
    bad_enum_payload = asset_payload.copy()
    bad_enum_payload["asset_type"] = "INVALID_ENUM_TYPE"
    res = client.post("/api/assets", json=bad_enum_payload)
    assert res.status_code == 422
    print(f"[PASS] V1. Invalid Asset Type Enum -> Status: {res.status_code} (422 Unprocessable Entity)")

    # V2. Test Negative Asset Price
    neg_price_payload = asset_payload.copy()
    neg_price_payload["current_price"] = "-50.00"
    res = client.post("/api/assets", json=neg_price_payload)
    assert res.status_code == 422
    print(f"[PASS] V2. Negative Asset Price -> Status: {res.status_code} (422 Unprocessable Entity)")

    # V3. Test Invalid Currency Code
    bad_curr_payload = asset_payload.copy()
    bad_curr_payload["currency"] = "USDOLLARS"
    res = client.post("/api/assets", json=bad_curr_payload)
    assert res.status_code == 422
    print(f"[PASS] V3. Invalid Currency Code -> Status: {res.status_code} (422 Unprocessable Entity)")

    # V4. Test Invalid UUID Format
    res = client.get("/api/assets/not-a-valid-uuid")
    assert res.status_code == 422
    print(f"[PASS] V4. Invalid UUID parameter -> Status: {res.status_code} (422 Unprocessable Entity)")

    # V5. Test Non-existent User ID for Asset Allocation
    bad_alloc = {
        "user_id": str(uuid.uuid4()),
        "asset_id": str(uuid.uuid4()),
        "quantity": "10.0",
        "average_buy_price": "100.0"
    }
    res = client.post("/api/asset-allocations", json=bad_alloc)
    assert res.status_code == 404
    print(f"[PASS] V5. Non-existent User ID for Asset Allocation -> Status: {res.status_code} (404 Not Found)")


    # Cleanup test users created during test run
    db = SessionLocal()
    db.query(User).filter(User.username.in_(["finsight_user", "test_alloc_user"])).delete(synchronize_session=False)
    db.commit()
    db.close()

    print("\n==================================================")
    print("      ALL ENDPOINTS AND VALIDATIONS PASSED!       ")
    print("==================================================")


if __name__ == "__main__":
    test_all()

