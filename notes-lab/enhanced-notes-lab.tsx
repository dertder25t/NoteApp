"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  ArrowLeft,
  Rocket,
  Plus,
  FileText,
  Brain,
  FileImage,
  Layers,
  GripHorizontal,
  X,
  Check,
  Sparkles,
  User,
  Clock,
  Bot,
  Palette,
  Mic,
  Play,
  Square,
  PanelLeftClose,
  PanelLeftOpen,
  Grid3X3,
  List,
  MoreHorizontal,
  Edit3,
  Copy,
  Trash2,
  ChevronDown,
  Volume2,
  Database,
  ImageIcon,
  Video,
  Calculator,
  Globe,
  Code,
  Music,
  Calendar,
  Mail,
  MessageSquare,
  Bell,
  Download,
  RefreshCw,
  Move,
  Tag,
  Link,
} from "lucide-react"

type ViewMode = "canvas" | "tabs"
type StudyMethod = "flashcards" | "written" | "multiple" | "matching"
type CurrentView = "notes-lab" | "profile"
type SidebarView = "topics" | "raw-data" | "tags"
type TabType =
  | "note"
  | "voice-recording"
  | "voice-database"
  | "voice-transcript"
  | "flashcards"
  | "mindmap"
  | "pdf"
  | "calculator"
  | "web"
  | "code"
  | "music"
  | "image"
  | "video"
  | "calendar"
  | "mail"
  | "chat"
type TabPosition = "top" | "bottom" | "left" | "right"

interface TabItem {
  id: string
  type: TabType
  title: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  content?: React.ReactNode
  parentId?: string
  children?: string[]
  position: TabPosition
  isMinimized?: boolean
  tags?: string[]
}

interface TabPanel {
  id: string
  title: string
  tabs: TabItem[]
  activeTab: string
  width: number
  height: number
  x: number
  y: number
  showIcons: boolean
}

interface CanvasItem {
  id: string
  type: TabType
  title: string
  content?: string
  x: number
  y: number
  width: number
  height: number
  isDragging?: boolean
  color: string
  icon: React.ComponentType<{ className?: string }>
  tags?: string[]
}

interface VoiceRecording {
  id: string
  title: string
  duration: number
  transcript?: string
  audioUrl?: string
  linkedNoteId?: string
  timestamp: number
}

interface MindMapNode {
  id: string
  label: string
  x: number
  y: number
  color?: string
  size?: number
}

interface MindMapConnection {
  from: string
  to: string
  id: string
  label?: string
  color?: string
}

interface FlashcardDeck {
  id: string
  title: string
  cards: Array<{ question: string; answer: string }>
}

interface UserProfile {
  name: string
  email: string
  avatar: string
  totalStudyTime: number
  weeklyGoal: number
  currentStreak: number
  totalSessions: number
}

interface StudyItem {
  id: string
  type: "flashcard" | "note" | "mindmap" | "voice"
  title: string
  content?: any
}

interface TagType {
  id: string
  name: string
  color: string
  count: number
}

interface EnhancedNotesLabProps {
  onBackToDashboard: () => void
  folderName: string
}

const TAB_TYPES: Record<TabType, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> =
  {
    note: { icon: FileText, label: "Note", color: "bg-blue-500" },
    "voice-recording": { icon: Mic, label: "Voice Recording", color: "bg-red-500" },
    "voice-database": { icon: Database, label: "Voice Database", color: "bg-purple-500" },
    "voice-transcript": { icon: Volume2, label: "Voice Transcript", color: "bg-green-500" },
    flashcards: { icon: Layers, label: "Flashcards", color: "bg-orange-500" },
    mindmap: { icon: Brain, label: "Mind Map", color: "bg-pink-500" },
    pdf: { icon: FileImage, label: "PDF", color: "bg-red-600" },
    calculator: { icon: Calculator, label: "Calculator", color: "bg-gray-500" },
    web: { icon: Globe, label: "Web Browser", color: "bg-cyan-500" },
    code: { icon: Code, label: "Code Editor", color: "bg-indigo-500" },
    music: { icon: Music, label: "Music Player", color: "bg-violet-500" },
    image: { icon: ImageIcon, label: "Image Viewer", color: "bg-emerald-500" },
    video: { icon: Video, label: "Video Player", color: "bg-rose-500" },
    calendar: { icon: Calendar, label: "Calendar", color: "bg-amber-500" },
    mail: { icon: Mail, label: "Email", color: "bg-teal-500" },
    chat: { icon: MessageSquare, label: "Chat", color: "bg-lime-500" },
  }

