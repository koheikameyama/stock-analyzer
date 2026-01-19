import { NextResponse } from 'next/server';

/**
 * GitHub Releases APIから最新のリリース情報を取得
 */
export async function GET() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/koheikameyama/stock-analyzer/releases/latest',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'stock-analyzer',
        },
        next: {
          revalidate: 60, // 1分キャッシュ
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const release = await response.json();

    return NextResponse.json({
      version: release.tag_name,
      title: release.name,
      body: release.body,
      publishedAt: release.published_at,
      url: release.html_url,
    });
  } catch (error) {
    console.error('Failed to fetch latest release:', error);
    return NextResponse.json(
      { error: 'Failed to fetch release information' },
      { status: 500 }
    );
  }
}
