"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Settings,
  Clock,
  Bot,
  Download,
  RefreshCw,
  Bell,
  Palette,
  Volume2,
} from "lucide-react"

type ViewMode = "canvas" | "tabs"
type StudyMethod = "flashcards" | "written" | "multiple" | "matching"
type CurrentView = "notes-lab" | "profile" | "settings"

interface CanvasItem {
  id: string
  type: "note" | "pdf" | "mindmap" | "flashcards"
  title: string
  content?: string
  x: number
  y: number
  width: number
  height: number
  isDragging?: boolean
}

interface MindMapConnection {
  from: string
  to: string
  id: string
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
  totalStudyTime: number // in minutes
  weeklyGoal: number // in minutes
  currentStreak: number // in days
  totalSessions: number
}

export default function NotesLabEnhanced() {
  const [currentView, setCurrentView] = useState<CurrentView>("notes-lab")
  const [viewMode, setViewMode] = useState<ViewMode>("canvas")
  const [showStudyMode, setShowStudyMode] = useState(false)
  const [studyStep, setStudyStep] = useState<"setup" | "study">("setup")
  const [selectedDecks, setSelectedDecks] = useState<string[]>([])
  const [studyMethod, setStudyMethod] = useState<StudyMethod>("flashcards")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [studyProgress, setStudyProgress] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedTab, setSelectedTab] = useState("note-1")
  const [isOrganizing, setIsOrganizing] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [canvasScale, setCanvasScale] = useState(1)
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Sample data
  const folderName = "Biology 101"

  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>([
    {
      id: "note-1",
      type: "note",
      title: "Cell Structure",
      content:
        "Overview of cellular components and their functions including nucleus, mitochondria, and cell membrane...",
      x: 100,
      y: 100,
      width: 280,
      height: 200,
    },
    {
      id: "note-2",
      type: "note",
      title: "Photosynthesis Process",
      content: "The process by which plants convert light energy into chemical energy...",
      x: 400,
      y: 300,
      width: 280,
      height: 200,
    },
    {
      id: "pdf-1",
      type: "pdf",
      title: "Textbook Chapter 3",
      content: "24 pages",
      x: 450,
      y: 150,
      width: 240,
      height: 320,
    },
    {
      id: "mindmap-1",
      type: "mindmap",
      title: "Photosynthesis",
      x: 200,
      y: 400,
      width: 300,
      height: 250,
    },
    {
      id: "flashcards-1",
      type: "flashcards",
      title: "Cell Biology Deck",
      content: "45 cards",
      x: 500,
      y: 50,
      width: 200,
      height: 120,
    },
    {
      id: "flashcards-2",
      type: "flashcards",
      title: "Genetics Fundamentals",
      content: "32 cards",
      x: 750,
      y: 200,
      width: 200,
      height: 120,
    },
  ])

  const [mindMapConnections] = useState<MindMapConnection[]>([
    { id: "conn-1", from: "light", to: "chloroplast" },
    { id: "conn-2", from: "chloroplast", to: "glucose" },
    { id: "conn-3", from: "water", to: "chloroplast" },
    { id: "conn-4", from: "co2", to: "chloroplast" },
  ])

  const mindMapNodes = [
    { id: "light", label: "Light Energy", x: 50, y: 50 },
    { id: "water", label: "H₂O", x: 50, y: 150 },
    { id: "co2", label: "CO₂", x: 50, y: 200 },
    { id: "chloroplast", label: "Chloroplast", x: 150, y: 125 },
    { id: "glucose", label: "Glucose", x: 250, y: 100 },
    { id: "oxygen", label: "O₂", x: 250, y: 150 },
  ]

  const [userProfile] = useState<UserProfile>({
    name: "Alex Johnson",
    email: "alex.johnson@email.com",
    avatar: "/placeholder.svg?height=64&width=64",
    totalStudyTime: 2847, // minutes
    weeklyGoal: 600, // 10 hours
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
    {
      id: "deck-2",
      title: "Genetics Fundamentals",
      cards: [
        { question: "What does DNA stand for?", answer: "Deoxyribonucleic Acid" },
        { question: "How many chromosomes do humans have?", answer: "46 chromosomes (23 pairs)" },
      ],
    },
  ]

  const folderItems = [
    { id: "note-1", type: "note", title: "Cell Structure", icon: FileText },
    { id: "note-2", type: "note", title: "Photosynthesis Process", icon: FileText },
    { id: "pdf-1", type: "pdf", title: "Textbook Chapter 3", icon: FileImage },
    { id: "flashcards-1", type: "flashcards", title: "Cell Biology Deck", icon: Layers },
    { id: "flashcards-2", type: "flashcards", title: "Genetics Fundamentals", icon: Layers },
    { id: "mindmap-1", type: "mindmap", title: "Photosynthesis Map", icon: Brain },
  ]

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

    // Simulate AI organization
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Organize items in a grid pattern
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
    if (selectedDecks.length === 0) return
    setStudyStep("study")
    setCurrentQuestion(0)
    setStudyProgress(0)
    setShowAnswer(false)
  }

  const handleStudyAnswer = (correct: boolean) => {
    const totalQuestions = selectedDecks.reduce((acc, deckId) => {
      const deck = flashcardDecks.find((d) => d.id === deckId)
      return acc + (deck?.cards.length || 0)
    }, 0)

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

  const getCurrentCard = () => {
    let cardIndex = currentQuestion
    for (const deckId of selectedDecks) {
      const deck = flashcardDecks.find((d) => d.id === deckId)
      if (deck && cardIndex < deck.cards.length) {
        return deck.cards[cardIndex]
      }
      cardIndex -= deck?.cards.length || 0
    }
    return null
  }

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
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
        <line
          key={connection.id}
          x1={fromX}
          y1={fromY}
          x2={toX}
          y2={toY}
          stroke="rgba(255, 255, 255, 0.3)"
          strokeWidth="2"
          markerEnd="url(#arrowhead)"
        />
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
      "absolute backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 cursor-move hover:bg-white/15 transition-all duration-200 select-none"

    switch (item.type) {
      case "note":
        return (
          <div key={item.id} className={baseClasses} style={style} onMouseDown={(e) => handleItemMouseDown(e, item.id)}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
            </div>
            <p className="text-white/70 text-xs line-clamp-4">{item.content}</p>
          </div>
        )

      case "pdf":
        return (
          <div key={item.id} className={baseClasses} style={style} onMouseDown={(e) => handleItemMouseDown(e, item.id)}>
            <div className="flex items-center gap-2 mb-2">
              <FileImage className="w-4 h-4 text-red-400" />
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
            </div>
            <div className="bg-white/5 rounded-lg h-32 flex items-center justify-center mb-2">
              <span className="text-white/50 text-xs">PDF Preview</span>
            </div>
            <p className="text-white/60 text-xs">{item.content}</p>
          </div>
        )

      case "mindmap":
        return (
          <div key={item.id} className={baseClasses} style={style} onMouseDown={(e) => handleItemMouseDown(e, item.id)}>
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
            </div>
            <div className="relative h-full">
              <svg className="absolute inset-0 w-full h-full">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255, 255, 255, 0.3)" />
                  </marker>
                </defs>
                {renderMindMapConnections()}
              </svg>
              {mindMapNodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute bg-purple-500/20 border border-purple-400/30 rounded-lg px-3 py-2 text-xs text-white font-medium"
                  style={{
                    left: node.x,
                    top: node.y,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        )

      case "flashcards":
        return (
          <div key={item.id} className={baseClasses} style={style} onMouseDown={(e) => handleItemMouseDown(e, item.id)}>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-green-400" />
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
            </div>
            <div className="bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-lg p-3 text-center">
              <span className="text-white/80 text-sm">{item.content}</span>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const renderUserProfile = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentView("notes-lab")}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes Lab
        </Button>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <div />
      </div>

      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={userProfile.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-blue-500 text-white text-xl">
              {userProfile.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-bold text-white">{userProfile.name}</h2>
            <p className="text-white/60">{userProfile.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{formatStudyTime(userProfile.totalStudyTime)}</div>
            <div className="text-white/60 text-sm">Total Study Time</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{userProfile.currentStreak}</div>
            <div className="text-white/60 text-sm">Day Streak</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{userProfile.totalSessions}</div>
            <div className="text-white/60 text-sm">Study Sessions</div>
          </div>
          <div className="bg-white/5 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {Math.round((userProfile.totalStudyTime / userProfile.weeklyGoal) * 100)}%
            </div>
            <div className="text-white/60 text-sm">Weekly Goal</div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-white mb-3">Weekly Progress</h3>
          <div className="bg-white/5 rounded-xl p-4">
            <div className="flex justify-between text-sm text-white/60 mb-2">
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
    </div>
  )

  const renderSettings = () => (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setCurrentView("notes-lab")}
          className="text-white/70 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Notes Lab
        </Button>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <div />
      </div>

      <div className="space-y-4">
        {/* AI Agents */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">AI Agents</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Study Assistant</Label>
                <p className="text-white/60 text-sm">AI-powered study recommendations</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Content Organizer</Label>
                <p className="text-white/60 text-sm">Automatically organize your notes</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Smart Flashcards</Label>
                <p className="text-white/60 text-sm">Generate flashcards from your notes</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Software Updates */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Download className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Software Updates</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Auto-update</Label>
                <p className="text-white/60 text-sm">Automatically install updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Beta updates</Label>
                <p className="text-white/60 text-sm">Receive beta versions</p>
              </div>
              <Switch />
            </div>
            <Button className="bg-white/10 hover:bg-white/20 text-white">
              <RefreshCw className="w-4 h-4 mr-2" />
              Check for Updates
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Study reminders</Label>
                <p className="text-white/60 text-sm">Get reminded to study</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Achievement notifications</Label>
                <p className="text-white/60 text-sm">Celebrate your progress</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <Label className="text-white mb-2 block">Theme</Label>
              <Select defaultValue="dark">
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-white mb-2 block">Accent Color</Label>
              <div className="flex gap-2">
                {["pink", "blue", "purple", "green"].map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 rounded-full cursor-pointer border-2 ${
                      color === "pink" ? "border-white bg-pink-500" : "border-transparent"
                    } ${
                      color === "blue"
                        ? "bg-blue-500"
                        : color === "purple"
                          ? "bg-purple-500"
                          : color === "green"
                            ? "bg-green-500"
                            : "bg-pink-500"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Audio */}
        <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Audio</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Sound effects</Label>
                <p className="text-white/60 text-sm">Play sounds for interactions</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Focus music</Label>
                <p className="text-white/60 text-sm">Background music while studying</p>
              </div>
              <Switch />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  if (currentView === "profile") {
    return <div className="min-h-screen bg-black text-white font-['Poppins']">{renderUserProfile()}</div>
  }

  if (currentView === "settings") {
    return <div className="min-h-screen bg-black text-white font-['Poppins']">{renderSettings()}</div>
  }

  return (
    <div className="min-h-screen bg-black text-white font-['Poppins']">
      {/* Header */}
      <div className="backdrop-blur-md bg-white/5 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-xl font-bold text-white">{folderName}</h1>

          <div className="flex items-center gap-3">
            {/* Mode Toggle */}
            <div className="flex bg-white/10 rounded-lg p-1">
              <Button
                variant={viewMode === "canvas" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("canvas")}
                className={viewMode === "canvas" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}
              >
                Canvas
              </Button>
              <Button
                variant={viewMode === "tabs" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("tabs")}
                className={viewMode === "tabs" ? "bg-white/20 text-white" : "text-white/70 hover:text-white"}
              >
                Tabs
              </Button>
            </div>

            {/* AI Organizer (Canvas Mode Only) */}
            {viewMode === "canvas" && (
              <Button
                onClick={organizeWithAI}
                disabled={isOrganizing}
                className="bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {isOrganizing ? "Organizing..." : "AI Organize"}
              </Button>
            )}

            {/* Study Button */}
            <Button
              onClick={() => setShowStudyMode(true)}
              className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white border-0 transition-all duration-300 hover:scale-105"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Study
            </Button>

            {/* Add Button */}
            <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
              <Plus className="w-4 h-4" />
            </Button>

            {/* Profile Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("profile")}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <User className="w-4 h-4" />
            </Button>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentView("settings")}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

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
          </div>
        ) : (
          /* Tabbed Mode */
          <div className="flex h-full">
            {/* Left Panel */}
            <div className="w-80 backdrop-blur-md bg-white/5 border-r border-white/10 p-4">
              <h3 className="text-sm font-semibold text-white/70 mb-4">FOLDER CONTENTS</h3>
              <div className="space-y-2">
                {folderItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTab(item.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTab === item.id ? "bg-white/15" : "hover:bg-white/10"
                    }`}
                  >
                    <item.icon className="w-4 h-4 text-white/60" />
                    <span className="text-white/80">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 backdrop-blur-md bg-white/5">
              <Tabs value={selectedTab} className="h-full flex flex-col">
                <TabsList className="bg-white/10 border-b border-white/10 rounded-none justify-start p-0">
                  {folderItems
                    .filter((item) => selectedTab === item.id)
                    .map((item) => (
                      <TabsTrigger
                        key={item.id}
                        value={item.id}
                        className="data-[state=active]:bg-white/20 text-white/70 data-[state=active]:text-white"
                      >
                        <item.icon className="w-4 h-4 mr-2" />
                        {item.title}
                      </TabsTrigger>
                    ))}
                </TabsList>

                <div className="flex-1 p-6">
                  <TabsContent value="note-1" className="h-full">
                    <div className="h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">Cell Structure</h2>
                      <Textarea
                        placeholder="Start writing your notes..."
                        className="h-full bg-transparent border-white/20 text-white placeholder:text-white/50 resize-none"
                        defaultValue="Overview of cellular components and their functions including nucleus, mitochondria, and cell membrane..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="note-2" className="h-full">
                    <div className="h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">Photosynthesis Process</h2>
                      <Textarea
                        placeholder="Start writing your notes..."
                        className="h-full bg-transparent border-white/20 text-white placeholder:text-white/50 resize-none"
                        defaultValue="The process by which plants convert light energy into chemical energy..."
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="pdf-1" className="h-full">
                    <div className="h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white">Textbook Chapter 3</h2>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <span className="text-white/70 text-sm">Page 1 of 24</span>
                          <Button variant="ghost" size="icon" className="text-white/70 hover:text-white">
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="h-full bg-white/5 rounded-lg flex items-center justify-center">
                        <span className="text-white/50">PDF Viewer</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="flashcards-1" className="h-full">
                    <div className="h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">Cell Biology Deck</h2>
                      <div className="space-y-3">
                        {flashcardDecks[0].cards.map((card, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4">
                            <div className="font-medium text-white mb-2">Q: {card.question}</div>
                            <div className="text-white/70">A: {card.answer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="flashcards-2" className="h-full">
                    <div className="h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">Genetics Fundamentals</h2>
                      <div className="space-y-3">
                        {flashcardDecks[1].cards.map((card, index) => (
                          <div key={index} className="bg-white/5 rounded-lg p-4">
                            <div className="font-medium text-white mb-2">Q: {card.question}</div>
                            <div className="text-white/70">A: {card.answer}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="mindmap-1" className="h-full">
                    <div className="h-full backdrop-blur-md bg-white/5 border border-white/10 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-white mb-4">Photosynthesis Map</h2>
                      <div className="relative h-full bg-white/5 rounded-lg p-4">
                        <svg className="absolute inset-0 w-full h-full">
                          <defs>
                            <marker
                              id="arrowhead-tab"
                              markerWidth="10"
                              markerHeight="7"
                              refX="9"
                              refY="3.5"
                              orient="auto"
                            >
                              <polygon points="0 0, 10 3.5, 0 7" fill="rgba(255, 255, 255, 0.3)" />
                            </marker>
                          </defs>
                          {mindMapConnections.map((connection) => {
                            const fromNode = mindMapNodes.find((n) => n.id === connection.from)
                            const toNode = mindMapNodes.find((n) => n.id === connection.to)

                            if (!fromNode || !toNode) return null

                            return (
                              <line
                                key={connection.id}
                                x1={fromNode.x + 40}
                                y1={fromNode.y + 20}
                                x2={toNode.x + 40}
                                y2={toNode.y + 20}
                                stroke="rgba(255, 255, 255, 0.3)"
                                strokeWidth="2"
                                markerEnd="url(#arrowhead-tab)"
                              />
                            )
                          })}
                        </svg>
                        {mindMapNodes.map((node) => (
                          <div
                            key={node.id}
                            className="absolute bg-purple-500/20 border border-purple-400/30 rounded-lg px-3 py-2 text-xs text-white font-medium"
                            style={{
                              left: node.x,
                              top: node.y,
                              transform: "translate(-50%, -50%)",
                            }}
                          >
                            {node.label}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        )}
      </div>

      {/* Study Mode Modal */}
      {showStudyMode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-full max-h-[90vh] backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl overflow-hidden">
            {studyStep === "setup" ? (
              /* Setup Screen */
              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">Prepare Your Study Session</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowStudyMode(false)}
                    className="text-white/70 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 space-y-8">
                  {/* Choose Decks */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Choose flashcard decks to include</h3>
                    <div className="space-y-3">
                      {flashcardDecks.map((deck) => (
                        <div key={deck.id} className="flex items-center space-x-3">
                          <Checkbox
                            id={deck.id}
                            checked={selectedDecks.includes(deck.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDecks([...selectedDecks, deck.id])
                              } else {
                                setSelectedDecks(selectedDecks.filter((id) => id !== deck.id))
                              }
                            }}
                          />
                          <label htmlFor={deck.id} className="text-white cursor-pointer">
                            {deck.title} ({deck.cards.length} cards)
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Study Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Choose your study method</h3>
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
                              : "border-white/20 bg-white/5 hover:bg-white/10"
                          }`}
                        >
                          <method.icon className="w-6 h-6 text-white mb-2" />
                          <span className="text-white font-medium">{method.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={startStudySession}
                  disabled={selectedDecks.length === 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white text-lg py-6 mt-8"
                >
                  Start Studying
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
                    className="text-white/70 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                  {getCurrentCard() && (
                    <>
                      <div className="text-center max-w-2xl">
                        <h3 className="text-2xl font-bold text-white mb-4">{getCurrentCard()?.question}</h3>
                        {showAnswer && (
                          <div className="bg-white/10 rounded-xl p-6 mt-6">
                            <p className="text-xl text-white">{getCurrentCard()?.answer}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-4">
                        {!showAnswer ? (
                          <Button
                            onClick={() => setShowAnswer(true)}
                            className="bg-white/20 hover:bg-white/30 text-white px-8 py-3"
                          >
                            Show Answer
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={() => handleStudyAnswer(false)}
                              variant="outline"
                              className="border-red-500 text-red-400 hover:bg-red-500/20 px-8 py-3"
                            >
                              <X className="w-4 h-4 mr-2" />
                              Incorrect
                            </Button>
                            <Button
                              onClick={() => handleStudyAnswer(true)}
                              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3"
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
