import { create } from "zustand"
import type { CardTemplate } from "../models/Template"
import type { CardElement } from "../models/Element"

interface EditorState {
    template: CardTemplate

    selectedElementId?: string
    setSelectedElement: (id?: string) => void

    addElement: (el: CardElement) => void
    deleteElement: (id: string) => void
    updateElement: (id: string, updates: Partial<CardElement>) => void

    showGuides: boolean
    toggleGuides: () => void
    setCardSize: (width: number, height: number) => void

      sampleCards: Record<string, object>[]                // <-- add this
    setSampleCards: (cards: Record<string, object>[]) => void // <-- add this

    exportTemplate: () => string
    importTemplate: (json: string) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
    template: {
        width: 400,
        height: 600,
        elements: []
    },
    selectedElementId: undefined,
    setSelectedElement: (id) => set({ selectedElementId: id }),
    addElement: (el) =>
        set((state) => ({
            template: { ...state.template, elements: [...state.template.elements, el] }
        })),
    deleteElement: (id) =>
        set((state) => ({
            template: {
                ...state.template,
                elements: state.template.elements.filter((el) => el.id !== id)
            },
            selectedElementId:
                state.selectedElementId === id ? undefined : state.selectedElementId
        })),
    updateElement: (id, updates) =>
        set((state) => ({
            template: {
                ...state.template,
                elements: state.template.elements.map((el) =>
                    el.id === id ? { ...el, ...updates } as CardElement : el
                )
            }
        })),

    showGuides: true,

    toggleGuides: () =>
        set((state) => ({
            showGuides: !state.showGuides
        })),

    setCardSize: (width, height) =>
        set((state) => ({
            template: {
                ...state.template,
                width,
                height
            }
        })),

    // Sample cards state management
    sampleCards: [],

    setSampleCards: (cards) => set({ sampleCards: cards }),

    // Export template as JSON string
    exportTemplate: () => {
        const template = get().template
        return JSON.stringify(template, null, 2)
    },

    // Import template from JSON string
    importTemplate: (json: string) => {
        try {
            const imported = JSON.parse(json)
            set({ template: imported, selectedElementId: undefined })
        } catch (err) {
            console.error("Invalid JSON", err)
        }
    }
}))
