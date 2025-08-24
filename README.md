# Qappio Backend API

Node.js + Express + MongoDB backend API for Qappio application.

## 🚀 Features

- **RESTful API** with Express.js
- **MongoDB** database with Mongoose ODM
- **CORS** enabled for frontend integration
- **Error handling** middleware
- **Data validation** with Mongoose schemas
- **Sample data** seeding
- **Development** environment ready

## 📁 Project Structure

```
qappio-backend/
├── models/           # MongoDB models
│   ├── Task.js       # Task model
│   ├── Level.js      # Level model
│   └── Market.js     # Market item model
├── routes/           # API routes
│   ├── tasks.js      # Task endpoints
│   ├── levels.js     # Level endpoints
│   └── market.js     # Market endpoints
├── seeders/          # Database seeders
│   └── seedData.js   # Sample data
├── server.js         # Main server file
├── package.json      # Dependencies
└── .env             # Environment variables
```

## 🛠️ Installation

1. **Clone & Navigate:**
   ```bash
   cd qappio-backend
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   ```bash
   # .env file already created with default values
   MONGODB_URI=mongodb://localhost:27017/qappio
   NODE_ENV=development
   PORT=5000
   ```

4. **Start MongoDB:**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

5. **Seed Database (Optional):**
   ```bash
   node seeders/seedData.js
   ```

6. **Start Server:**
   ```bash
   npm run dev  # Development with nodemon
   # or
   npm start    # Production
   ```

## 📡 API Endpoints

### Base URL
```
http://localhost:5000/api
```

### 🎯 Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/tasks` | Get all tasks with filters |
| `GET` | `/tasks/active` | Get active tasks only |
| `GET` | `/tasks/:id` | Get single task |
| `POST` | `/tasks` | Create new task |
| `PUT` | `/tasks/:id` | Update task |
| `DELETE` | `/tasks/:id` | Delete task |
| `POST` | `/tasks/:id/participate` | Join a task |

**Query Parameters for GET /tasks:**
- `status` - Filter by task status
- `brand` - Filter by brand name
- `category` - Filter by category
- `isWeekly` - Filter weekly tasks
- `isSponsored` - Filter sponsored tasks
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### 🏆 Levels

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/levels` | Get all levels |
| `GET` | `/levels/active` | Get active levels only |
| `GET` | `/levels/:id` | Get single level |
| `GET` | `/levels/by-points/:points` | Get level by points |
| `POST` | `/levels` | Create new level |
| `PUT` | `/levels/:id` | Update level |
| `DELETE` | `/levels/:id` | Delete level |
| `PATCH` | `/levels/:id/toggle` | Toggle level status |
| `POST` | `/levels/reorder` | Reorder levels |

### 🛒 Market

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/market` | Get all market items with filters |
| `GET` | `/market/featured` | Get featured items |
| `GET` | `/market/categories` | Get categories with stats |
| `GET` | `/market/:id` | Get single item |
| `POST` | `/market` | Create new item |
| `PUT` | `/market/:id` | Update item |
| `DELETE` | `/market/:id` | Delete item |
| `POST` | `/market/:id/purchase` | Purchase item |
| `PATCH` | `/market/:id/toggle-featured` | Toggle featured status |
| `GET` | `/market/search/:query` | Search items |

**Query Parameters for GET /market:**
- `category` - Filter by category
- `brand` - Filter by brand
- `status` - Filter by status
- `levelAccess` - Filter by level access
- `featured` - Filter featured items
- `search` - Search query
- `minPrice` / `maxPrice` - Price range
- `inStock` - Filter available items
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

## 📊 Sample Data

The seeder creates:
- **3 Tasks** (Nike, Starbucks, Samsung)
- **5 Levels** (Çırak, Kalfa, Usta, Viralist, Qappian)
- **3 Market Items** (iPhone, Starbucks Card, Nike Shoes)

## 🔗 CORS Configuration

CORS is configured to allow requests from:
- `http://localhost:3000` (Admin Dashboard)
- `http://localhost:19006` (Expo Development)
- `exp://192.168.1.128:19000` (Expo Local Network)

## 📝 Example Requests

### Create Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Task",
    "description": "Test description",
    "brand": "Test Brand",
    "budget": 1000,
    "reward": 50,
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }'
```

### Get Levels
```bash
curl http://localhost:5000/api/levels
```

### Search Market Items
```bash
curl "http://localhost:5000/api/market?search=iphone&category=Elektronik"
```

## 🧪 Testing the API

1. **Start the server:** `npm run dev`
2. **Visit:** `http://localhost:5000` for API info
3. **Test endpoints** with tools like:
   - **Postman**
   - **curl** commands
   - **Frontend applications**

## 🔧 Development

- **Nodemon** automatically restarts on file changes
- **MongoDB** connection with Mongoose
- **Environment variables** for configuration
- **Error handling** for better debugging

## 🚦 Next Steps

1. **Authentication** - Add JWT authentication
2. **Authorization** - Role-based access control
3. **File Upload** - Image upload functionality
4. **Rate Limiting** - Prevent abuse
5. **Documentation** - Auto-generated API docs
6. **Testing** - Unit and integration tests
7. **Deployment** - Production deployment guide

## 🤝 Integration

This backend is designed to work with:
- **Admin Dashboard** (Next.js - http://localhost:3000)
- **Mobile App** (React Native/Expo)
- **Any frontend** that can make HTTP requests

Happy coding! 🚀