export default function EnhancedNotesLab({ onBackToDashboard, folderName }: EnhancedNotesLabProps) {
  const [currentView, setCurrentView] = useState<CurrentView>("notes-lab")
  const [viewMode, setViewMode] = useState<ViewMode>("tabs")
  const [showStudyMode, setShowStudyMode] = useState(false)
  const [studyStep, setStudyStep] = useState<"setup" | "study">("setup")
  const [selectedStudyItems, setSelectedStudyItems] = useState<string[]>([])
  const [studyMethod, setStudyMethod] = useState<StudyMethod>("flashcards")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [studyProgress, setStudyProgress] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedTab, setSelectedTab] = useState("note-1")
  const [isOrganizing, setIsOrganizing] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarView, setSidebarView] = useState<SidebarView>("topics")
  const [showToolPalette, setShowToolPalette] = useState(false)
  const [draggedTabType, setDraggedTabType] = useState<TabType | null>(null)
  const [editingTab, setEditingTab] = useState<string | null>(null)
  const [editingTabName, setEditingTabName] = useState("")
  const [showAddTabPopover, setShowAddTabPopover] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showTagInput, setShowTagInput] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState("")

  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const [showRecordingPopout, setShowRecordingPopout] = useState(false)
  const [currentRecordingId, setCurrentRecordingId] = useState<string | null>(null)
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Mind map editing state
  const [editingMindMap, setEditingMindMap] = useState(false)
  const [selectedMindMapNode, setSelectedMindMapNode] = useState<string | null>(null)
  const [mindMapNodes, setMindMapNodes] = useState<MindMapNode[]>([
    { id: "light", label: "Light Energy", x: 50, y: 50, color: "bg-yellow-400" },
    { id: "water", label: "H₂O", x: 50, y: 150, color: "bg-blue-400" },
    { id: "co2", label: "CO₂", x: 50, y: 200, color: "bg-gray-400" },
    { id: "chloroplast", label: "Chloroplast", x: 150, y: 125, color: "bg-green-400" },
    { id: "glucose", label: "Glucose", x: 250, y: 100, color: "bg-orange-400" },
    { id: "oxygen", label: "O₂", x: 250, y: 150, color: "bg-blue-300" },
  ])
  const [mindMapConnections, setMindMapConnections] = useState<MindMapConnection[]>([
    { id: "conn-1", from: "light", to: "chloroplast", label: "Energy", color: "stroke-yellow-400" },
    { id: "conn-2", from: "chloroplast", to: "glucose", label: "Produces", color: "stroke-green-400" },
    { id: "conn-3", from: "water", to: "chloroplast", label: "Input", color: "stroke-blue-400" },
    { id: "conn-4", from: "co2", to: "chloroplast", label: "Input", color: "stroke-gray-400" },
    { id: "conn-5", from: "chloroplast", to: "oxygen", label: "Releases", color: "stroke-green-400" },
  ])

  // Tags system
  const [tags, setTags] = useState<TagType[]>([
    { id: "important", name: "Important", color: "bg-red-500", count: 3 },
    { id: "review", name: "Review", color: "bg-yellow-500", count: 2 },
    { id: "completed", name: "Completed", color: "bg-green-500", count: 1 },
    { id: "biology", name: "Biology", color: "bg-blue-500", count: 4 },
  ])

  // Enhanced tab panels with single panel to start
  const [tabPanels, setTabPanels] = useState<TabPanel[]>([
    {
      id: "panel-1",
      title: "Main Panel",
      activeTab: "note-1",
      width: 100,
      height: 100,
      x: 0,
      y: 0,
      showIcons: false,
      tabs: [
        {
          id: "note-1",
          type: "note",
          title: "Cell Structure",
          icon: FileText,
          color: "bg-blue-500",
          position: "top",
          children: ["note-1-1", "note-1-2"],
          tags: ["biology", "important"],
        },
        {
          id: "note-1-1",
          type: "note",
          title: "Nucleus",
          icon: FileText,
          color: "bg-blue-400",
          position: "top",
          parentId: "note-1",
          tags: ["biology"],
        },
        {
          id: "note-1-2",
          type: "note",
          title: "Mitochondria",
          icon: FileText,
          color: "bg-blue-400",
          position: "top",
          parentId: "note-1",
          tags: ["biology", "important"],
        },
        {
          id: "voice-1",
          type: "voice-recording",
          title: "Lecture Notes",
          icon: Mic,
          color: "bg-red-500",
          position: "top",
          tags: ["review"],
        },
        {
          id: "flashcards-1",
          type: "flashcards",
          title: "Biology Deck",
          icon: Layers,
          color: "bg-orange-500",
          position: "top",
          tags: ["biology", "review"],
        },
      ],
    },
  ])

  // Voice recording state
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordings, setRecordings] = useState<VoiceRecording[]>([
    {
      id: "rec-1",
      title: "Cell Structure Notes",
      duration: 120,
      transcript: "The cell is the basic unit of life...",
      linkedNoteId: "note-1",
      timestamp: Date.now() - 3600000,
    },
    {
      id: "rec-2",
      title: "Photosynthesis Overview",
      duration: 95,
      transcript: "Photosynthesis is the process...",
      timestamp: Date.now() - 7200000,
    },
  ])
  const [isTranscribing, setIsTranscribing] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [canvasScale, setCanvasScale] = useState(1)
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([
    {
      id: "canvas-note-1",
      type: "note",
      title: "Cell Structure",
      content:
        "Overview of cellular components and their functions including nucleus, mitochondria, and cell membrane...",
      x: 100,
      y: 100,
      width: 280,
      height: 200,
      color: "bg-blue-500",
      icon: FileText,
      tags: ["biology", "important"],
    },
    {
      id: "canvas-note-2",
      type: "note",
      title: "Photosynthesis Process",
      content: "The process by which plants convert light energy into chemical energy...",
      x: 400,
      y: 300,
      width: 280,
      height: 200,
      color: "bg-blue-500",
      icon: FileText,
      tags: ["biology"],
    },
    {
      id: "canvas-mindmap-1",
      type: "mindmap",
      title: "Photosynthesis",
      x: 200,
      y: 400,
      width: 300,
      height: 250,
      color: "bg-pink-500",
      icon: Brain,
      tags: ["biology", "review"],
    },
  ])

  const [userProfile] = useState<UserProfile>({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    avatar: "/placeholder.svg?height=64&width=64",
    totalStudyTime: 2847,
    weeklyGoal: 600,
    currentStreak: 12,
    totalSessions: 156,
  })

  const flashcardDecks: FlashcardDeck[] = [
    {
      id: "deck-1",
      title: "Cell Biology Deck",
      cards: [
        { question: "What is the powerhouse of the cell?", answer: "Mitochondria" },
        { question: "What controls cell activities?", answer: "Nucleus" },
        { question: "What gives plants their green color?", answer: "Chlorophyll" },
      ],
    },
  ]

  // Study items for multi-select
  const studyItems: StudyItem[] = [
    { id: "deck-1", type: "flashcard", title: "Cell Biology Deck", content: flashcardDecks[0] },
    { id: "note-1", type: "note", title: "Cell Structure Notes", content: "Cell structure content..." },
    { id: "mindmap-1", type: "mindmap", title: "Photosynthesis Map", content: "Mind map data..." },
    { id: "voice-1", type: "voice", title: "Lecture Recording", content: recordings[0] },
  ]

  // Topic-based organization
  const topicItems = {
    "Cell Biology": [
      { id: "note-1", type: "note", title: "Cell Structure", icon: FileText, tags: ["biology", "important"] },
      { id: "flashcards-1", type: "flashcards", title: "Cell Biology Deck", icon: Layers, tags: ["biology", "review"] },
    ],
    Photosynthesis: [
      { id: "note-2", type: "note", title: "Photosynthesis Process", icon: FileText, tags: ["biology"] },
      { id: "mindmap-1", type: "mindmap", title: "Photosynthesis Map", icon: Brain, tags: ["biology", "review"] },
    ],
    Resources: [{ id: "pdf-1", type: "pdf", title: "Textbook Chapter 3", icon: FileImage, tags: [] }],
  }

  const rawDataItems = [
    { id: "note-1", type: "note", title: "Cell Structure", icon: FileText, tags: ["biology", "important"] },
    { id: "note-2", type: "note", title: "Photosynthesis Process", icon: FileText, tags: ["biology"] },
    { id: "pdf-1", type: "pdf", title: "Textbook Chapter 3", icon: FileImage, tags: [] },
    { id: "flashcards-1", type: "flashcards", title: "Cell Biology Deck", icon: Layers, tags: ["biology", "review"] },
    { id: "mindmap-1", type: "mindmap", title: "Photosynthesis Map", icon: Brain, tags: ["biology", "review"] },
  ]

  // Recording timer effect
  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current)
      }
    }
  }, [isRecording])

  // Filter functions
  const filterItemsByTags = (items: any[]) => {
    if (selectedTags.length === 0 && !searchQuery) return items

    return items.filter((item) => {
      const matchesSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTags =
        selectedTags.length === 0 || (item.tags && selectedTags.some((tag) => item.tags.includes(tag)))
      return matchesSearch && matchesTags
    })
  }

  // Tag management functions
  const addTag = (itemId: string, tagName: string) => {
    const existingTag = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase())
    const tagId = existingTag?.id || `tag-${Date.now()}`

    if (!existingTag) {
      const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500"]
      const newTag: TagType = {
        id: tagId,
        name: tagName,
        color: colors[Math.floor(Math.random() * colors.length)],
        count: 1,
      }
      setTags((prev) => [...prev, newTag])
    } else {
      setTags((prev) => prev.map((t) => (t.id === tagId ? { ...t, count: t.count + 1 } : t)))
    }

    // Add tag to tab
    setTabPanels((panels) =>
      panels.map((panel) => ({
        ...panel,
        tabs: panel.tabs.map((tab) => (tab.id === itemId ? { ...tab, tags: [...(tab.tags || []), tagName] } : tab)),
      })),
    )

    // Add tag to canvas items
    setCanvasItems((items) =>
      items.map((item) => (item.id === itemId ? { ...item, tags: [...(item.tags || []), tagName] } : item)),
    )
  }

  const removeTag = (itemId: string, tagName: string) => {
    // Remove from tab
    setTabPanels((panels) =>
      panels.map((panel) => ({
        ...panel,
        tabs: panel.tabs.map((tab) =>
          tab.id === itemId ? { ...tab, tags: (tab.tags || []).filter((t) => t !== tagName) } : tab,
        ),
      })),
    )

    // Remove from canvas items
    setCanvasItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, tags: (item.tags || []).filter((t) => t !== tagName) } : item,
      ),
    )

    // Update tag count
    setTags((prev) => prev.map((t) => (t.name === tagName ? { ...t, count: Math.max(0, t.count - 1) } : t)))
  }

  // Tab management functions
  const addTabToPanel = (panelId: string, tabType: TabType, position: TabPosition = "top") => {
    const newTabId = `${tabType}-${Date.now()}`
    const tabConfig = TAB_TYPES[tabType]

    const newTab: TabItem = {
      id: newTabId,
      type: tabType,
      title: tabConfig.label,
      icon: tabConfig.icon,
      color: tabConfig.color,
      position,
      tags: [],
    }

    setTabPanels((panels) =>
      panels.map((panel) =>
        panel.id === panelId
          ? {
              ...panel,
              tabs: [...panel.tabs, newTab],
              activeTab: newTabId,
              showIcons: panel.tabs.length >= 4,
            }
          : panel,
      ),
    )

    // Also add to canvas items for potential canvas use
    const newCanvasItem: CanvasItem = {
      id: `canvas-${newTabId}`,
      type: tabType,
      title: tabConfig.label,
      x: Math.random() * 200 + 100,
      y: Math.random() * 200 + 100,
      width: 280,
      height: 200,
      color: tabConfig.color,
      icon: tabConfig.icon,
      content: `Content for ${tabConfig.label}`,
      tags: [],
    }

    setCanvasItems((items) => [...items, newCanvasItem])
    setShowAddTabPopover(null)
  }

  const addPanelToRight = () => {
    const newPanel: TabPanel = {
      id: `panel-${Date.now()}`,
      title: `Panel ${tabPanels.length + 1}`,
      activeTab: "",
      width: 50,
      height: 100,
      x: 50,
      y: 0,
      showIcons: false,
      tabs: [],
    }

    // Adjust existing panels width
    const updatedPanels = tabPanels.map((panel) => ({
      ...panel,
      width: 50,
    }))

    setTabPanels([...updatedPanels, newPanel])
  }

  const removeTab = (panelId: string, tabId: string) => {
    setTabPanels((panels) =>
      panels.map((panel) => {
        if (panel.id === panelId) {
          const updatedTabs = panel.tabs.filter((tab) => tab.id !== tabId)
          const newActiveTab =
            updatedTabs.length > 0 ? (panel.activeTab === tabId ? updatedTabs[0].id : panel.activeTab) : ""

          return {
            ...panel,
            tabs: updatedTabs,
            activeTab: newActiveTab,
            showIcons: updatedTabs.length >= 4,
          }
        }
        return panel
      }),
    )
  }

  const updateTabName = (panelId: string, tabId: string, newName: string) => {
    setTabPanels((panels) =>
      panels.map((panel) =>
        panel.id === panelId
          ? {
              ...panel,
              tabs: panel.tabs.map((tab) => (tab.id === tabId ? { ...tab, title: newName } : tab)),
            }
          : panel,
      ),
    )
  }

  const updateTabColor = (panelId: string, tabId: string, newColor: string) => {
    setTabPanels((panels) =>
      panels.map((panel) =>
        panel.id === panelId
          ? {
              ...panel,
              tabs: panel.tabs.map((tab) => (tab.id === tabId ? { ...tab, color: newColor } : tab)),
            }
          : panel,
      ),
    )
  }

  const duplicateTab = (panelId: string, tabId: string) => {
    const panel = tabPanels.find((p) => p.id === panelId)
    const tab = panel?.tabs.find((t) => t.id === tabId)

    if (tab) {
      const newTab: TabItem = {
        ...tab,
        id: `${tab.id}-copy-${Date.now()}`,
        title: `${tab.title} (Copy)`,
      }

      setTabPanels((panels) =>
        panels.map((panel) => (panel.id === panelId ? { ...panel, tabs: [...panel.tabs, newTab] } : panel)),
      )
    }
  }

  const addNestedTab = (panelId: string, parentTabId: string, tabType: TabType) => {
    const newTabId = `${parentTabId}-${tabType}-${Date.now()}`
    const tabConfig = TAB_TYPES[tabType]

    const newTab: TabItem = {
      id: newTabId,
      type: tabType,
      title: `${tabConfig.label}`,
      icon: tabConfig.icon,
      color: tabConfig.color,
      position: "top",
      parentId: parentTabId,
      tags: [],
    }

    setTabPanels((panels) =>
      panels.map((panel) => {
        if (panel.id === panelId) {
          const updatedTabs = panel.tabs.map((tab) => {
            if (tab.id === parentTabId) {
              return {
                ...tab,
                children: [...(tab.children || []), newTabId],
              }
            }
            return tab
          })

          return {
            ...panel,
            tabs: [...updatedTabs, newTab],
          }
        }
        return panel
      }),
    )
  }

  // Voice recording functions
  const startRecording = async () => {
    const recordingId = `rec-${Date.now()}`
    setCurrentRecordingId(recordingId)
    setIsRecording(true)
    setRecordingDuration(0)
    setShowRecordingPopout(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
    setIsTranscribing(true)

    setTimeout(() => {
      const newRecording: VoiceRecording = {
        id: currentRecordingId || `rec-${Date.now()}`,
        title: `Recording ${recordings.length + 1}`,
        duration: recordingDuration,
        transcript: "This is a sample transcription of your voice note...",
        linkedNoteId: tabPanels[0]?.activeTab,
        timestamp: Date.now(),
      }
      setRecordings([...recordings, newRecording])
      setIsTranscribing(false)
      setShowRecordingPopout(false)
      setCurrentRecordingId(null)
      setRecordingDuration(0)
    }, 2000)
  }

  const playRecording = (id: string) => {
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 2000)
  }

  // Mind map functions
  const addMindMapNode = (x: number, y: number) => {
    const newNode: MindMapNode = {
      id: `node-${Date.now()}`,
      label: "New Node",
      x,
      y,
      color: "bg-gray-400",
    }
    setMindMapNodes([...mindMapNodes, newNode])
  }

  const updateMindMapNode = (nodeId: string, updates: Partial<MindMapNode>) => {
    setMindMapNodes((nodes) => nodes.map((node) => (node.id === nodeId ? { ...node, ...updates } : node)))
  }

  const deleteMindMapNode = (nodeId: string) => {
    setMindMapNodes((nodes) => nodes.filter((node) => node.id !== nodeId))
    setMindMapConnections((connections) => connections.filter((conn) => conn.from !== nodeId && conn.to !== nodeId))
  }

  const addMindMapConnection = (fromId: string, toId: string) => {
    const newConnection: MindMapConnection = {
      id: `conn-${Date.now()}`,
      from: fromId,
      to: toId,
      label: "",
      color: "stroke-gray-400",
    }
    setMindMapConnections([...mindMapConnections, newConnection])
  }

  // Canvas interaction handlers
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        setIsDraggingCanvas(true)
        setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y })
      }
    },
    [canvasOffset],
  )

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDraggingCanvas && !draggedItem) {
        setCanvasOffset({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }

      if (draggedItem) {
        const rect = canvasRef.current?.getBoundingClientRect()
        if (rect) {
          const newX = (e.clientX - rect.left - dragOffset.x - canvasOffset.x) / canvasScale
          const newY = (e.clientY - rect.top - dragOffset.y - canvasOffset.y) / canvasScale

          setCanvasItems((items) =>
            items.map((item) => (item.id === draggedItem ? { ...item, x: newX, y: newY } : item)),
          )
        }
      }
    },
    [isDraggingCanvas, dragStart, draggedItem, dragOffset, canvasOffset, canvasScale],
  )

  const handleCanvasMouseUp = useCallback(() => {
    setIsDraggingCanvas(false)
    setDraggedItem(null)
  }, [])

  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setCanvasScale((prev) => Math.max(0.1, Math.min(3, prev * delta)))
  }, [])

  const handleItemMouseDown = useCallback((e: React.MouseEvent, itemId: string) => {
    e.stopPropagation()
    setDraggedItem(itemId)
    const rect = e.currentTarget.getBoundingClientRect()
    const canvasRect = canvasRef.current?.getBoundingClientRect()
    if (canvasRect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }, [])

  // AI Organizer function
  const organizeWithAI = async () => {
    setIsOrganizing(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const gridCols = 3
    const spacing = 350
    const startX = 100
    const startY = 100

    setCanvasItems((items) =>
      items.map((item, index) => ({
        ...item,
        x: startX + (index % gridCols) * spacing,
        y: startY + Math.floor(index / gridCols) * 300,
      })),
    )

    setIsOrganizing(false)
  }

  // Study mode functions
  const startStudySession = () => {
    if (selectedStudyItems.length === 0) return
    setStudyStep("study")
    setCurrentQuestion(0)
    setStudyProgress(0)
    setShowAnswer(false)
  }

  const handleStudyAnswer = (correct: boolean) => {
    // Calculate total questions from all selected items
    let totalQuestions = 0
    selectedStudyItems.forEach((itemId) => {
      const item = studyItems.find((i) => i.id === itemId)
      if (item?.type === "flashcard" && item.content?.cards) {
        totalQuestions += item.content.cards.length
      } else {
        totalQuestions += 1 // For other types, count as 1 question
      }
    })

    const newProgress = ((currentQuestion + 1) / totalQuestions) * 100
    setStudyProgress(newProgress)

    if (currentQuestion + 1 < totalQuestions) {
      setCurrentQuestion((prev) => prev + 1)
      setShowAnswer(false)
    } else {
      setShowStudyMode(false)
      setStudyStep("setup")
    }
  }

  const getCurrentStudyContent = () => {
    let questionIndex = currentQuestion

    for (const itemId of selectedStudyItems) {
      const item = studyItems.find((i) => i.id === itemId)
      if (!item) continue

      if (item.type === "flashcard" && item.content?.cards) {
        if (questionIndex < item.content.cards.length) {
          return {
            question: item.content.cards[questionIndex].question,
            answer: item.content.cards[questionIndex].answer,
            type: "flashcard",
          }
        }
        questionIndex -= item.content.cards.length
      } else {
        if (questionIndex === 0) {
          return {
            question: `Study: ${item.title}`,
            answer: item.content || `Content for ${item.title}`,
            type: item.type,
          }
        }
        questionIndex -= 1
      }
    }

    return null
  }

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const renderMindMapConnections = () => {
    return mindMapConnections.map((connection) => {
      const fromNode = mindMapNodes.find((n) => n.id === connection.from)
      const toNode = mindMapNodes.find((n) => n.id === connection.to)

      if (!fromNode || !toNode) return null

      const fromX = fromNode.x + 40
      const fromY = fromNode.y + 20
      const toX = toNode.x + 40
      const toY = toNode.y + 20

      return (
        <g key={connection.id}>
          <line
            x1={fromX}
            y1={fromY}
            x2={toX}
            y2={toY}
            className={connection.color || "stroke-white/40"}
            strokeWidth="2"
            markerEnd="url(#arrowhead)"
          />
          {connection.label && (
            <text x={(fromX + toX) / 2} y={(fromY + toY) / 2} className="fill-white text-xs" textAnchor="middle">
              {connection.label}
            </text>
          )}
        </g>
      )
    })
  }

  const renderCanvasItem = (item: CanvasItem) => {
    const style = {
      transform: `translate(${item.x + canvasOffset.x}px, ${item.y + canvasOffset.y}px) scale(${canvasScale})`,
      width: item.width,
      height: item.height,
    }

    const baseClasses =
      "absolute backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 cursor-move hover:bg-white/15 transition-all duration-200 select-none shadow-lg"

    const IconComponent = item.icon

    return (
      <ContextMenu key={item.id}>
        <ContextMenuTrigger>
          <div className={baseClasses} style={style} onMouseDown={(e) => handleItemMouseDown(e, item.id)}>
            <div className="flex items-center gap-2 mb-2">
              <IconComponent className="w-4 h-4 text-blue-400" />
              <h3 className="font-medium text-white text-sm">{item.title}</h3>
            </div>
            {item.tags && item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {item.tags.map((tagName) => {
                  const tag = tags.find((t) => t.name === tagName)
                  return (
                    <Badge key={tagName} className={`${tag?.color || "bg-gray-500"} text-white text-xs px-1 py-0`}>
                      {tagName}
                    </Badge>
                  )
                })}
              </div>
            )}
            <p className="text-white/80 text-xs line-clamp-4">{item.content}</p>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent className="bg-white/5 border-white/10 backdrop-blur-md">
          <ContextMenuItem onClick={() => setShowTagInput(item.id)}>
            <Tag className="w-4 h-4 mr-2" />
            Add Tag
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => setEditingTab(item.id)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Rename
          </ContextMenuItem>
          <ContextMenuItem>
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </ContextMenuItem>
          <ContextMenuItem className="text-red-400">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  }

  const renderToolPalette = () => (
    <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40">
      <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-3">
        <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
          {Object.entries(TAB_TYPES).map(([type, config]) => (
            <Button
              key={type}
              variant="ghost"
              size="icon"
              className="w-10 h-10 text-white/70 hover:text-white hover:bg-white/20"
              draggable
              onDragStart={() => setDraggedTabType(type as TabType)}
              onDragEnd={() => setDraggedTabType(null)}
              title={config.label}
            >
              <config.icon className="w-5 h-5" />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTabContent = (tab: TabItem) => {
    const linkedRecording = recordings.find((r) => r.linkedNoteId === tab.id)

    switch (tab.type) {
      case "note":
        return (
          <div className="h-full p-4 relative">
            {linkedRecording && (
              <div className="absolute top-2 right-2 flex items-center gap-2 bg-white/10 rounded-lg px-2 py-1">
                <Link className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-white/80">Linked Recording</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-5 h-5 text-white/60 hover:text-white"
                  onClick={() => playRecording(linkedRecording.id)}
                >
                  <Play className="w-3 h-3" />
                </Button>
              </div>
            )}
            <Textarea
              placeholder="Start writing your notes..."
              className="h-full bg-transparent border-white/10 text-white placeholder:text-white/60 resize-none font-roboto"
              defaultValue={`Notes for ${tab.title}...`}
            />
          </div>
        )

      case "voice-recording":
        return (
          <div className="h-full p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`${isRecording ? "bg-red-500 hover:bg-red-600" : "bg-white/10 hover:bg-white/20"}`}
              >
                {isRecording ? <Square className="w-4 h-4 mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              {isRecording && (
                <div className="flex items-center gap-2 text-red-400">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  <span className="text-sm font-roboto-condensed">{formatRecordingTime(recordingDuration)}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {recordings.map((recording) => (
                <div key={recording.id} className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-white font-roboto">{recording.title}</span>
                    <div className="flex items-center gap-2">
                      {recording.linkedNoteId && <Link className="w-4 h-4 text-blue-400" title="Linked to note" />}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => playRecording(recording.id)}
                        className="w-8 h-8 text-white/60 hover:text-white"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-white/60 font-roboto-condensed">
                    Duration: {formatRecordingTime(recording.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case "mindmap":
        return (
          <div className="h-full p-4 relative">
            <div className="absolute top-2 right-2 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingMindMap(!editingMindMap)}
                className={`text-xs ${editingMindMap ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
              >
                {editingMindMap ? "Done" : "Edit"}
              </Button>
            </div>
            <div
              className="relative h-full bg-slate-800/50 rounded-lg p-4 overflow-hidden"
              onClick={
                editingMindMap
                  ? (e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const x = e.clientX - rect.left - 40
                      const y = e.clientY - rect.top - 20
                      addMindMapNode(x, y)
                    }
                  : undefined
              }
            >
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <marker id="arrowhead-tab" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255, 255, 255, 0.4)" />
                  </marker>
                </defs>
                {renderMindMapConnections()}
              </svg>
              {mindMapNodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute ${node.color || "bg-gray-400"} border border-white/40 rounded-lg px-3 py-2 text-xs text-white font-medium backdrop-blur-sm cursor-pointer hover:scale-105 transition-transform ${
                    selectedMindMapNode === node.id ? "ring-2 ring-white/60" : ""
                  }`}
                  style={{
                    left: node.x,
                    top: node.y,
                    transform: "translate(-50%, -50%)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (editingMindMap) {
                      setSelectedMindMapNode(selectedMindMapNode === node.id ? null : node.id)
                    }
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation()
                    if (editingMindMap) {
                      const newLabel = prompt("Edit node label:", node.label)
                      if (newLabel) {
                        updateMindMapNode(node.id, { label: newLabel })
                      }
                    }
                  }}
                >
                  {node.label}
                  {editingMindMap && selectedMindMapNode === node.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMindMapNode(node.id)
                        setSelectedMindMapNode(null)
                      }}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )

      case "flashcards":
        return (
          <div className="h-full p-4">
            <div className="space-y-3">
              {flashcardDecks[0]?.cards.map((card, index) => (
                <div key={index} className="bg-white/10 rounded-lg p-4">
                  <div className="font-medium text-white mb-2 font-roboto">Q: {card.question}</div>
                  <div className="text-white/80 font-roboto">A: {card.answer}</div>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return (
          <div className="h-full p-4 flex items-center justify-center">
            <div className="text-white/60 font-roboto">{tab.title} content</div>
          </div>
        )
    }
  }

  const renderTabPanel = (panel: TabPanel) => {
    const mainTabs = panel.tabs.filter((tab) => !tab.parentId)

    return (
      <div
        key={panel.id}
        className="backdrop-blur-md bg-white/5 border border-white/10 rounded-lg flex flex-col overflow-hidden shadow-xl"
        style={{ width: `${panel.width}%`, minHeight: "400px" }}
        onDrop={(e) => {
          e.preventDefault()
          if (draggedTabType) {
            addTabToPanel(panel.id, draggedTabType)
            setDraggedTabType(null)
          }
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {/* Tab Header */}
        <div className="flex items-center justify-between p-2 border-b border-white/10 bg-white/5 min-h-[48px]">
          <div className="flex items-center gap-2 flex-1 overflow-hidden">
            {/* Main Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1">
              {mainTabs.map((tab) => {
                const IconComponent = tab.icon
                const hasChildren = tab.children && tab.children.length > 0
                const isActive = panel.activeTab === tab.id || (hasChildren && tab.children?.includes(panel.activeTab))

                return (
                  <ContextMenu key={tab.id}>
                    <ContextMenuTrigger>
                      <div
                        className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-all group relative ${
                          isActive ? "bg-white/20" : "hover:bg-white/10"
                        } ${panel.showIcons ? "min-w-8" : "min-w-16"}`}
                        onClick={() =>
                          setTabPanels((panels) =>
                            panels.map((p) => (p.id === panel.id ? { ...p, activeTab: tab.id } : p)),
                          )
                        }
                      >
                        <div className={`w-2 h-2 rounded-full ${tab.color}`} />
                        <IconComponent className="w-4 h-4 text-white/60" />
                        {!panel.showIcons && (
                          <span className="text-xs text-white/90 truncate max-w-20 font-roboto-condensed">
                            {tab.title}
                          </span>
                        )}
                        {hasChildren && <ChevronDown className="w-3 h-3 text-white/60" />}
                        {tab.tags && tab.tags.length > 0 && (
                          <div className="absolute -top-1 -right-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          </div>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-4 h-4 opacity-0 group-hover:opacity-100 text-white/60 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeTab(panel.id, tab.id)
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="bg-white/5 border-white/10 backdrop-blur-md">
                      <ContextMenuItem onClick={() => setShowTagInput(tab.id)}>
                        <Tag className="w-4 h-4 mr-2" />
                        Add Tag
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuItem
                        onClick={() => {
                          setEditingTab(tab.id)
                          setEditingTabName(tab.title)
                        }}
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Rename
                      </ContextMenuItem>
                      <ContextMenuItem onClick={() => duplicateTab(panel.id, tab.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </ContextMenuItem>
                      <ContextMenuSeparator />
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Palette className="w-4 h-4 mr-2" />
                          Change Color
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="bg-white/5 border-white/10">
                          {[
                            "bg-red-500",
                            "bg-blue-500",
                            "bg-green-500",
                            "bg-yellow-500",
                            "bg-purple-500",
                            "bg-pink-500",
                          ].map((color) => (
                            <ContextMenuItem key={color} onClick={() => updateTabColor(panel.id, tab.id, color)}>
                              <div className={`w-4 h-4 rounded-full ${color} mr-2`} />
                              {color.replace("bg-", "").replace("-500", "")}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      <ContextMenuSub>
                        <ContextMenuSubTrigger>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Nested Tab
                        </ContextMenuSubTrigger>
                        <ContextMenuSubContent className="bg-white/5 border-white/10">
                          {Object.entries(TAB_TYPES).map(([type, config]) => (
                            <ContextMenuItem key={type} onClick={() => addNestedTab(panel.id, tab.id, type as TabType)}>
                              <config.icon className="w-4 h-4 mr-2" />
                              {config.label}
                            </ContextMenuItem>
                          ))}
                        </ContextMenuSubContent>
                      </ContextMenuSub>
                      <ContextMenuSeparator />
                      <ContextMenuItem onClick={() => removeTab(panel.id, tab.id)} className="text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Close Tab
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                )
              })}

              {/* Add New Tab Button - Fixed positioning */}
              <Popover
                open={showAddTabPopover === panel.id}
                onOpenChange={(open) => setShowAddTabPopover(open ? panel.id : null)}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-white/60 hover:text-white hover:bg-white/10 px-2 py-1 h-6 ml-2 flex-shrink-0 font-roboto-condensed"
                  >
                    + Add
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 bg-white/5 border-white/10 backdrop-blur-md p-2">
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(TAB_TYPES).map(([type, config]) => (
                      <Button
                        key={type}
                        variant="ghost"
                        size="sm"
                        className="justify-start text-white/60 hover:text-white hover:bg-white/10 h-8 font-roboto-condensed"
                        onClick={() => addTabToPanel(panel.id, type as TabType)}
                      >
                        <config.icon className="w-3 h-3 mr-2" />
                        <span className="text-xs">{config.label}</span>
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Nested Tabs */}
            {mainTabs.find((tab) => tab.id === panel.activeTab)?.children && (
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-white/10">
                {mainTabs
                  .find((tab) => tab.id === panel.activeTab)
                  ?.children?.map((childId) => {
                    const childTab = panel.tabs.find((t) => t.id === childId)
                    if (!childTab) return null

                    const IconComponent = childTab.icon
                    const isActive = panel.activeTab === childTab.id

                    return (
                      <div
                        key={childTab.id}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md cursor-pointer transition-all group ${
                          isActive ? "bg-white/20" : "hover:bg-white/10"
                        }`}
                        onClick={() =>
                          setTabPanels((panels) =>
                            panels.map((p) => (p.id === panel.id ? { ...p, activeTab: childTab.id } : p)),
                          )
                        }
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${childTab.color}`} />
                        <IconComponent className="w-3 h-3 text-white/60" />
                        {!panel.showIcons && (
                          <span className="text-xs text-white/90 truncate max-w-16 font-roboto-condensed">
                            {childTab.title}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-3 h-3 opacity-0 group-hover:opacity-100 text-white/60 hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeTab(panel.id, childTab.id)
                          }}
                        >
                          <X className="w-2 h-2" />
                        </Button>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Panel Controls */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {tabPanels.length === 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="w-6 h-6 text-white/60 hover:text-white"
                onClick={addPanelToRight}
                title="Add panel to right"
              >
                <Move className="w-4 h-4" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6 text-white/60 hover:text-white"
              onClick={() =>
                setTabPanels((panels) => panels.map((p) => (p.id === panel.id ? { ...p, showIcons: !p.showIcons } : p)))
              }
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {panel.tabs.find((tab) => tab.id === panel.activeTab) &&
            renderTabContent(panel.tabs.find((tab) => tab.id === panel.activeTab)!)}
        </div>
      </div>
    )
  }

  // Profile with integrated settings
  const renderUserProfile = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentView("notes-lab")}
          className="text-white/60 hover:text-white hover:bg-white/10 font-roboto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes Lab
        </Button>
        <h1 className="text-2xl font-bold text-white font-roboto-slab">Profile</h1>
        <div />
      </div>

      {/* Profile Info */}
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-blue-500 text-white text-xl font-roboto-slab">
              {userProfile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-white font-roboto-slab">{userProfile.name}</h2>
            <p className="text-white/60 font-roboto">{userProfile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white font-roboto-condensed">
              {formatStudyTime(userProfile.totalStudyTime)}
            </div>
            <div className="text-white/60 text-sm font-roboto">Total Study Time</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white font-roboto-condensed">{userProfile.currentStreak}</div>
            <div className="text-white/60 text-sm font-roboto">Day Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white font-roboto-condensed">{userProfile.totalSessions}</div>
            <div className="text-white/60 text-sm font-roboto">Study Sessions</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white font-roboto-condensed">
              {Math.round((userProfile.totalStudyTime / userProfile.weeklyGoal) * 100)}%
            </div>
            <div className="text-white/60 text-sm font-roboto">Weekly Goal</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3 font-roboto-slab">Weekly Progress</h3>
          <div className="bg-white/10 rounded-xl p-4">
            <div className="flex justify-between text-sm text-white/60 mb-2 font-roboto">
              <span>{formatStudyTime(userProfile.totalStudyTime % userProfile.weeklyGoal)} this week</span>
              <span>Goal: {formatStudyTime(userProfile.weeklyGoal)}</span>
            </div>
            <Progress
              value={((userProfile.totalStudyTime % userProfile.weeklyGoal) / userProfile.weeklyGoal) * 100}
              className="h-2"
            />
          </div>
        </div>
      </div>

      {/* Integrated Settings */}
      <div className="space-y-4">
        {/* AI Agents */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white font-roboto-slab">AI Agents</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-roboto">Study Assistant</Label>
                <p className="text-white/60 text-sm font-roboto">AI-powered study recommendations</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-roboto">Content Organizer</Label>
                <p className="text-white/60 text-sm font-roboto">Automatically organize your notes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-roboto">Smart Flashcards</Label>
                <p className="text-white/60 text-sm font-roboto">Generate flashcards from your notes</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Voice & Transcription */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white font-roboto-slab">Voice & Transcription</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-roboto">Auto-transcription</Label>
                <p className="text-white/60 text-sm font-roboto">Automatically transcribe voice recordings</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-roboto">Voice commands</Label>
                <p className="text-white/60 text-sm font-roboto">Control app with voice commands</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Software Updates */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white font-roboto-slab">Software Updates</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-roboto">Auto-update</Label>
                <p className="text-white/60 text-sm font-roboto">Automatically install updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Button className="bg-white/10 hover:bg-white/20 text-white font-roboto">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check for Updates
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white font-roboto-slab">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-roboto">Study reminders</Label>
                <p className="text-white/60 text-sm font-roboto">Get reminded to study</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-roboto">Achievement notifications</Label>
                <p className="text-white/60 text-sm font-roboto">Celebrate your progress</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (currentView === "profile") {
    return <div className="min-h-screen bg-black text-white font-roboto">{renderUserProfile()}</div>
  }

  return (
    <div className="min-h-screen bg-black text-white font-roboto">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-blue-500/5 animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "12s", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "10s", animationDelay: "4s" }}
        />
      </div>

      {/* Header */}
      <div className="backdrop-blur-md bg-white/5 border-b border-white/10 p-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBackToDashboard}
            className="text-white/60 hover:text-white hover:bg-white/10 font-roboto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <h1 className="text-lg font-bold text-white font-roboto-slab">{folderName}</h1>

          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="flex bg-white/10 rounded-lg p-1">
              <Button
                variant={viewMode === "canvas" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("canvas")}
                className={`${viewMode === "canvas" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"} font-roboto-condensed`}
              >
                Canvas
              </Button>
              <Button
                variant={viewMode === "tabs" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("tabs")}
                className={`${viewMode === "tabs" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"} font-roboto-condensed`}
              >
                Tabs
              </Button>
            </div>

            {/* Voice Recording */}
            <Button
              variant="ghost"
              size="icon"
              onClick={isRecording ? stopRecording : startRecording}
              className={`${isRecording ? "text-red-400 bg-red-500/20" : "text-white/60 hover:text-white hover:bg-white/10"}`}
            >
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>

            {/* AI Organizer (Canvas Mode Only) */}
            {viewMode === "canvas" && (
              <Button
                onClick={organizeWithAI}
                disabled={isOrganizing}
                className="bg-purple-600 hover:bg-purple-700 text-white font-roboto-condensed"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isOrganizing ? "Organizing..." : "AI"}
              </Button>
            )}

            {/* Study Button */}
            <Button
              onClick={() => setShowStudyMode(true)}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white font-roboto-condensed"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Study
            </Button>

            {/* Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("profile")}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Recording Popout */}
      {showRecordingPopout && (
        <div className="fixed top-20 right-4 z-50 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            <div>
              <div className="text-white font-medium font-roboto">Recording...</div>
              <div className="text-white/60 text-sm font-roboto-condensed">
                {formatRecordingTime(recordingDuration)}
              </div>
              {tabPanels[0]?.activeTab && (
                <div className="text-white/60 text-xs font-roboto">
                  Linked to: {tabPanels[0].tabs.find((t) => t.id === tabPanels[0].activeTab)?.title}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={stopRecording} className="text-white/60 hover:text-white">
              <Square className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)]">
        {viewMode === "canvas" ? (
          /* Canvas Mode */
          <div
            ref={canvasRef}
            className="w-full h-full relative overflow-hidden"
            style={{ cursor: isDraggingCanvas ? "grabbing" : "grab" }}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleCanvasWheel}
          >
            {canvasItems.map(renderCanvasItem)}

            {/* Canvas Add Button */}
            <div className="fixed right-4 bottom-4 z-30">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white shadow-lg"
                  >
                    <Plus className="w-6 h-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white/5 border-white/10 backdrop-blur-md">
                  {Object.entries(TAB_TYPES).map(([type, config]) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => {
                        const newCanvasItem: CanvasItem = {
                          id: `canvas-${type}-${Date.now()}`,
                          type: type as TabType,
                          title: config.label,
                          x: Math.random() * 300 + 100,
                          y: Math.random() * 300 + 100,
                          width: 280,
                          height: 200,
                          color: config.color,
                          icon: config.icon,
                          content: `Content for ${config.label}`,
                          tags: [],
                        }
                        setCanvasItems((items) => [...items, newCanvasItem])
                      }}
                      className="text-white/60 hover:text-white hover:bg-white/10 font-roboto"
                    >
                      <config.icon className="w-4 h-4 mr-2" />
                      {config.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : (
          /* Enhanced Tabbed Mode */
          <div className="flex h-full relative">
            {/* Collapsible Sidebar */}
            <div
              className={`${sidebarCollapsed ? "w-12" : "w-64"} backdrop-blur-md bg-white/5 border-r border-white/10 transition-all duration-300`}
            >
              <div className="p-3">
                <div className="flex items-center justify-between mb-3">
                  {!sidebarCollapsed && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant={sidebarView === "topics" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSidebarView("topics")}
                        className={`${
                          sidebarView === "topics" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                        } font-roboto-condensed`}
                      >
                        <Grid3X3 className="w-3 h-3 mr-1" />
                        Topics
                      </Button>
                      <Button
                        variant={sidebarView === "raw-data" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSidebarView("raw-data")}
                        className={`${
                          sidebarView === "raw-data" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                        } font-roboto-condensed`}
                      >
                        <List className="w-3 h-3 mr-1" />
                        Raw
                      </Button>
                      <Button
                        variant={sidebarView === "tags" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setSidebarView("tags")}
                        className={`${
                          sidebarView === "tags" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"
                        } font-roboto-condensed`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        Tags
                      </Button>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="text-white/60 hover:text-white hover:bg-white/10 w-8 h-8"
                  >
                    {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
                  </Button>
                </div>

                {!sidebarCollapsed && (
                  <div className="space-y-3">
                    {/* Search and Filter */}
                    <div className="space-y-2">
                      <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-white/10 border-white/10 text-white placeholder:text-white/60 h-8 font-roboto"
                      />
                      {selectedTags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {selectedTags.map((tagName) => {
                            const tag = tags.find((t) => t.name === tagName)
                            return (
                              <Badge
                                key={tagName}
                                className={`${tag?.color || "bg-gray-500"} text-white text-xs px-2 py-0 cursor-pointer`}
                                onClick={() => setSelectedTags((prev) => prev.filter((t) => t !== tagName))}
                              >
                                {tagName} <X className="w-3 h-3 ml-1" />
                              </Badge>
                            )
                          })}
                        </div>
                      )}
                    </div>

                    {/* Voice Recordings Section */}
                    <div>
                      <h3 className="text-xs font-semibold text-white/60 mb-2 font-roboto-condensed">
                        VOICE RECORDINGS
                      </h3>
                      <div className="space-y-1">
                        {isTranscribing && (
                          <div className="p-2 bg-white/10 rounded-lg">
                            <span className="text-xs text-white/60 font-roboto">Transcribing...</span>
                          </div>
                        )}
                        {recordings.slice(0, 3).map((recording) => (
                          <div key={recording.id} className="p-2 bg-white/10 rounded-lg">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-white truncate font-roboto">
                                {recording.title}
                              </span>
                              <div className="flex items-center gap-1">
                                {recording.linkedNoteId && <Link className="w-3 h-3 text-blue-400" />}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => playRecording(recording.id)}
                                  className="w-5 h-5 text-white/60 hover:text-white"
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                            <div className="text-xs text-white/60 font-roboto-condensed">
                              {formatRecordingTime(recording.duration)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Content Organization */}
                    {sidebarView === "topics" ? (
                      <div>
                        <h3 className="text-xs font-semibold text-white/60 mb-2 font-roboto-condensed">TOPICS</h3>
                        <div className="space-y-2">
                          {Object.entries(topicItems).map(([topic, items]) => (
                            <div key={topic}>
                              <h4 className="text-xs font-medium text-white/80 mb-1 font-roboto">{topic}</h4>
                              <div className="space-y-1 ml-2">
                                {filterItemsByTags(items).map((item) => (
                                  <div
                                    key={item.id}
                                    onClick={() => setSelectedTab(item.id)}
                                    className={`flex items-center gap-2 p-1 rounded-lg cursor-pointer transition-colors ${
                                      selectedTab === item.id ? "bg-white/20" : "hover:bg-white/10"
                                    }`}
                                  >
                                    <item.icon className="w-3 h-3 text-white/60" />
                                    <span className="text-xs text-white/80 truncate font-roboto">{item.title}</span>
                                    {item.tags && item.tags.length > 0 && (
                                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : sidebarView === "tags" ? (
                      <div>
                        <h3 className="text-xs font-semibold text-white/60 mb-2 font-roboto-condensed">TAGS</h3>
                        <div className="space-y-1">
                          {tags
                            .filter((tag) => tag.count > 0)
                            .map((tag) => (
                              <div
                                key={tag.id}
                                onClick={() => {
                                  if (selectedTags.includes(tag.name)) {
                                    setSelectedTags((prev) => prev.filter((t) => t !== tag.name))
                                  } else {
                                    setSelectedTags((prev) => [...prev, tag.name])
                                  }
                                }}
                                className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                  selectedTags.includes(tag.name) ? "bg-white/20" : "hover:bg-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${tag.color}`} />
                                  <span className="text-xs text-white/80 font-roboto">{tag.name}</span>
                                </div>
                                <span className="text-xs text-white/60 font-roboto-condensed">{tag.count}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xs font-semibold text-white/60 mb-2 font-roboto-condensed">ALL FILES</h3>
                        <div className="space-y-1">
                          {filterItemsByTags(rawDataItems).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedTab(item.id)}
                              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                selectedTab === item.id ? "bg-white/20" : "hover:bg-white/10"
                              }`}
                            >
                              <item.icon className="w-4 h-4 text-white/60" />
                              <span className="text-xs text-white/80 truncate font-roboto">{item.title}</span>
                              {item.tags && item.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {item.tags.slice(0, 2).map((tagName) => {
                                    const tag = tags.find((t) => t.name === tagName)
                                    return (
                                      <div
                                        key={tagName}
                                        className={`w-2 h-2 rounded-full ${tag?.color || "bg-gray-400"}`}
                                      />
                                    )
                                  })}
                                  {item.tags.length > 2 && (
                                    <span className="text-xs text-white/60">+{item.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Multi-Panel Content Area */}
            <div className="flex-1 flex gap-2 p-2">{tabPanels.map(renderTabPanel)}</div>

            {/* Tool Palette */}
            {showToolPalette && renderToolPalette()}
          </div>
        )}
      </div>

      {/* Floating Tool Palette Toggle */}
      {viewMode === "tabs" && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 bottom-4 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/60 hover:text-white hover:bg-white/10 z-30"
          onClick={() => setShowToolPalette(!showToolPalette)}
        >
          <Plus className="w-6 h-6" />
        </Button>
      )}

      {/* Tag Input Modal */}
      {showTagInput && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-md backdrop-blur-md">
            <h3 className="text-lg font-semibold text-white mb-4 font-roboto-slab">Add Tag</h3>
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              className="bg-white/10 border-white/10 text-white mb-4 font-roboto"
              placeholder="Enter tag name"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && newTagName.trim()) {
                  addTag(showTagInput, newTagName.trim())
                  setShowTagInput(null)
                  setNewTagName("")
                }
              }}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (newTagName.trim()) {
                    addTag(showTagInput, newTagName.trim())
                    setShowTagInput(null)
                    setNewTagName("")
                  }
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-roboto"
              >
                Add Tag
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setShowTagInput(null)
                  setNewTagName("")
                }}
                className="text-white/60 hover:text-white font-roboto"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tab Name Modal */}
      {editingTab && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-md backdrop-blur-md">
            <h3 className="text-lg font-semibold text-white mb-4 font-roboto-slab">Rename Tab</h3>
            <Input
              value={editingTabName}
              onChange={(e) => setEditingTabName(e.target.value)}
              className="bg-white/10 border-white/10 text-white mb-4 font-roboto"
              placeholder="Enter tab name"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  const panel = tabPanels.find((p) => p.tabs.some((t) => t.id === editingTab))
                  if (panel) {
                    updateTabName(panel.id, editingTab, editingTabName)
                  }
                  setEditingTab(null)
                  setEditingTabName("")
                }}
                className="bg-white/10 hover:bg-white/20 text-white font-roboto"
              >
                Save
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setEditingTab(null)
                  setEditingTabName("")
                }}
                className="text-white/60 hover:text-white font-roboto"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Study Mode Modal */}
      {showStudyMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-full max-h-[90vh] backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            {studyStep === "setup" ? (
              /* Setup Screen */
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white font-roboto-slab">Prepare Your Study Session</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowStudyMode(false)}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 space-y-8">
                  {/* Choose Study Items - Multi-select */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 font-roboto-slab">Choose items to study</h3>
                    <div className="space-y-3">
                      {studyItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={item.id}
                            checked={selectedStudyItems.includes(item.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedStudyItems([...selectedStudyItems, item.id])
                              } else {
                                setSelectedStudyItems(selectedStudyItems.filter((id) => id !== item.id))
                              }
                            }}
                          />
                          <label
                            htmlFor={item.id}
                            className="text-white cursor-pointer flex items-center gap-2 font-roboto"
                          >
                            {item.type === "flashcard" && <Layers className="w-4 h-4 text-orange-400" />}
                            {item.type === "note" && <FileText className="w-4 h-4 text-blue-400" />}
                            {item.type === "mindmap" && <Brain className="w-4 h-4 text-pink-400" />}
                            {item.type === "voice" && <Mic className="w-4 h-4 text-red-400" />}
                            <span>{item.title}</span>
                            {item.type === "flashcard" && item.content?.cards && (
                              <span className="text-white/60 text-sm font-roboto-condensed">
                                ({item.content.cards.length} cards)
                              </span>
                            )}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 font-roboto-slab">Choose your study method</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: "flashcards", label: "Flashcards", icon: Layers },
                        { id: "written", label: "Written Quiz", icon: FileText },
                        { id: "multiple", label: "Multiple Choice", icon: Check },
                        { id: "matching", label: "Matching Game", icon: GripHorizontal },
                      ].map((method) => (
                        <div
                          key={method.id}
                          onClick={() => setStudyMethod(method.id as StudyMethod)}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            studyMethod === method.id
                              ? "border-pink-500 bg-pink-500/20"
                              : "border-white/10 bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <method.icon className="w-6 h-6 text-white mb-2" />
                          <span className="text-white font-medium font-roboto">{method.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={startStudySession}
                  disabled={selectedStudyItems.length === 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white text-lg py-6 mt-8 font-roboto"
                >
                  Start Studying ({selectedStudyItems.length} items)
                </Button>
              </div>
            ) : (
              /* Study Interface */
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <Progress value={studyProgress} className="flex-1 mr-4" />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowStudyMode(false)
                      setStudyStep("setup")
                    }}
                    className="text-white/60 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                  {getCurrentStudyContent() && (
                    <>
                      <div className="text-center max-w-2xl">
                        <h3 className="text-2xl font-bold text-white mb-4 font-roboto-slab">
                          {getCurrentStudyContent()?.question}
                        </h3>
                        {showAnswer && (
                          <div className="bg-white/10 rounded-xl p-6 mt-6">
                            <p className="text-xl text-white font-roboto">{getCurrentStudyContent()?.answer}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        {!showAnswer ? (
                          <Button
                            onClick={() => setShowAnswer(true)}
                            className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 font-roboto"
                          >
                            Show Answer
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleStudyAnswer(false)}
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-500/20 px-8 py-3 font-roboto"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Incorrect
                            </Button>
                            <Button
                              onClick={() => handleStudyAnswer(true)}
                              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-roboto"
                            >
                              <Check className="w-4 h-4 mr-2" />
                              Correct
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
