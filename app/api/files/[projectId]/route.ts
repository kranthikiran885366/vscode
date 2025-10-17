import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const response = await fetch(
      `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/files/project/${params.projectId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Get files error:', error)
    return NextResponse.json({ message: 'Failed to fetch files' }, { status: 500 })
  }
}
