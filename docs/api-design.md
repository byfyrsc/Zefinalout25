# API Design

The InteliFeed Hub platform uses Supabase as its backend, which provides a RESTful API and GraphQL interface for data access. The API follows REST principles and uses standard HTTP methods for CRUD operations.

## Authentication

### User Registration
```http
POST /auth/v1/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "options": {
    "data": {
      "first_name": "John",
      "last_name": "Doe",
      "company_name": "Restaurant Group",
      "subdomain": "myrestaurant"
    }
  }
}
```

### User Login
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### Password Reset
```http
POST /auth/v1/recover
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## Core Resources

### Tenants

#### Get Current Tenant
```http
GET /rest/v1/tenants?select=*&limit=1
Authorization: Bearer <JWT_TOKEN>
```

#### Update Tenant
```http
PATCH /rest/v1/tenants?id=eq.<tenant_id>
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Updated Restaurant Group",
  "settings": {
    "theme": "dark"
  }
}
```

### Users

#### Get All Users in Tenant
```http
GET /rest/v1/users?select=*
Authorization: Bearer <JWT_TOKEN>
```

#### Update User Profile
```http
PATCH /rest/v1/users?id=eq.<user_id>
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "first_name": "Jane",
  "last_name": "Smith",
  "preferences": {
    "notifications": {
      "email": true,
      "push": false
    }
  }
}
```

### Locations

#### Get All Locations
```http
GET /rest/v1/locations?select=*
Authorization: Bearer <JWT_TOKEN>
```

#### Create New Location
```http
POST /rest/v1/locations
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Downtown Branch",
  "address": "123 Main St, City, State",
  "phone": "+1-555-123-4567",
  "email": "downtown@restaurant.com",
  "is_active": true
}
```

#### Update Location
```http
PATCH /rest/v1/locations?id=eq.<location_id>
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Updated Downtown Branch",
  "business_hours": {
    "monday": "9:00-22:00",
    "tuesday": "9:00-22:00"
  }
}
```

### Feedback

#### Get Feedback for Location
```http
GET /rest/v1/feedbacks?select=*,location:locations(name)&location_id=eq.<location_id>&order=created_at.desc
Authorization: Bearer <JWT_TOKEN>
```

#### Create Feedback (Public Endpoint)
```http
POST /rest/v1/feedbacks
Content-Type: application/json

{
  "location_id": "<location_id>",
  "customer_name": "John Customer",
  "customer_email": "john@example.com",
  "overall_rating": 4.5,
  "responses": {
    "food_quality": 5,
    "service": 4,
    "ambiance": 4
  },
  "comment": "Great experience overall!"
}
```

#### Update Feedback Status
```http
PATCH /rest/v1/feedbacks?id=eq.<feedback_id>
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "status": "reviewed",
  "assigned_to": "<user_id>"
}
```

## Enhanced Resources

### Notifications

#### Get User Notifications
```http
GET /rest/v1/notifications?select=*&user_id=eq.<user_id>&order=created_at.desc
Authorization: Bearer <JWT_TOKEN>
```

#### Mark Notification as Read
```http
PATCH /rest/v1/notifications?id=eq.<notification_id>
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "is_read": true,
  "read_at": "2023-01-01T12:00:00Z"
}
```

### Feedback Questions

#### Get Tenant Questions
```http
GET /rest/v1/feedback_questions?select=*&tenant_id=eq.<tenant_id>
Authorization: Bearer <JWT_TOKEN>
```

#### Create Question
```http
POST /rest/v1/feedback_questions
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tenant_id": "<tenant_id>",
  "question_text": "How would you rate our service?",
  "question_type": "rating",
  "options": null
}
```

### Feedback Responses

#### Get Responses for Feedback
```http
GET /rest/v1/feedback_responses?select=*,question:feedback_questions(question_text)&feedback_id=eq.<feedback_id>
Authorization: Bearer <JWT_TOKEN>
```

#### Create Response
```http
POST /rest/v1/feedback_responses
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "feedback_id": "<feedback_id>",
  "question_id": "<question_id>",
  "response_numeric": 4.5
}
```

## Analytics Endpoints

### Tenant Usage Statistics
```http
POST /rest/v1/rpc/get_tenant_usage
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tenant_uuid": "<tenant_id>"
}
```

### Tenant Analytics Summary
```http
POST /rest/v1/rpc/get_tenant_analytics_summary
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "tenant_uuid": "<tenant_id>"
}
```

### Daily Feedback Summary
```http
GET /rest/v1/daily_feedback_summary?select=*&order=feedback_date.desc&limit=30
Authorization: Bearer <JWT_TOKEN>
```

## Realtime Subscriptions

### Feedback Updates
```javascript
const feedbackSubscription = supabase
  .channel('feedback-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'feedbacks',
      filter: 'location_id=eq.<location_id>'
    },
    (payload) => {
      console.log('New feedback received:', payload.new);
    }
  )
  .subscribe();
```

### Notification Updates
```javascript
const notificationSubscription = supabase
  .channel('notification-changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: 'user_id=eq.<user_id>'
    },
    (payload) => {
      console.log('New notification:', payload.new);
    }
  )
  .subscribe();
```

## Error Handling

The API follows standard HTTP status codes:

- `200 OK`: Successful GET, PATCH, PUT requests
- `201 Created`: Successful POST requests
- `204 No Content`: Successful DELETE requests
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server errors

Error responses follow this format:
```json
{
  "message": "Error description",
  "error": "Error code",
  "statusCode": 400
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Anonymous requests**: 100 requests per hour
- **Authenticated requests**: 1000 requests per hour
- **Admin requests**: 5000 requests per hour

Exceeding rate limits will result in a `429 Too Many Requests` response.

## Pagination

List endpoints support pagination using the `limit` and `offset` parameters:

```http
GET /rest/v1/feedbacks?select=*&limit=20&offset=40
```

## Filtering and Sorting

Endpoints support filtering and sorting using Supabase's query syntax:

```http
GET /rest/v1/feedbacks?select=*&nps_score=gte.9&order=created_at.desc
```

## Field Selection

Endpoints support selecting specific fields to reduce payload size:

```http
GET /rest/v1/feedbacks?select=id,created_at,overall_rating,comment
```

## Data Validation

All endpoints validate input data according to the database schema constraints. Invalid data will result in a `400 Bad Request` response with validation errors.

## Versioning

The API is versioned through the URL path:
- `/rest/v1/` - Current stable version
- Future versions will be available at `/rest/v2/`, etc.

## CORS Policy

The API supports CORS with the following configuration:
- Allowed origins: `*` (all domains)
- Allowed methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Allowed headers: `Authorization, Content-Type, Accept`
- Exposed headers: `Content-Range, X-Total-Count`

## Security Headers

All API responses include security headers:
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

## Content Types

The API supports the following content types:
- `application/json` for requests and responses
- `application/vnd.pgrst.object+json` for single object responses
- `application/vnd.pgrst.array+json` for array responses

## Caching

The API implements HTTP caching where appropriate:
- `Cache-Control` headers for cacheable responses
- `ETag` headers for conditional requests
- `Last-Modified` headers for resource modification tracking

## Webhooks

The platform supports webhooks for real-time integrations:
- Feedback submission notifications
- User registration events
- Subscription changes
- Campaign status updates

Webhook endpoints must be configured in the tenant settings and will receive POST requests with JSON payloads.