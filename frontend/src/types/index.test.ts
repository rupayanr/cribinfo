import { describe, it, expect } from 'vitest'
import type {
  Property,
  ChatMessage,
  SearchResponse,
  MessageRole,
  MessageContentType,
  City,
} from './index'

describe('Types', () => {
  describe('Property type', () => {
    it('should allow valid property object', () => {
      const property: Property = {
        id: 'test-1',
        city: 'bangalore',
        title: 'Test Property',
        area: 'Whitefield',
        bhk: 2,
        sqft: 1200,
        bathrooms: 2,
        price_lakhs: 85,
        amenities: ['gym', 'parking'],
        latitude: 12.9716,
        longitude: 77.5946,
      }

      expect(property.id).toBe('test-1')
      expect(property.city).toBe('bangalore')
      expect(property.bhk).toBe(2)
    })

    it('should allow null values for optional fields', () => {
      const property: Property = {
        id: 'test-2',
        city: 'mumbai',
        title: null,
        area: null,
        bhk: null,
        sqft: null,
        bathrooms: null,
        price_lakhs: null,
        amenities: [],
        latitude: null,
        longitude: null,
      }

      expect(property.title).toBeNull()
      expect(property.bhk).toBeNull()
    })
  })

  describe('ChatMessage type', () => {
    it('should allow valid user message', () => {
      const message: ChatMessage = {
        id: 'msg-1',
        role: 'user',
        contentType: 'text',
        text: 'Looking for 2BHK',
        timestamp: new Date(),
      }

      expect(message.role).toBe('user')
      expect(message.contentType).toBe('text')
    })

    it('should allow valid assistant message with properties', () => {
      const property: Property = {
        id: 'test-1',
        city: 'bangalore',
        title: 'Test',
        area: 'Whitefield',
        bhk: 2,
        sqft: 1200,
        bathrooms: 2,
        price_lakhs: 85,
        amenities: [],
        latitude: 12.97,
        longitude: 77.59,
      }

      const message: ChatMessage = {
        id: 'msg-2',
        role: 'assistant',
        contentType: 'properties',
        text: 'Found 1 property',
        properties: [property],
        filters: {
          bhk: 2,
          min_price: null,
          max_price: null,
          min_sqft: null,
          max_sqft: null,
          area: null,
          amenities: [],
        },
        timestamp: new Date(),
      }

      expect(message.role).toBe('assistant')
      expect(message.properties).toHaveLength(1)
    })
  })

  describe('SearchResponse type', () => {
    it('should allow valid search response', () => {
      const response: SearchResponse = {
        results: [],
        parsed_filters: {
          bhk: 2,
          min_price: null,
          max_price: 100,
          min_sqft: null,
          max_sqft: null,
          area: 'Whitefield',
          amenities: ['gym'],
        },
        total: 0,
        match_type: 'exact',
        relaxed_filters: [],
      }

      expect(response.match_type).toBe('exact')
      expect(response.relaxed_filters).toEqual([])
    })

    it('should allow partial match type', () => {
      const response: SearchResponse = {
        results: [],
        parsed_filters: {
          bhk: null,
          min_price: null,
          max_price: null,
          min_sqft: null,
          max_sqft: null,
          area: null,
          amenities: [],
        },
        total: 0,
        match_type: 'partial',
        relaxed_filters: ['bhk'],
      }

      expect(response.match_type).toBe('partial')
      expect(response.relaxed_filters).toContain('bhk')
    })

    it('should allow similar match type', () => {
      const response: SearchResponse = {
        results: [],
        parsed_filters: {
          bhk: null,
          min_price: null,
          max_price: null,
          min_sqft: null,
          max_sqft: null,
          area: null,
          amenities: [],
        },
        total: 0,
        match_type: 'similar',
        relaxed_filters: ['bhk', 'area', 'price'],
      }

      expect(response.match_type).toBe('similar')
    })
  })

  describe('MessageRole type', () => {
    it('should only allow user or assistant', () => {
      const userRole: MessageRole = 'user'
      const assistantRole: MessageRole = 'assistant'

      expect(userRole).toBe('user')
      expect(assistantRole).toBe('assistant')
    })
  })

  describe('MessageContentType type', () => {
    it('should allow all content types', () => {
      const textType: MessageContentType = 'text'
      const propertiesType: MessageContentType = 'properties'
      const errorType: MessageContentType = 'error'

      expect(textType).toBe('text')
      expect(propertiesType).toBe('properties')
      expect(errorType).toBe('error')
    })
  })

  describe('City type', () => {
    it('should allow valid city object', () => {
      const city: City = {
        name: 'bangalore',
        label: 'Bangalore',
      }

      expect(city.name).toBe('bangalore')
      expect(city.label).toBe('Bangalore')
    })
  })
})
