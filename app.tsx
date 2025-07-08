"use client"

import { useState } from "react"
import Login from "./auth/login"
import MainDashboard from "./dashboard/main-dashboard"
import EnhancedNotesLab from "./notes-lab/enhanced-notes-lab"

type AppView = "login" | "dashboard" | "notes-lab"

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>("login")
  const [selectedFolder, setSelectedFolder] = useState<string>("")

  const handleLogin = () => {
    setCurrentView("dashboard")
  }

  const handleFolderClick = (folderId: string) => {
    setSelectedFolder(folderId)
    setCurrentView("notes-lab")
  }

  const handleBackToDashboard = () => {
    setCurrentView("dashboard")
    setSelectedFolder("")
  }

  const handleProfileClick = () => {
    // Handle profile navigation if needed
  }

  const getFolderName = (folderId: string) => {
    const folderNames: Record<string, string> = {
      biology: "Biology 101",
      math: "Mathematics",
      chemistry: "Chemistry",
      physics: "Physics",
      history: "History",
      literature: "Literature",
    }
    return folderNames[folderId] || "Unknown Folder"
  }

  if (currentView === "login") {
    return <Login onLogin={handleLogin} />
  }

  if (currentView === "dashboard") {
    return <MainDashboard onFolderClick={handleFolderClick} onProfileClick={handleProfileClick} />
  }

  if (currentView === "notes-lab") {
    return <EnhancedNotesLab onBackToDashboard={handleBackToDashboard} folderName={getFolderName(selectedFolder)} />
  }

  return null
}
