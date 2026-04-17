"use client"
import React, { createContext, useContext, useState } from "react"

const SearchContext = createContext<any>(null)

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("all")

  return (
    <SearchContext.Provider value={{ searchTerm, setSearchTerm, selectedBranch, setSelectedBranch }}>
      {children}
    </SearchContext.Provider>
  )
}

export const useSearch = () => useContext(SearchContext)
