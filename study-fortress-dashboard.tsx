"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Filter, Plus, Sun, ChevronDown, ChevronUp, File, Folder, Music, Clock } from "lucide-react"

export default function StudyFortressDashboard() {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const [isMusicPlayerExpanded, setIsMusicPlayerExpanded] = useState(true)

  const recentItems = [
    { icon: File, name: "Biology Notes", type: "file" },
    { icon: File, name: "Chemistry Lab", type: "file" },
    { icon: Folder, name: "Physics", type: "folder" },
  ]

  const favoriteItems = [
    { icon: Folder, name: "Calculus II", type: "folder" },
    { icon: File, name: "History Essay", type: "file" },
    { icon: Folder, name: "Literature", type: "folder" },
  ]

  const folders = [
    { name: "Biology", description: "Cell structure and functions", cards: 128, color: "bg-pink-500" },
    { name: "Mathematics", description: "Calculus and algebra problems", cards: 95, color: "bg-blue-500" },
    { name: "Chemistry", description: "Organic chemistry reactions", cards: 76, color: "bg-purple-500" },
    { name: "Physics", description: "Quantum mechanics basics", cards: 142, color: "bg-green-500" },
    { name: "History", description: "World War II timeline", cards: 89, color: "bg-orange-500" },
    { name: "Literature", description: "Shakespeare analysis", cards: 67, color: "bg-red-500" },
  ]

  const weeklyActivity = [65, 80, 45, 90, 75, 60, 85]
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

  return (
    <div className="min-h-screen bg-black text-white font-['Poppins'] p-6">
      <div className="flex gap-6 h-[calc(100vh-3rem)]">
        {/* Sidebar */}
        <div className="w-64 flex flex-col gap-6">
          {/* Recents & Favorites */}
          <div className="flex-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="space-y-6">
              {/* Recents */}
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-3">RECENTS</h3>
                <div className="space-y-2">
                  {recentItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/80">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Favorites */}
              <div>
                <h3 className="text-sm font-semibold text-white/70 mb-3">FAVORITES</h3>
                <div className="space-y-2">
                  {favoriteItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-white/60" />
                      <span className="text-sm text-white/80">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Music Player */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => setIsMusicPlayerExpanded(!isMusicPlayerExpanded)}
            >
              <h3 className="text-sm font-semibold text-white/70">FOCUS MUSIC</h3>
              {isMusicPlayerExpanded ? (
                <ChevronUp className="w-4 h-4 text-white/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/60" />
              )}
            </div>

            {isMusicPlayerExpanded && (
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4 text-center">
                  <Music className="w-8 h-8 text-white/40 mx-auto mb-2" />
                  <p className="text-xs text-white/60">Spotify Player</p>
                  <p className="text-xs text-white/40">Lo-fi Study Beats</p>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white/70 mb-4">STATUS</h3>

            {/* Weekly Activity */}
            <div className="mb-6">
              <p className="text-xs text-white/60 mb-3">Weekly Activity</p>
              <div className="flex items-end justify-between h-16 gap-1">
                {weeklyActivity.map((value, index) => (
                  <div key={index} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className="w-full bg-gradient-to-t from-pink-500 to-blue-500 rounded-sm transition-all duration-1000 ease-out"
                      style={{ height: `${(value / 100) * 100}%` }}
                    />
                    <span className="text-xs text-white/40">{days[index]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Study Session */}
            <div>
              <p className="text-xs text-white/60 mb-2">Next Study Session</p>
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">15</div>
                  <div className="text-xs text-white/40">JAN</div>
                </div>
                <div className="flex items-center gap-1 text-xs text-white/60">
                  <Clock className="w-3 h-3" />
                  <span>2h 30m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Header */}
          <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">My Folders</h1>

              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="flex items-center">
                  {isSearchExpanded ? (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Search folders..."
                        className="w-48 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        autoFocus
                        onBlur={() => setIsSearchExpanded(false)}
                      />
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsSearchExpanded(true)}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Search className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Filter */}
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Filter className="w-4 h-4" />
                </Button>

                {/* Create Folder */}
                <Button className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white border-0 transition-all duration-300 hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Folder
                </Button>

                {/* Theme Toggle */}
                <Button variant="ghost" size="icon" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Sun className="w-4 h-4" />
                </Button>

                {/* User Profile */}
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback className="bg-gradient-to-r from-pink-500 to-blue-500 text-white text-sm">
                    SF
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          {/* Folder List */}
          <div className="flex-1 backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="space-y-4">
              {folders.map((folder, index) => (
                <div
                  key={index}
                  className="flex items-center p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-pointer group border border-white/5 hover:border-white/20"
                >
                  <div className={`w-1 h-12 ${folder.color} rounded-full mr-4`} />

                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-white/90 transition-colors">
                      {folder.name}
                    </h3>
                    <p className="text-sm text-white/60 group-hover:text-white/70 transition-colors">
                      {folder.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-medium text-white/80">{folder.cards} cards</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
