# 글로벌 확장 전략

## 시장 분석

### 한국 의료관광 시장
- 2024년 외국인 환자: 약 60만명
- 주요 국가: 일본(30%), 중국(20%), 미국(10%), 동남아(15%), 중동(10%)
- 인기 시술: 성형, 피부과, 건강검진, 치과, 안과

### HEALO의 현재 위치
- 타겟: 영어권 환자 (미국, 동남아, 중동)
- 미진출: 일본, 중국 (가장 큰 시장)

## 확장 우선순위

### Phase 1: 일본 시장 (가장 큰 ROI)
- **왜?** 한국 의료관광 최대 시장, 지리적 근접성, 높은 객단가
- **필요한 것:**
  - 일본어 UI 완성 (`src/lib/i18n/` 프레임워크 준비됨)
  - 일본어 SEO (Google Japan, Yahoo Japan)
  - Line 메신저 통합 (일본 1위 메신저)
  - 일본어 CS 대응 (번역 도구 또는 파트타임 번역사)
- **예상 기간:** 2~3개월

### Phase 2: 중국어권 (중국, 대만, 홍콩)
- **왜?** 두 번째로 큰 시장, 높은 성장률
- **필요한 것:**
  - 중국어 간체/번체 UI
  - WeChat/小红书 연동
  - 중국 결제 (Alipay, WeChat Pay)
  - 방화벽 대응 (중국 본토)

### Phase 3: 동남아 (베트남, 태국, 인도네시아)
- **왜?** 빠르게 성장하는 시장, 경쟁 적음
- **필요한 것:**
  - 영어 UI로 커버 가능
  - 현지 마케팅 채널 (Facebook, Instagram)
  - 현지 가격 감수성 고려

## 마케팅 채널

| 시장 | 주요 채널 | HEALO 현재 |
|---|---|---|
| 일본 | Google JP, Yahoo JP, Instagram, Line | ❌ 없음 |
| 미국 | Google, Instagram, Reddit, YouTube | ⚠️ 영어 SEO만 |
| 중국 | Baidu, 小红书, WeChat, Douyin | ❌ 없음 |
| 동남아 | Google, Facebook, Instagram | ⚠️ 영어 SEO만 |

## SEO 글로벌 전략

### 현재 (영어)
- 구조화된 데이터: MedicalProcedure, MedicalOrganization ✅
- 사이트맵: 동적 생성 ✅
- robots.txt: 없음 ❌ (추가 필요)

### 필요
- [ ] hreflang 태그 (다국어 SEO)
- [ ] 언어별 URL 구조 (/en/, /ja/, /zh/)
- [ ] 언어별 sitemap
- [ ] robots.txt 추가
