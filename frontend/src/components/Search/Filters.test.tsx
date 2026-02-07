import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Filters } from './Filters'
import { useSearchStore } from '../../stores/searchStore'

describe('Filters', () => {
  beforeEach(() => {
    useSearchStore.setState({
      parsedFilters: null,
    })
  })

  it('should return null when parsedFilters is null', () => {
    const { container } = render(<Filters />)
    expect(container.firstChild).toBeNull()
  })

  it('should return null when no active filters', () => {
    useSearchStore.setState({
      parsedFilters: {
        bhk: null,
        min_price: null,
        max_price: null,
        area: null,
        amenities: [],
      },
    })

    const { container } = render(<Filters />)
    expect(container.firstChild).toBeNull()
  })

  it('should show BHK filter', () => {
    useSearchStore.setState({
      parsedFilters: {
        bhk: 2,
        min_price: null,
        max_price: null,
        area: null,
        amenities: [],
      },
    })

    render(<Filters />)
    expect(screen.getByText('2 BHK')).toBeInTheDocument()
  })

  it('should show max price filter', () => {
    useSearchStore.setState({
      parsedFilters: {
        bhk: null,
        min_price: null,
        max_price: 100,
        area: null,
        amenities: [],
      },
    })

    render(<Filters />)
    expect(screen.getByText('Under 100L')).toBeInTheDocument()
  })

  it('should show min price filter', () => {
    useSearchStore.setState({
      parsedFilters: {
        bhk: null,
        min_price: 50,
        max_price: null,
        area: null,
        amenities: [],
      },
    })

    render(<Filters />)
    expect(screen.getByText('Above 50L')).toBeInTheDocument()
  })

  it('should show price range filter', () => {
    useSearchStore.setState({
      parsedFilters: {
        bhk: null,
        min_price: 50,
        max_price: 100,
        area: null,
        amenities: [],
      },
    })

    render(<Filters />)
    expect(screen.getByText('50L - 100L')).toBeInTheDocument()
  })

  it('should show area filter', () => {
    useSearchStore.setState({
      parsedFilters: {
        bhk: null,
        min_price: null,
        max_price: null,
        area: 'Koramangala',
        amenities: [],
      },
    })

    render(<Filters />)
    expect(screen.getByText('Koramangala')).toBeInTheDocument()
  })

  it('should show amenities filters', () => {
    useSearchStore.setState({
      parsedFilters: {
        bhk: null,
        min_price: null,
        max_price: null,
        area: null,
        amenities: ['gym', 'pool'],
      },
    })

    render(<Filters />)
    expect(screen.getByText('gym')).toBeInTheDocument()
    expect(screen.getByText('pool')).toBeInTheDocument()
  })

  it('should show multiple filters', () => {
    useSearchStore.setState({
      parsedFilters: {
        bhk: 2,
        min_price: null,
        max_price: 80,
        area: 'Whitefield',
        amenities: ['parking'],
      },
    })

    render(<Filters />)
    expect(screen.getByText('2 BHK')).toBeInTheDocument()
    expect(screen.getByText('Under 80L')).toBeInTheDocument()
    expect(screen.getByText('Whitefield')).toBeInTheDocument()
    expect(screen.getByText('parking')).toBeInTheDocument()
  })

  it('should show "Filters detected:" label', () => {
    useSearchStore.setState({
      parsedFilters: {
        bhk: 2,
        min_price: null,
        max_price: null,
        area: null,
        amenities: [],
      },
    })

    render(<Filters />)
    expect(screen.getByText('Filters detected:')).toBeInTheDocument()
  })
})
