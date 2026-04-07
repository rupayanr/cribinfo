import { useEffect, useRef, useState, useCallback } from 'react'
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw, Move } from 'lucide-react'
import mermaid from 'mermaid'
import { useTheme } from '../../hooks/useTheme'

const lightTheme = {
  theme: 'base' as const,
  themeVariables: {
    primaryColor: '#F3F4F6',
    primaryTextColor: '#1F2937',
    primaryBorderColor: '#9CA3AF',
    lineColor: '#6B7280',
    secondaryColor: '#E5E7EB',
    tertiaryColor: '#F9FAFB',
    background: '#FFFFFF',
    mainBkg: '#F3F4F6',
    nodeBorder: '#9CA3AF',
    clusterBkg: '#F9FAFB',
    clusterBorder: '#D1D5DB',
    titleColor: '#111827',
    edgeLabelBackground: '#FFFFFF',
    // Sequence diagram specific
    actorBkg: '#F3F4F6',
    actorBorder: '#9CA3AF',
    actorTextColor: '#1F2937',
    actorLineColor: '#6B7280',
    signalColor: '#1F2937',
    signalTextColor: '#1F2937',
    labelBoxBkgColor: '#F3F4F6',
    labelBoxBorderColor: '#9CA3AF',
    labelTextColor: '#1F2937',
    loopTextColor: '#1F2937',
    noteBorderColor: '#9CA3AF',
    noteBkgColor: '#FEF3C7',
    noteTextColor: '#1F2937',
    activationBorderColor: '#9CA3AF',
    activationBkgColor: '#E5E7EB',
    sequenceNumberColor: '#FFFFFF',
  },
}

const darkTheme = {
  theme: 'base' as const,
  themeVariables: {
    primaryColor: '#374151',
    primaryTextColor: '#F3F4F6',
    primaryBorderColor: '#6B7280',
    lineColor: '#9CA3AF',
    secondaryColor: '#4B5563',
    tertiaryColor: '#1F2937',
    background: '#111827',
    mainBkg: '#374151',
    nodeBorder: '#6B7280',
    clusterBkg: '#1F2937',
    clusterBorder: '#4B5563',
    titleColor: '#F9FAFB',
    edgeLabelBackground: '#1F2937',
    // General text colors
    textColor: '#F3F4F6',
    nodeTextColor: '#F3F4F6',
    // Sequence diagram specific
    actorBkg: '#374151',
    actorBorder: '#6B7280',
    actorTextColor: '#F3F4F6',
    actorLineColor: '#9CA3AF',
    signalColor: '#F3F4F6',
    signalTextColor: '#F3F4F6',
    messageTextColor: '#F3F4F6',
    messageLine0TextColor: '#F3F4F6',
    messageLine1TextColor: '#F3F4F6',
    labelBoxBkgColor: '#374151',
    labelBoxBorderColor: '#6B7280',
    labelTextColor: '#F3F4F6',
    loopTextColor: '#F3F4F6',
    noteBorderColor: '#6B7280',
    noteBkgColor: '#854D0E',
    noteTextColor: '#FEF3C7',
    activationBorderColor: '#6B7280',
    activationBkgColor: '#4B5563',
    sequenceNumberColor: '#FFFFFF',
  },
}

interface MermaidDiagramProps {
  chart: string
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const { isDark } = useTheme()

  // Render chart when theme or chart changes
  useEffect(() => {
    const renderChart = async () => {
      const themeConfig = isDark ? darkTheme : lightTheme
      mermaid.initialize({
        startOnLoad: false,
        ...themeConfig,
      })

      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`
      try {
        const { svg } = await mermaid.render(id, chart)
        setSvg(svg)
      } catch (error) {
        console.error('Mermaid render error:', error)
      }
    }
    renderChart()
  }, [chart, isDark])

  // Reset zoom and position when closing fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setZoom(1)
      setPosition({ x: 0, y: 0 })
    }
  }, [isFullscreen])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isFullscreen])

  const handleZoomIn = useCallback(() => setZoom((z) => Math.min(z + 0.25, 3)), [])
  const handleZoomOut = useCallback(() => setZoom((z) => Math.max(z - 0.25, 0.5)), [])
  const handleResetZoom = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
    }
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      setZoom((z) => Math.min(Math.max(z + delta, 0.5), 3))
    }
  }, [])

  return (
    <>
      {/* Normal view */}
      <div className="relative group">
        <div
          ref={containerRef}
          className="mermaid-container bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 overflow-x-auto shadow-sm [&_svg]:max-w-full [&_svg]:h-auto"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-gray-200 dark:border-gray-600"
          title="Expand diagram"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-900 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                title="Zoom out (-)"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300 min-w-[4rem] text-center tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                title="Zoom in (+)"
              >
                <ZoomIn size={20} />
              </button>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-2" />
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                title="Reset view"
              >
                <RotateCcw size={20} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
                <Move size={14} />
                Drag to pan
              </span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 transition-colors"
                title="Close (Esc)"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Diagram container with pan/zoom */}
          <div
            className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div className="w-full h-full flex items-center justify-center">
              <div
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                  transformOrigin: 'center center',
                }}
                className="mermaid-container transition-transform duration-75 [&_svg]:max-w-none select-none"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
