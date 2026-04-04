const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3')
const { randomUUID } = require('crypto')

const getR2Config = () => {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  const bucket = process.env.CLOUDFLARE_R2_BUCKET
  const publicBaseUrl = process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL

  if (
    !accountId ||
    !accessKeyId ||
    !secretAccessKey ||
    !bucket ||
    !publicBaseUrl
  ) {
    throw new Error(
      'Cloudflare R2 is not configured. Set CLOUDFLARE_R2_* env variables.'
    )
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl: publicBaseUrl.replace(/\/$/, ''),
  }
}

const createR2Client = () => {
  const config = getR2Config()
  return new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
}

const uploadFileToR2 = async (file, folder) => {
  const config = getR2Config()
  const client = createR2Client()
  const extension = (file.originalname || 'jpg').split('.').pop().toLowerCase()
  const key = `${folder}/${Date.now()}-${randomUUID()}.${extension}`

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype || 'application/octet-stream',
    })
  )

  return `${config.publicBaseUrl}/${key}`
}

const uploadMissingPersonImage = async (file) => {
  if (!file) {
    return null
  }

  return uploadFileToR2(file, 'missing')
}

const uploadFundCampaignAsset = async (file, folder = 'fund') => {
  if (!file) {
    return null
  }

  return uploadFileToR2(file, folder)
}

const uploadUserAvatar = async (file) => {
  if (!file) {
    return null
  }

  return uploadFileToR2(file, 'avatars')
}

module.exports = {
  uploadMissingPersonImage,
  uploadFundCampaignAsset,
  uploadUserAvatar,
}
