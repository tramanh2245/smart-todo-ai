# Setup Guide — Smart To-Do AI (PWA)

## Stack
- **Frontend:** React 18 + TypeScript + Vite + vite-plugin-pwa
- **Backend:** Spring Boot 3 + PostgreSQL + Gemini AI
- **Deploy:** Vercel (frontend) + Railway (backend)
- **Stores:** Google Play và App Store qua PWABuilder (không cần build native)

---

## Bước 1: Cài đặt công cụ

- [Node.js 20+](https://nodejs.org)
- [Java JDK 21](https://adoptium.net/temurin/releases/?version=21)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/downloads)

---

## Bước 2: Lấy Gemini API Key

Vào [aistudio.google.com](https://aistudio.google.com/app/apikey) → Tạo API Key miễn phí.

---

## Bước 3: Chạy Backend (local)

```powershell
cd be

# Chạy PostgreSQL
docker-compose up -d postgres

# Tạo file application-local.properties (KHÔNG commit)
# Thêm dòng: gemini.api.key=YOUR_KEY

# Chạy Spring Boot
mvnw.cmd spring-boot:run
```

Kiểm tra: `http://localhost:8080/api/tasks/health` → thấy `OK`.

---

## Bước 4: Chạy Frontend (local)

```powershell
cd fe

# Copy env mẫu
copy .env.example .env.local
# Mở .env.local, đảm bảo: VITE_API_URL=http://localhost:8080

npm install
npm run dev
# Mở http://localhost:5173
```

---

## Bước 5: Tạo icon PNG (bắt buộc để cài app)

Vào [realfavicongenerator.net](https://realfavicongenerator.net) hoặc [pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator):
1. Upload file `fe/public/icons/icon.svg`
2. Tải về → lấy `icon-192.png` và `icon-512.png`
3. Đặt vào `fe/public/icons/`

---

## Bước 6: Deploy Backend lên Railway

1. Vào [railway.app](https://railway.app) → Tạo account
2. New Project → Deploy from GitHub → chọn repo, root directory: `be`
3. Add Plugin: PostgreSQL → Railway tự cấp `DATABASE_URL`
4. Add Variables:
   - `GEMINI_API_KEY` = key của bạn
   - `SPRING_DATASOURCE_URL` = postgresql://... (copy từ PostgreSQL plugin)
5. Lấy domain: `Settings` → `Domains` → Generate Domain

---

## Bước 7: Deploy Frontend lên Vercel

```powershell
# Cài Vercel CLI
npm i -g vercel

cd fe
vercel
# Làm theo hướng dẫn, set root = fe/

# Thêm environment variable trong Vercel dashboard:
# VITE_API_URL = https://your-backend.up.railway.app
```

Hoặc connect GitHub repo vào Vercel → tự động deploy mỗi khi push.

---

## Bước 8: Lên Google Play Store qua PWABuilder (MIỄN PHÍ)

1. Vào [pwabuilder.com](https://www.pwabuilder.com)
2. Nhập URL Vercel của app (bắt buộc HTTPS)
3. Chọn **Android** → **Generate Package**
4. Tải file `.aab` và `signing key`
5. Vào [Google Play Console](https://play.google.com/console) (phí $25 một lần)
6. Tạo app → Upload AAB → Internal Testing → Production

---

## Bước 9: Lên App Store qua PWABuilder (cần Apple Dev Account)

1. Vào [pwabuilder.com](https://www.pwabuilder.com) → chọn **iOS**
2. Điền thông tin app
3. Tải file iOS package
4. Cần [Apple Developer Account](https://developer.apple.com) ($99/năm)
5. Upload qua [Codemagic](https://codemagic.io) (build cloud, 500 phút/tháng miễn phí)

---

## Bước 10: Cấu hình GitHub Secrets (CI/CD tự động)

Vào GitHub repo → Settings → Secrets → Actions:

| Secret | Lấy ở đâu |
|--------|-----------|
| `VITE_API_URL` | Railway domain |
| `VERCEL_TOKEN` | vercel.com/account/tokens |
| `VERCEL_ORG_ID` | `.vercel/project.json` sau khi `vercel` lần đầu |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` sau khi `vercel` lần đầu |
| `RAILWAY_TOKEN` | Railway dashboard → Account → Tokens |

Sau khi setup: mỗi khi push lên `main` → tự động deploy cả frontend lẫn backend.

---

## PWA — Người dùng cài app như thế nào?

**Android (Chrome):** Mở web → banner "Thêm vào màn hình chính" tự xuất hiện  
**iOS (Safari):** Mở web → nhấn Share → "Thêm vào màn hình chính"  
**Desktop (Chrome/Edge):** Nhấn icon cài đặt trên thanh địa chỉ
