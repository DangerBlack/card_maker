import { useState } from "react"
import { useEditorStore } from "../store/editorStore"
import { Modal } from "./Modal"
import { loadGoogleFont, parseGoogleFontName } from "../utils/googleFonts"

interface AddFontModalProps {
  onClose: () => void
}

export function AddFontModal({ onClose }: AddFontModalProps) {
  const addCustomFont = useEditorStore((s) => s.addCustomFont)
  const [fontUrl, setFontUrl] = useState("")
  const [fontError, setFontError] = useState("")

  const apply = () => {
    const name = parseGoogleFontName(fontUrl)
    if (!name) {
      setFontError("Invalid Google Fonts URL")
      return
    }
    loadGoogleFont(fontUrl)
    addCustomFont(name)
    setFontUrl("")
    setFontError("")
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") apply()
    if (e.key === "Escape") onClose()
  }

  return (
    <Modal onClose={onClose}>
      <div
        onKeyDown={handleKeyDown}
        tabIndex={0}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <h2>Add Google Font</h2>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          Google Fonts URL
          <input
            type="text"
            placeholder="Paste Google Fonts URL"
            value={fontUrl}
            onChange={(e) => setFontUrl(e.target.value)}
            style={{ padding: 6, fontSize: 14 }}
          />
        </label>

        {fontError && (
          <div style={{ color: "red", fontSize: 12 }}>{fontError}</div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
          <button
            onClick={apply}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #888",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            Add
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: 4,
              border: "1px solid #888",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  )
}
