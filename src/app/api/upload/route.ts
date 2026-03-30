import { NextRequest, NextResponse } from 'next/server'
import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
})

export async function POST(request: NextRequest) {
  try {
    const { filename, partCount } = await request.json()
    if (!filename) return NextResponse.json({ error: 'Missing filename' }, { status: 400 })

    const key = `splats/${Date.now()}-${filename}`

    const create = await r2.send(new CreateMultipartUploadCommand({
      Bucket: 'vanta-splats',
      Key: key,
      ContentType: 'application/octet-stream',
    }))

    const uploadId = create.UploadId!

    const partUrls = await Promise.all(
      Array.from({ length: partCount }, (_, i) =>
        getSignedUrl(r2, new UploadPartCommand({
          Bucket: 'vanta-splats',
          Key: key,
          UploadId: uploadId,
          PartNumber: i + 1,
        }), { expiresIn: 3600 })
      )
    )

    const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
    return NextResponse.json({ uploadId, key, partUrls, publicUrl })

  } catch (error) {
    console.error('Upload init error:', error)
    return NextResponse.json({ error: 'Failed to start upload' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { key, uploadId, parts } = await request.json()

    await r2.send(new CompleteMultipartUploadCommand({
      Bucket: 'vanta-splats',
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts },
    }))

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Upload complete error:', error)
    return NextResponse.json({ error: 'Failed to complete upload' }, { status: 500 })
  }
}
