/**
 * Cookie管理ユーティリティ
 *
 * AI分析リクエストの追跡にCookieを使用します。
 * ログイン機能がない現状、Cookieでリクエスト済み銘柄を管理します。
 */

/**
 * Cookieに保存するリクエストデータの型
 */
interface RequestedStock {
  ticker: string;
  requestedAt: string; // ISO 8601形式
}

const COOKIE_NAME = 'requested_stocks';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1年

/**
 * Cookieから全てのリクエスト済み銘柄を取得
 */
export function getRequestedStocks(): RequestedStock[] {
  if (typeof document === 'undefined') {
    return [];
  }

  const cookies = document.cookie.split(';');
  const cookie = cookies.find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));

  if (!cookie) {
    return [];
  }

  try {
    const value = cookie.split('=')[1];
    const decoded = decodeURIComponent(value);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to parse requested stocks cookie:', error);
    return [];
  }
}

/**
 * 特定の銘柄がリクエスト済みかチェック
 */
export function isStockRequested(ticker: string): boolean {
  const stocks = getRequestedStocks();
  return stocks.some((s) => s.ticker === ticker);
}

/**
 * リクエスト済み銘柄をCookieに追加
 */
export function addRequestedStock(ticker: string): void {
  const stocks = getRequestedStocks();

  // 既にリクエスト済みの場合は何もしない
  if (stocks.some((s) => s.ticker === ticker)) {
    return;
  }

  // 新しいリクエストを追加
  stocks.push({
    ticker,
    requestedAt: new Date().toISOString(),
  });

  // Cookieに保存
  const encoded = encodeURIComponent(JSON.stringify(stocks));
  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * 特定の銘柄のリクエストを削除
 */
export function removeRequestedStock(ticker: string): void {
  const stocks = getRequestedStocks();
  const filtered = stocks.filter((s) => s.ticker !== ticker);

  const encoded = encodeURIComponent(JSON.stringify(filtered));
  document.cookie = `${COOKIE_NAME}=${encoded}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/**
 * 全てのリクエスト済み銘柄をクリア
 */
export function clearRequestedStocks(): void {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}
