import type { CardElement } from "./Element"

export interface CardTemplate {
  width: number
  height: number
  elements: CardElement[]
  customFonts: string[]
}

export type ProcessRule = {
  key: string
  comparator: "=" | "!=" | "~" | "!~" | ">" | "<" | ">=" | "<=" | "null" | "not null"
  value: string
  new_key: string
  content: string
}