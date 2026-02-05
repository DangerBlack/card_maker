import { create } from "zustand"
import type { CardTemplate, ProcessRule } from "../models/Template"
import type { CardElement } from "../models/Element"
import { persist, createJSONStorage } from "zustand/middleware"
import { indexedDbStorage } from "./indexedDbStorage"

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
    showPreview: boolean
    toggleGuides: () => void
    toggleGrid: () => void
    togglePreview: () => void

    originalSampleCards: Record<string, string>[]
    sampleCards: Record<string, string>[]
    setSampleCards: (cards: Record<string, string>[]) => void

    exportTemplate: () => string
    importTemplate: (json: string) => void

    processRules: ProcessRule[]
    addProcessRule: (rule: ProcessRule) => void
    updateProcessRule: (index: number, rule: Partial<ProcessRule>) => void
    removeProcessRule: (index: number) => void

    history: CardTemplate[]
    historyIndex: number

    undo: () => void
    redo: () => void
    clearHistory: () => void
}

export const useEditorStore = create<EditorState>()(
    persist((set, get) => ({
        template: {
            width: 600,
            height: 825,
            elements: [],
            customFonts: []
        },
        selectedElementId: undefined,
        setSelectedElement: (id) => set({ selectedElementId: id }),

        addElement: (el) =>
            set((state) => {
                const newTemplate = {
                    ...state.template,
                    elements: [...state.template.elements, el],
                }

                const nextHistory = state.history.slice(0, state.historyIndex + 1)
                nextHistory.push(structuredClone(newTemplate))

                return {
                    template: newTemplate,
                    history: nextHistory.slice(-50),
                    historyIndex: Math.min(nextHistory.length - 1, 49),
                }
            }),

        deleteElement: (id) =>
            set((state) => {
                const newTemplate = {
                    ...state.template,
                    elements: state.template.elements.filter((el) => el.id !== id),
                }

                const nextHistory = state.history.slice(0, state.historyIndex + 1)
                nextHistory.push(structuredClone(newTemplate))

                return {
                    template: newTemplate,
                    selectedElementId: state.selectedElementId === id ? undefined : state.selectedElementId,
                    history: nextHistory.slice(-50),
                    historyIndex: Math.min(nextHistory.length - 1, 49),
                }
            }),

        updateElement: (id, updates) =>
            set((state) => {
                const newTemplate = {
                    ...state.template,
                    elements: state.template.elements.map((el) =>
                        el.id === id ? { ...el, ...updates } as CardElement : el
                    ),
                }

                const nextHistory = state.history.slice(0, state.historyIndex + 1)
                nextHistory.push(structuredClone(newTemplate))

                return {
                    template: newTemplate,
                    history: nextHistory.slice(-50),
                    historyIndex: Math.min(nextHistory.length - 1, 49),
                }
            }),

        addCustomFont: (font) =>
            set((state) => {
                if (state.template.customFonts.includes(font)) {
                    return {}
                }

                const newTemplate = {
                    ...state.template,
                    customFonts: [...state.template.customFonts, font],
                }

                const nextHistory = state.history.slice(0, state.historyIndex + 1)
                nextHistory.push(structuredClone(newTemplate))

                return {
                    template: newTemplate,
                    history: nextHistory.slice(-50),
                    historyIndex: Math.min(nextHistory.length - 1, 49),
                }
            }),



        showGuides: true,
        showGrid: false,
        showPreview: false,

        toggleGuides: () =>
            set((state) => ({
                showGuides: !state.showGuides
            })),
        toggleGrid: () =>
            set((state) => ({
                showGrid: !state.showGrid
            })),
        togglePreview: () =>
            set((state) => ({
                showPreview: !state.showPreview
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

        history: [structuredClone({
            width: 600,
            height: 825,
            elements: [],
            customFonts: []
        })],
        historyIndex: 0,

        undo: () =>
            set((state) => {
                if (state.historyIndex <= 0) return {}
                const index = state.historyIndex - 1
                return {
                    historyIndex: index,
                    template: structuredClone(state.history[index]),
                }
            }),

        redo: () =>
            set((state) => {
                if (state.historyIndex >= state.history.length - 1) return {}
                const index = state.historyIndex + 1
                return {
                    historyIndex: index,
                    template: structuredClone(state.history[index]),
                }
            }),
        clearHistory: () =>
            set({
                history: [structuredClone({
                    width: 600,
                    height: 825,
                    elements: [],
                    customFonts: []
                })],
                historyIndex: 0,
            }),
    }),
        {
            name: "card_storage",
            storage: createJSONStorage(() => indexedDbStorage),
            partialize: (state) => ({
                template: state.template,
                processRules: state.processRules,
                sampleCards: state.sampleCards,
                originalSampleCards: state.originalSampleCards,
            }),
        }
    )
)


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
                    matches = `${sourceValue}`.includes(rule.value)
                    break
                case "!~":
                    matches = !`${sourceValue}`.includes(rule.value)
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
                case "null":
                    matches = sourceValue === undefined || sourceValue === null || sourceValue === ""
                    break
                case "not null":
                    matches = sourceValue !== undefined && sourceValue !== null && sourceValue !== ""
                    break
                case "custom":
                    try {
                        const func = new Function("value", `return ${rule.content}`)
                        const content = func(sourceValue)
                        matches = false
                        result = {
                            ...result,
                            [rule.new_key]: content,
                        }
                    } catch (err) {
                        console.error("Error in custom comparator:", err)
                        matches = false
                    }
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