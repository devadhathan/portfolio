import { NextResponse } from 'next/server';
import { execSync } from 'child_process';

const GIT_DATE_COMMAND = 'git log -1 --format=%cd --date=short';

export async function GET() {
  try {
    const output = execSync(GIT_DATE_COMMAND, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    const lastUpdatedDate = output.trim();
    return NextResponse.json({ lastUpdatedDate });
  } catch (error) {
    return NextResponse.json({ lastUpdatedDate: null });
  }
}
