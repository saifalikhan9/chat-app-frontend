import { MessageCircle } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "./ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-black">
      {/* Header */}
      <header className="flex items-center justify-between p-6 lg:px-12">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-8 w-8 text-white" />
          <span className="text-xl font-bold text-white tracking-wider">CHAT APP</span>
        </div>
        <Link to="/signin">
          <Button
            variant="outline"
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500 hover:border-emerald-600 px-8 py-2 rounded-full font-medium"
          >
            LOGIN
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">MORE THAN MESSAGING.</h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            AI Turns Your Chats Into Clear, Useful Insights.
          </p>

          <div className="pt-4">
            <Link to="/signup">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-12 py-4 rounded-full text-lg font-medium tracking-wide"
              >
                GET STARTED
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
