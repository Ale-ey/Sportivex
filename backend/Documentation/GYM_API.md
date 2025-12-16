# Gym Module API Documentation

## Base URL
`/api/gym`

## Authentication
All endpoints require a valid JWT token in the Authorization header:
`Authorization: Bearer <token>`

## Endpoints

### 1. Check-in / Check-out
**POST** `/scan-qr`

Scans the gym entrance QR code.
- If user is not checked in: Checks them IN.
- If user is checked in: Checks them OUT.

**Request Body:**
```json
{
  "qrCode": "GYM_ENTRY_EXIT"
}
```

**Response (Check-in):**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "status": "checked_in",
    "checkin": { ... }
  }
}
```

**Response (Check-out):**
```json
{
  "success": true,
  "message": "Checked out successfully",
  "data": {
    "status": "checked_out"
  }
}
```

### 2. Get Workout Categories
**GET** `/categories`

Returns a list of available workout categories.

**Response:**
```json
{
  "success": true,
  "data": ["legs", "chest", "shoulder", "biceps", "triceps", "abs"]
}
```

### 3. Get Exercises
**GET** `/exercises`
**GET** `/exercises?category=legs`

Returns a list of exercises. Optional `category` query parameter filters the results.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Squats",
      "description": "...",
      "category": "legs",
      "area_affected": "...",
      "image_url": "..."
    }
  ]
}
```

### 4. Get Machine Details
**GET** `/machines`

Returns a list of gym machines and their details.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Treadmill",
      "description": "...",
      "area_affected": "...",
      "status": "operational"
    }
  ]
}
```

### 5. Get Rules and Regulations
**GET** `/rules`

Returns a list of active gym rules.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "title": "Wear proper shoes",
      "content": "..."
    }
  ]
}
```

### 6. Get Realtime Count
**GET** `/count`

Returns the number of users currently checked into the gym.

**Response:**
```json
{
  "success": true,
  "data": {
    "activeCheckins": 12
  }
}
```

## Admin Endpoints
(Requires ADMIN role)

- **POST** `/exercises`: Add a new exercise.
- **POST** `/machines`: Add a new machine.
- **POST** `/rules`: Add a new rule.

