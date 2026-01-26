/**
 * HEALO: 프로덕션 환경에서 console.error 최적화
 * 개발 환경에서는 그대로 출력, 프로덕션에서는 에러 추적만 수행
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logError = (context: string, error: any, details?: Record<string, any>) => {
  if (isDev) {
    console.error(`[${context}]`, error, details || '');
  } else {
    // 프로덕션: 에러 추적만 (필요시 에러 리포팅 서비스로 전송)
    // TODO: Sentry 등 에러 리포팅 서비스 연동 가능
  }
};

export const logWarn = (context: string, message: string, details?: Record<string, any>) => {
  if (isDev) {
    console.warn(`[${context}]`, message, details || '');
  }
};

export const logInfo = (context: string, message: string, details?: Record<string, any>) => {
  if (isDev) {
    console.log(`[${context}]`, message, details || '');
  }
};
