export interface Property {
  id: string
  city: string
  title: string | null
  area: string | null
  bhk: number | null
  sqft: number | null
  bathrooms: number | null
  price_lakhs: number | null
  amenities: string[]
  latitude: number | null
  longitude: number | null
}

export type MessageRole = 'user' | 'assistant'
export type MessageContentType = 'text' | 'properties' | 'error'

export interface ChatMessage {
  id: string
  role: MessageRole
  contentType: MessageContentType
  text: string
  properties?: Property[]
  filters?: ParsedFilters
  timestamp: Date
}

export interface SearchResponse {
  results: Property[]
  parsed_filters: ParsedFilters
  total: number
  match_type: 'exact' | 'partial' | 'similar'
  relaxed_filters: string[]
}

export interface ParsedFilters {
  bhk: number | null
  min_price: number | null
  max_price: number | null
  min_sqft: number | null
  max_sqft: number | null
  area: string | null
  amenities: string[]
}

export interface City {
  name: string
  label: string
}
