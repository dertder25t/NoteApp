"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
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
} from "lucide-react"

type ViewMode = "canvas" | "tabs"
type StudyMethod = "flashcards" | "written" | "multiple" | "matching"

interface CanvasItem {
  id: string
  type: "note" | "pdf" | "mindmap" | "flashcards"
  title: string
  content?: string
  x: number
  y: number
  width: number
  height: number
}

interface FlashcardDeck {
  id: string
  title: string
  cards: Array<{ question: string; answer: string }>
}

export default function NotesLab() {
  const [viewMode, setViewMode] = useState<ViewMode>("canvas")
  const [showStudyMode, setShowStudyMode] = useState(false)
  const [studyStep, setStudyStep] = useState<"setup" | "study">("setup")
  const [selectedDecks, setSelectedDecks] = useState<string[]>([])
  const [studyMethod, setStudyMethod] = useState<StudyMethod>("flashcards")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [studyProgress, setStudyProgress] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedTab, setSelectedTab] = useState("note-1")

  const canvasRef = useRef<HTMLDivElement>(null)
  const [canvasOffset, setCanvasOffset] = useState({ x: 0, y: 0 })
  const [canvasScale, setCanvasScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Sample data
  const folderName = "Biology 101"

  const canvasItems: CanvasItem[] = [
    {
      id: "note-1",
      type: "note",
      title: "Cell Structure",
      content: "Overview of cellular components and their functions...",
      x: 100,
      y: 100,
      width: 280,
      height: 200,
    },
    {
      id: "pdf-1",
      type: "pdf",
      title: "Textbook Chapter 3",
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
      width: 150,
      height: 150,
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
  ]

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
    { id: "mindmap-1", type: "mindmap", title: "Photosynthesis Map", icon: Brain },
  ]

  // Canvas interaction handlers
  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        setIsDragging(true)
        setDragStart({ x: e.clientX - canvasOffset.x, y: e.clientY - canvasOffset.y })
      }
    },
    [canvasOffset],
  )

  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setCanvasOffset({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, dragStart],
  )

  const handleCanvasMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleCanvasWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setCanvasScale((prev) => Math.max(0.1, Math.min(3, prev * delta)))
  }, [])

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
      // Study session complete
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

  const renderCanvasItem = (item: CanvasItem) => {
    const style = {
      transform: `translate(${item.x + canvasOffset.x}px, ${item.y + canvasOffset.y}px) scale(${canvasScale})`,
      width: item.width,
      height: item.height,
    }

    const baseClasses =
      "absolute backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 cursor-move hover:bg-white/15 transition-all duration-200"

    switch (item.type) {
      case "note":
        return (
          <div key={item.id} className={baseClasses} style={style}>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
            </div>
            <p className="text-white/70 text-xs line-clamp-4">{item.content}</p>
          </div>
        )

      case "pdf":
        return (
          <div key={item.id} className={baseClasses} style={style}>
            <div className="flex items-center gap-2 mb-2">
              <FileImage className="w-4 h-4 text-red-400" />
              <h3 className="font-semibold text-white text-sm">{item.title}</h3>
            </div>
            <div className="bg-white/5 rounded-lg h-full flex items-center justify-center">
              <span className="text-white/50 text-xs">PDF Preview</span>
            </div>
          </div>
        )

      case "mindmap":
        return (
          <div key={item.id} className={`${baseClasses} rounded-full flex items-center justify-center`} style={style}>
            <div className="text-center">
              <Brain className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <span className="text-white text-xs font-medium">{item.title}</span>
            </div>
          </div>
        )

      case "flashcards":
        return (
          <div key={item.id} className={baseClasses} style={style}>
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
            style={{ cursor: isDragging ? "grabbing" : "grab" }}
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
                        defaultValue="Cell structure notes go here..."
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
