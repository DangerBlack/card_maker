import { create } from "zustand"
import type { CardTemplate, ProcessRule } from "../models/Template"
import type { CardElement } from "../models/Element"

interface EditorState {
    selectedElementId?: string
    setSelectedElement: (id?: string) => void
    
    template: CardTemplate
    setCardSize: (width: number, height: number) => void
    addElement: (el: CardElement) => void
    deleteElement: (id: string) => void
    updateElement: (id: string, updates: Partial<CardElement>) => void
    addCustomFont: (font: string) => void

    showGuides: boolean
    showGrid: boolean
    toggleGuides: () => void
    toggleGrid: () => void

    originalSampleCards: Record<string, string>[]
    sampleCards: Record<string, string>[]
    setSampleCards: (cards: Record<string, string>[]) => void
    
    exportTemplate: () => string
    importTemplate: (json: string) => void

    processRules: ProcessRule[]
    addProcessRule: (rule: ProcessRule) => void
    updateProcessRule: (index: number, rule: Partial<ProcessRule>) => void
    removeProcessRule: (index: number) => void
}

export const useEditorStore = create<EditorState>((set, get) => ({
    template: {
        width: 600,
        height: 825,
        elements: [],
        customFonts: []
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
    addCustomFont: (font) =>
        set((state) => {
            if (state.template.customFonts.includes(font)) {
                return {};
            }
            return {
                template: {
                    ...state.template,
                    customFonts: [...state.template.customFonts, font]
                }
            };
        }),


    showGuides: true,
    showGrid: false,

    toggleGuides: () =>
        set((state) => ({
            showGuides: !state.showGuides
        })),
    toggleGrid: () =>
        set((state) => ({
            showGrid: !state.showGrid
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
    originalSampleCards: [],
    sampleCards: [],

    setSampleCards: (cards) => {
        set({ sampleCards: cards })
        set({ originalSampleCards: cards })
    },

    // Export template as JSON string
    exportTemplate: () => {
        const template = get().template
        const processRules = get().processRules
        const bundle = { template, processRules }
        return JSON.stringify(bundle, null, 2)
    },

    // Import template from JSON string
    importTemplate: (json: string) => {
        try {
            const imported = JSON.parse(json)
            set({ template: imported.template, processRules: imported.processRules, selectedElementId: undefined })
        } catch (err) {
            console.error("Invalid JSON", err)
        }
    },

    processRules: [],

    addProcessRule: (rule) =>
        set((s) => {
            const nextRules = [...s.processRules, rule]
            const transformed = applyProcessRules(
                s.originalSampleCards,
                nextRules
            )

            return {
                processRules: nextRules,
                sampleCards: transformed,
            }
        }),

    updateProcessRule: (index, updates) =>
        set((s) => {
            const nextRules = s.processRules.map((r, i) =>
                i === index ? { ...r, ...updates } : r
            )

            const transformed = applyProcessRules(
                s.originalSampleCards,
                nextRules
            )

            return {
                processRules: nextRules,
                sampleCards: transformed,
            }
        }),

    removeProcessRule: (index) =>
        set((s) => {
            const nextRules = s.processRules.filter((_, i) => i !== index)

            const transformed = applyProcessRules(
                s.originalSampleCards,
                nextRules
            )

            return {
                processRules: nextRules,
                sampleCards: transformed,
            }
        }),
}))

function applyProcessRules(
    originalCards: Record<string, string>[],
    rules: ProcessRule[]
): Record<string, string>[] {
    return originalCards.map((card) => {
        let result = { ...card }

        for (const rule of rules) {

            const sourceValue = result[rule.key]

            let matches = false

            switch (rule.comparator) {
                case "=":
                    matches = sourceValue == rule.value
                    break
                case "!=":
                    matches = sourceValue != rule.value
                    break
                case "~":
                    matches =
                        typeof sourceValue === "string" &&
                        sourceValue.includes(rule.value)
                    break
                case "!~":
                    matches =
                        typeof sourceValue === "string" &&
                        !sourceValue.includes(rule.value)
                    break
                case ">":
                    matches = sourceValue > rule.value
                    break
                case "<":
                    matches = sourceValue < rule.value
                    break
                case ">=":
                    matches = sourceValue >= rule.value
                    break
                case "<=":
                    matches = sourceValue <= rule.value
                    break
            }

            if (matches) {
                result = {
                    ...result,
                    [rule.new_key]: rule.content,
                }
            }
        }

        return result
    })
}