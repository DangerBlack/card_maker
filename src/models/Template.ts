import type { CardElement } from "./Element"

export interface CardTemplate {
  width: number
  height: number
  elements: CardElement[]
}

export type ProcessRule = {
  key: string
  comparator: "=" | "!=" | "~" | "!~" | ">" | "<" | ">=" | "<="
  value: string
  new_key: string
  content: string
}