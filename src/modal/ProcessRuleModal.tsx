import { useEditorStore } from "../store/editorStore"
import { Modal } from "./Modal"

export function ProcessRulesModal({ onClose }: { onClose: () => void }) {
    const rules = useEditorStore((s) => s.processRules)
    const addRule = useEditorStore((s) => s.addProcessRule)
    const updateRule = useEditorStore((s) => s.updateProcessRule)
    const removeRule = useEditorStore((s) => s.removeProcessRule)

    return (
        <Modal onClose={onClose}>
            <h2>Process JSON rules</h2>

            {rules.map((rule, i) => {

                let content = rule.content;
                if (content && content.length > 20) {
                    content = content.substring(0, 10) + ".." + content.substring(content.length - 10);
                }
                return (
                <div
                    key={i}
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: 6,
                        padding: 10,
                        marginBottom: 10,
                    }}
                >
                    <p>If the value contained in the key <b>{rule.key||"<key>"}</b> <b>{rule.comparator}</b> <b>{rule.value||"<value>"}</b>, add a new key named <b>{rule.new_key||"<new_key>"}</b> with the following content <b>{content || "<content>"}</b></p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr", gap: 8 }}>
                        <input
                            placeholder="key"
                            value={rule.key}
                            onChange={(e) => updateRule(i, { key: e.target.value })}
                        />

                        <select
                            value={rule.comparator}
                            onChange={(e) =>
                                updateRule(i, { comparator: e.target.value as "=" | "!=" | "~" | "!~" | ">" | "<" | ">=" | "<=" })
                            }
                        >
                            <option value="=">=</option>
                            <option value="!=">!=</option>
                            <option value="~">~</option>
                            <option value="!~">!~</option>
                            <option value=">">&gt;</option>
                            <option value="<">&lt;</option>
                            <option value=">=">&gt;=</option>
                            <option value="<=">&lt;=</option>
                            <option value="null">null</option>
                            <option value="not null">not null</option>
                        </select>

                        <input
                            placeholder="value"
                            value={rule.value}
                            onChange={(e) => updateRule(i, { value: e.target.value })}
                        />
                    </div>

                    <div style={{ marginTop: 8 }}>
                        <input
                            placeholder="new_key"
                            value={rule.new_key}
                            onChange={(e) => updateRule(i, { new_key: e.target.value })}
                            style={{ width: "100%", marginBottom: 6 }}
                        />

                        <textarea
                            placeholder="content"
                            value={rule.content}
                            onChange={(e) => updateRule(i, { content: e.target.value })}
                            rows={3}
                            style={{ width: "100%" }}
                        />
                    </div>

                    <button
                        style={{ marginTop: 6, color: "red" }}
                        onClick={() => removeRule(i)}
                    >
                        Remove rule
                    </button>
                </div>
            )})}

            <button
                onClick={() =>
                    addRule({
                        key: "",
                        comparator: "=",
                        value: "",
                        new_key: "",
                        content: "",
                    })
                }
            >
                + Add rule
            </button>

            <div style={{ marginTop: 16, textAlign: "right" }}>
                <button onClick={onClose}>Close</button>
            </div>
        </Modal>
    )
}
