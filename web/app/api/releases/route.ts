import { NextResponse } from 'next/server';

/**
 * GitHub Releases APIから全リリース情報を取得
 */
export async function GET() {
  try {
    const response = await fetch(
      'https://api.github.com/repos/koheikameyama/stock-analyzer/releases',
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'stock-analyzer',
        },
        next: {
          revalidate: 3600, // 1時間キャッシュ
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const releases = await response.json();

    const formattedReleases = releases.map((release: any) => ({
      version: release.tag_name,
      title: release.name,
      body: release.body,
      publishedAt: release.published_at,
      url: release.html_url,
    }));

    return NextResponse.json(formattedReleases);
  } catch (error) {
    console.error('Failed to fetch releases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch releases' },
      { status: 500 }
    );
  }
}
