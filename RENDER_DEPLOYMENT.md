# 🚀 Qappio Backend - Render Deployment Guide

## 📋 Render Deployment Ayarları

### 1. **Web Service Oluştur**
- **Platform**: Render
- **Service Type**: Web Service
- **Name**: `qappio-backend`

### 2. **GitHub Bağlantısı**
- **Repository**: `eroldemirtash/qappio-backend`
- **Branch**: `main`
- **Root Directory**: `/` (boş bırak)

### 3. **Runtime Ayarları**
- **Runtime**: Node.js 18+
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### 4. **Environment Variables**
```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/qappio
JWT_SECRET=your-super-secret-jwt-key-here
```

### 5. **Auto-Deploy**
- ✅ **Auto-Deploy**: Enabled
- ✅ **Branch**: main

## 🔧 **Gerekli Ayarlar**

### **Build Command**
```bash
npm install
```

### **Start Command**
```bash
npm start
```

### **Health Check URL**
```
/health
```

## 📊 **API Endpoints**

### **Core Endpoints**
- `GET /` - API Documentation
- `GET /health` - Health Check
- `GET /api/tasks` - Tasks Management
- `GET /api/brands` - Brands Management
- `GET /api/market` - Market Operations
- `GET /api/levels` - Level System

### **Example Usage**
```bash
# Health Check
curl https://your-app-name.onrender.com/health

# API Info
curl https://your-app-name.onrender.com/

# Tasks
curl https://your-app-name.onrender.com/api/tasks
```

## 🗄️ **Database Setup**

### **MongoDB Atlas (Önerilen)**
1. MongoDB Atlas hesabı oluştur
2. Cluster oluştur
3. Database user oluştur
4. Connection string al
5. Render'da `MONGODB_URI` olarak ekle

### **Local MongoDB (Development)**
```bash
mongodb://localhost:27017/qappio
```

## 🚀 **Deployment Sonrası**

### **Test Endpoints**
1. Health Check: `/health`
2. API Info: `/`
3. Tasks: `/api/tasks`

### **Monitoring**
- Render Dashboard'da logları kontrol et
- Health check endpoint'ini düzenli test et
- Performance metrics'i takip et

## 🔒 **Security Notes**

- `JWT_SECRET` güçlü bir değer olmalı
- `MONGODB_URI` güvenli olmalı
- CORS ayarları production için optimize edilmeli
- Environment variables'ları asla commit etme

## 📝 **Troubleshooting**

### **Common Issues**
1. **Port Error**: Render otomatik port atar
2. **Database Connection**: MongoDB URI'yi kontrol et
3. **Build Fail**: Node.js version'ı kontrol et
4. **CORS Error**: Frontend URL'lerini CORS'a ekle

### **Logs**
- Render Dashboard → Logs
- Build logs ve runtime logs'ları kontrol et

## ✅ **Deployment Checklist**

- [ ] GitHub repository bağlandı
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables eklendi
- [ ] Auto-deploy enabled
- [ ] Health check çalışıyor
- [ ] API endpoints test edildi
- [ ] Database bağlantısı çalışıyor

---

**🎯 Render Dashboard**: https://dashboard.render.com
**📚 Render Docs**: https://render.com/docs
