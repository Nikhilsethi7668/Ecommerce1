import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"


export function SearchSuggestions({ query, onSelect }) {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        if (response.ok) {
          const data = await response.json()
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error("Search suggestions failed:", error)
      } finally {
        setLoading(false)
      }
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [query])

  const handleSuggestionClick = (suggestion) => {
    onSelect()
    navigate(suggestion.url)
  }

  const handleSearchSubmit = () => {
    onSelect()
    navigate(`/products?search=${encodeURIComponent(query)}`)
  }

  if (!query.trim()) return null

  return (
    <div className="absolute top-full left-0 right-0 bg-popover border border-border rounded-md shadow-lg mt-1 z-50">
      <div className="p-2">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Search for query option */}
            <Button variant="ghost" className="w-full justify-start text-left p-2 h-auto" onClick={handleSearchSubmit}>
              <Search className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Search for "{query}"</span>
            </Button>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-t border-border mt-2 pt-2">
                {suggestions.slice(0, 5).map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant="ghost"
                    className="w-full justify-start text-left p-2 h-auto"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.name}
                  </Button>
                ))}
              </div>
            )}

            {suggestions.length === 0 && !loading && (
              <div className="text-muted-foreground text-sm p-2">No suggestions found</div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
