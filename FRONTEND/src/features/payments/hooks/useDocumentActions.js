export default function useDocumentActions() {
  async function copyToClipboard(text) {
    if (!navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Clipboard permission denied — silently no-op, nothing else we can do.
    }
  }

  async function shareDocument({ title, text }) {
    if (navigator.share) {
      try {
        await navigator.share({ title, text })
      } catch {
        // User cancelled the native share sheet — not an error.
      }
      return
    }
    await copyToClipboard(text)
  }

  return { copyToClipboard, shareDocument }
}
