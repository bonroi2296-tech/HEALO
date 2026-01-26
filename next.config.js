/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ 성능 최적화: 코드 스플리팅 및 번들 최적화
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      // 클라이언트 사이드 번들 최적화
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // React 관련 라이브러리 분리
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
              name: 'react-vendor',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Supabase 분리
            supabase: {
              test: /[\\/]node_modules[\\/]@supabase[\\/]/,
              name: 'supabase-vendor',
              priority: 25,
              reuseExistingChunk: true,
            },
            // AI SDK 분리
            ai: {
              test: /[\\/]node_modules[\\/](@ai-sdk|ai)[\\/]/,
              name: 'ai-vendor',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Google Maps 분리 (무거운 라이브러리)
            googleMaps: {
              test: /[\\/]node_modules[\\/]@react-google-maps[\\/]/,
              name: 'google-maps-vendor',
              priority: 20,
              reuseExistingChunk: true,
            },
            // 기타 vendor
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true,
            },
          },
        },
      };

      // ✅ 프로덕션에서 Next.js DevTools 제외 (unused-javascript 개선)
      if (!dev) {
        config.resolve.alias = {
          ...config.resolve.alias,
          'next/dist/compiled/next-devtools': false,
        };
      }
    }
    return config;
  },

  // ✅ 정적 자산 캐시 헤더 설정 (배포 환경)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 이미지 파일 캐시
        source: '/:path*\\.(jpg|jpeg|png|gif|webp|svg|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 폰트 파일 캐시
        source: '/:path*\\.(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ✅ 프로덕션 빌드 최적화
  productionBrowserSourceMaps: false, // 소스맵 비활성화 (valid-source-maps 개선: 빈 소스맵 에러 방지)

  // ✅ 개발 도구 제외 (unused-javascript 개선)
  reactStrictMode: true,

  // ✅ 이미지 최적화
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ✅ 실험적 기능 (성능 최적화)
  experimental: {
    optimizePackageImports: ['lucide-react', '@supabase/supabase-js'],
  },
};

// ✅ ES 모듈 형식 (package.json의 "type": "module"과 일치)
export default nextConfig;
