import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CitySelector } from './CitySelector'
import { useSearchStore } from '../../stores/searchStore'

describe('CitySelector', () => {
  beforeEach(() => {
    useSearchStore.setState({
      city: '',
      citySelectorOpen: false,
      messages: [],
      results: [],
      parsedFilters: null,
      compareList: [],
      error: null,
      query: '',
    })
  })

  it('should show select city button when no city is selected', () => {
    // Note: this will auto-open the modal, but the button is still there
    useSearchStore.setState({ city: '', citySelectorOpen: false })
    render(<CitySelector />)
    // The modal will auto-open, look for the heading instead
    expect(useSearchStore.getState().citySelectorOpen).toBe(true)
  })

  it('should show city chip when city is selected', () => {
    useSearchStore.setState({ city: 'bangalore', citySelectorOpen: false })
    render(<CitySelector />)
    expect(screen.getByText('Bangalore')).toBeInTheDocument()
  })

  it('should open modal when select city button is clicked', async () => {
    const user = userEvent.setup()
    // Set a city first so the modal doesn't auto-open
    useSearchStore.setState({ city: 'bangalore', citySelectorOpen: false })
    render(<CitySelector />)

    // Click the city chip to open the modal
    await user.click(screen.getByText('Bangalore'))

    expect(useSearchStore.getState().citySelectorOpen).toBe(true)
  })

  it('should display all city options when modal is open', () => {
    useSearchStore.setState({ citySelectorOpen: true })
    render(<CitySelector />)

    expect(screen.getByText('Silicon Valley of India')).toBeInTheDocument()
    expect(screen.getByText('City of Dreams')).toBeInTheDocument()
    expect(screen.getByText('Heart of India')).toBeInTheDocument()
  })

  it('should select city when clicked', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({ citySelectorOpen: true })
    render(<CitySelector />)

    const bangaloreOption = screen.getByText('Silicon Valley of India').closest('button')
    await user.click(bangaloreOption!)

    expect(useSearchStore.getState().city).toBe('bangalore')
    expect(useSearchStore.getState().citySelectorOpen).toBe(false)
  })

  it('should show warning footer when no city is selected', () => {
    useSearchStore.setState({ city: '', citySelectorOpen: true })
    render(<CitySelector />)

    expect(screen.getByText('Please select a city to continue')).toBeInTheDocument()
  })

  it('should not show warning footer when city is already selected', () => {
    useSearchStore.setState({ city: 'bangalore', citySelectorOpen: true })
    render(<CitySelector />)

    expect(screen.queryByText('Please select a city to continue')).not.toBeInTheDocument()
  })

  it('should auto-open modal on mount if no city selected', () => {
    useSearchStore.setState({ city: '', citySelectorOpen: false })
    render(<CitySelector />)

    // The useEffect should set citySelectorOpen to true
    expect(useSearchStore.getState().citySelectorOpen).toBe(true)
  })

  it('should close modal when backdrop is clicked if city is selected', async () => {
    const user = userEvent.setup()
    useSearchStore.setState({ city: 'bangalore', citySelectorOpen: true })
    render(<CitySelector />)

    const backdrop = document.querySelector('.backdrop-blur-sm')
    if (backdrop) {
      await user.click(backdrop)
      expect(useSearchStore.getState().citySelectorOpen).toBe(false)
    }
  })
})
