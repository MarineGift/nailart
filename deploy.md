# ConnieNail - 배포 가이드

## 🚀 배포 준비사항

### 1. 환경 변수 설정
`.env.local` 파일에 다음 환경 변수들을 설정하세요:

```bash
# 필수 - 데이터베이스
DATABASE_URL=postgresql://username:password@host:port/database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# 필수 - Twilio SMS 서비스
TWILIO_ACCOUNT_SID=ACa24a87159bf2e5d77376bb0da09b5218
TWILIO_AUTH_TOKEN=e95bad8ab333f397b3a810b7e6799833
TWILIO_PHONE_NUMBER=+18885493238

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key

SENDGRID_API_KEY=SG.your-api-key
FROM_EMAIL=noreply@yourdomain.com
```

## 📦 GitHub 리포지토리 설정

### 1. 리포지토리 생성
```bash
git init
git add .
git commit -m "Initial commit: ConnieNail Salon Management System"
git branch -M main
git remote add origin https://github.com/username/connienail.git
git push -u origin main
```

### 2. GitHub Secrets 설정
Repository Settings → Secrets and variables → Actions에서 다음 secrets 추가:

**필수 Secrets:**
- `DATABASE_URL`: PostgreSQL 연결 문자열
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key

**배포용 Secrets:**
- `VERCEL_TOKEN`: Vercel API 토큰
- `VERCEL_ORG_ID`: Vercel 조직 ID
- `VERCEL_PROJECT_ID`: Vercel 프로젝트 ID

**외부 서비스 Secrets (선택사항):**
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `STRIPE_SECRET_KEY`
- `SENDGRID_API_KEY`

## 🌐 Vercel 배포 (권장)

### 1. Vercel 계정 연결
1. [vercel.com](https://vercel.com)에서 GitHub 계정으로 로그인
2. "New Project" → GitHub 리포지토리 선택
3. Framework Preset: **Next.js** 선택

### 2. 환경 변수 설정 (중요!)
Vercel 대시보드 → Project Settings → Environment Variables에서 다음 필수 환경 변수들을 추가:

**필수 환경 변수:**
```
DATABASE_URL=your_postgres_connection_string
TWILIO_ACCOUNT_SID=ACa24a87159bf2e5d77376bb0da09b5218
TWILIO_AUTH_TOKEN=e95bad8ab333f397b3a810b7e6799833
TWILIO_PHONE_NUMBER=+18885493238
```

⚠️ **빌드 에러 방지:** 모든 Twilio 환경 변수를 설정하지 않으면 빌드가 실패합니다.

### 3. 도메인 설정 (선택사항)
- Vercel 대시보드 → Domains
- 커스텀 도메인 추가 및 DNS 설정

### 4. 자동 배포 확인
- GitHub에 푸시할 때마다 자동 배포
- Pull Request마다 Preview 배포 생성

## 🐳 Docker 배포

### 1. 이미지 빌드
```bash
docker build -t connienail-salon .
```

### 2. 컨테이너 실행
```bash
docker run -d \
  --name connienail \
  -p 3000:3000 \
  --env-file .env.local \
  connienail-salon
```

### 3. Docker Compose (선택사항)
```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.local
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: connienail
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
docker-compose up -d
```

## ☁️ 기타 플랫폼 배포

### Railway
1. [railway.app](https://railway.app) 연결
2. GitHub 리포지토리 선택
3. 환경 변수 설정
4. 자동 배포 확인

### Netlify
1. [netlify.com](https://netlify.com) 계정 생성
2. GitHub 리포지토리 연결
3. Build command: `npm run build`
4. Publish directory: `out`

### AWS Amplify
1. AWS Amplify 콘솔 접속
2. GitHub 리포지토리 연결
3. 빌드 설정 구성
4. 환경 변수 설정

## 🔧 배포 후 확인사항

### 1. 기능 테스트
- [ ] 관리자 로그인 (admin/admin123)
- [ ] 예약 생성 및 관리
- [ ] 고객 관리 기능
- [ ] 직원 스케줄링
- [ ] 결제 처리 (테스트 모드)

### 2. 외부 서비스 연결 확인
- [ ] SMS 알림 (Twilio)
- [ ] 이메일 발송 (SendGrid)
- [ ] 결제 처리 (Stripe)

### 3. 성능 모니터링
- [ ] 페이지 로딩 속도
- [ ] 데이터베이스 응답 시간
- [ ] API 응답 시간

## 🚨 문제 해결

### 빌드 에러
```bash
# 로컬에서 빌드 테스트
npm run build

# 타입 체크
npm run type-check

# 린트 확인
npm run lint
```

### 데이터베이스 연결 오류
- DATABASE_URL 형식 확인
- 데이터베이스 접근 권한 확인
- 방화벽 설정 확인

### 환경 변수 오류
- 모든 필수 환경 변수 설정 확인
- 변수명 오타 확인
- 프로덕션/개발 환경 구분

## 📊 모니터링 설정

### Vercel Analytics
```bash
# vercel.json에 추가
{
  "analytics": {
    "enable": true
  }
}
```

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
```

### Performance Monitoring
- Vercel Speed Insights
- Google PageSpeed Insights
- Core Web Vitals 모니터링

## 🔒 보안 체크리스트

- [ ] 환경 변수로 모든 시크릿 관리
- [ ] HTTPS 강제 설정
- [ ] CSP 헤더 설정
- [ ] 데이터베이스 접근 권한 최소화
- [ ] API Rate Limiting 설정
- [ ] 정기적인 의존성 업데이트

## 📝 배포 체크리스트

### 배포 전
- [ ] 모든 환경 변수 설정 완료
- [ ] 로컬에서 프로덕션 빌드 테스트
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 외부 서비스 연결 테스트

### 배포 후
- [ ] 사이트 접속 확인
- [ ] 주요 기능 테스트
- [ ] 에러 로그 확인
- [ ] 성능 메트릭 확인

---

## 🆘 지원

배포 관련 문제가 발생하면:
1. GitHub Issues에 문제 상황 보고
2. 로그 파일 첨부
3. 환경 정보 제공 (OS, Node.js 버전 등)

**성공적인 배포를 위해 이 가이드를 단계별로 따라해주세요! 🎉**