import { supabaseAdmin } from '../config/supabaseClient.js'

const BUCKET = 'documents'

export async function ensureDocumentsBucket() {
  const { data: buckets } = await supabaseAdmin.storage.listBuckets()
  if (buckets?.some((b) => b.name === BUCKET)) return
  const { error } = await supabaseAdmin.storage.createBucket(BUCKET, { public: true })
  if (error && !String(error.message).includes('already exists')) {
    console.error('[storage] failed to create documents bucket:', error.message)
  }
}

/** Uploads a PDF buffer and returns its public URL. */
export async function uploadPdf(path, buffer) {
  const { error } = await supabaseAdmin.storage.from(BUCKET).upload(path, buffer, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (error) throw error
  const { data } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path)
  return data.publicUrl
}
