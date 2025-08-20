"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/Components/ui/card"
import { Checkbox } from "@/app/Components/ui/checkbox"
import { Progress } from "@/app/Components/ui/progress"
import { Label } from "@/app/Components/ui/label"
import { HomeIcon, CheckSquareIcon, DollarSignIcon, UsersIcon, BriefcaseIcon, LucideLogOut, MenuIcon, XIcon, AlertCircle } from "lucide-react"
import { Button } from "@/app/Components/ui/button"
import { Alert, AlertDescription } from "@/app/Components/ui/alert"
import { useRouter } from "next/navigation"
import WeddingBudget from "../budget/page"
import WeddingVendors from "../vendors/page"
import WeddingGuests from "../guests/page"

type Task = {
  id?: string
  task_key: string
  category: string
  text: string
  completed: boolean
  user_id?: string
  created_at?: string
  updated_at?: string
}

export default function WeddingChecklist() {
  const supabase = createClient()
  const router = useRouter()

  const [activeSection, setActiveSection] = useState("overview")
  const [menuOpen, setMenuOpen] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Define category order for proper sorting
  const categoryOrder = [
    "12+ Months Out",
    "12-9 Months Out",
    "9-6 Months Out",
    "6-3 Months Out",
    "3-1 Months Out",
    "1 Month Out",
    "Week Of"
  ]


  const defaultTasks: Task[] = [
    { task_key: "1", category: "12+ Months Out", text: "Set a budget", completed: false },
    { task_key: "2", category: "12+ Months Out", text: "Choose your wedding party", completed: false },
    { task_key: "3", category: "12+ Months Out", text: "Create a guest list", completed: false },
    { task_key: "4", category: "12-9 Months Out", text: "Book your venue", completed: false },
    { task_key: "5", category: "12-9 Months Out", text: "Hire a wedding planner", completed: false },
    { task_key: "6", category: "12-9 Months Out", text: "Choose your wedding dress", completed: false },
    { task_key: "7", category: "9-6 Months Out", text: "Send save-the-dates", completed: false },
    { task_key: "8", category: "9-6 Months Out", text: "Book photographer & videographer", completed: false },
    { task_key: "9", category: "9-6 Months Out", text: "Plan honeymoon", completed: false },
    { task_key: "10", category: "6-3 Months Out", text: "Choose wedding rings", completed: false },
    { task_key: "11", category: "6-3 Months Out", text: "Finalize menu with caterer", completed: false },
    { task_key: "12", category: "3-1 Months Out", text: "Send out invitations", completed: false },
    { task_key: "13", category: "3-1 Months Out", text: "Get marriage license", completed: false },
    { task_key: "14", category: "1 Month Out", text: "Final dress fitting", completed: false },
    { task_key: "15", category: "1 Month Out", text: "Confirm all vendors", completed: false },
    { task_key: "16", category: "Week Of", text: "Pick up wedding rings", completed: false },
    { task_key: "17", category: "Week Of", text: "Relax and enjoy!", completed: false },
  ]

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log(" Starting fetchTasks...")

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.error("Authentication error:", userError.message)
        router.push("/login")
        return
      }

      if (!userData.user) {
        console.error("No user found in userData")
        router.push("/login")
        return
      }

      const user_id = userData.user.id
      setUserId(user_id)
      console.log("User authenticated, ID:", user_id)

      console.log("🔄 Fetching tasks from database...")
      const { data: existingTasks, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user_id)
        .order('task_key', { ascending: true })

      console.log(" Database response:", {
        existingTasks: existingTasks?.length || 0,
        tasksError: tasksError?.message || "none"
      })

      if (tasksError) {
        console.error(" Error fetching tasks:", tasksError.message)
        setError(`Database error: ${tasksError.message}`)
        setTasks(defaultTasks) // Use default tasks as fallback
        setLoading(false)
        return
      }

      // If user has no tasks, initialize with default tasks
      if (!existingTasks || existingTasks.length === 0) {
        console.log(" No existing tasks found, initializing with default tasks...")

        const tasksToInsert = defaultTasks.map(task => ({
          user_id,
          task_key: task.task_key,
          category: task.category,
          text: task.text,
          completed: task.completed
        }))

        console.log("Inserting tasks:", tasksToInsert.length)

        try {
          const { data: insertedTasks, error: insertError } = await supabase
            .from('tasks')
            .insert(tasksToInsert)
            .select()

          if (insertError) {
            console.error("Error initializing tasks:", insertError.message)
            setError(`Unable to save tasks to server: ${insertError.message}. Working with local data.`)
            setTasks(defaultTasks)
          } else {
            console.log(" Tasks initialized successfully:", insertedTasks?.length || 0)
            setTasks(insertedTasks || defaultTasks)
          }
        } catch (insertError) {
          console.error(" Network error during task initialization:", insertError)
          setError("Network error. Working with offline mode.")
          setTasks(defaultTasks)
        }
      } else {
        // User has existing tasks
        console.log("Found existing tasks:", existingTasks.length)
        setTasks(existingTasks)
      }

      setRetryCount(0) // Reset retry count on successful fetch
      setLoading(false)

    } catch (error: any) {
      console.error("Unexpected error in fetchTasks:", error)
      setError(`An unexpected error occurred: ${error.message}. Using default tasks.`)
      setLoading(false)

      // Use default tasks as fallback
      setTasks(defaultTasks)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [supabase, router])

  const handleToggleTask = async (taskKey: string) => {
    if (!userId) return

    // Find the task in frontend state
    const currentTask = tasks.find(task => task.task_key === taskKey)
    if (!currentTask) return

    // Optimistic update (update UI immediately)
    setTasks(prev => prev.map(task =>
      task.task_key === taskKey
        ? { ...task, completed: !task.completed }
        : task
    ))

    try {
      // Update Supabase
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !currentTask.completed })
        .eq("task_key", taskKey)
        .eq("user_id", userId)

      if (error) {
        console.error("Error updating task:", error.message)
        // Revert UI if database update failed
        setTasks(prev => prev.map(task =>
          task.task_key === taskKey
            ? { ...task, completed: currentTask.completed }
            : task
        ))
        setError("Failed to save changes. Please try again.")
      } else {
        // Optional: small confirmation
        setError("Changes saved!")
        setTimeout(() => setError(null), 2000)
      }
    } catch (err) {
      console.error(" Network error updating task:", err)
      setError("Changes saved locally. Will sync when online.")
    }
  }

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchTasks()
  }

  // Sort categories in proper order
  const sortedCategories = categoryOrder.filter(category =>
    tasks.some(task => task.category === category)
  )

  const completedTasks = tasks.filter((task) => task.completed).length
  const totalTasks = tasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0


  function logout() {
    window.location.href = "/logout";
  }

  function renderSection() {
    switch (activeSection) {
      case "overview":
        return (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-400">Overview</h2>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-4 border-yellow-300 bg-yellow-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  {error.includes('Unable to connect') && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      {loading ? 'Retrying...' : 'Retry'}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Card className="p-4 md:p-6 bg-white shadow-lg border-blue-300 border-2 mb-6">
              <CardHeader>
                <CardTitle className="text-lg md:text-2xl text-cyan-300">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row items-center md:space-x-4 space-y-2 md:space-y-0">
                  <Progress value={progress} className="h-4 w-full bg-blue-300 [&>*]:bg-red-400" />
                  <span className="text-lg font-semibold text-pink-600">{Math.round(progress)}%</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </CardContent>
            </Card>
          </div>
        )
      case "checklist":
        if (loading) {
          return (
            <div className="text-center py-10 text-gray-500 animate-pulse">
              Loading your checklist...
            </div>
          )
        }
        return (
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-400">Checklist</h2>

            {/* Error Alert */}
            {error && (
              <Alert className="mb-4 border-yellow-300 bg-yellow-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  {error.includes('Unable to connect') && (
                    <Button
                      onClick={handleRetry}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      {loading ? 'Retrying...' : 'Retry'}
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {loading ? (
              <div className="text-center py-10 text-gray-500 animate-pulse">
                Loading your wedding checklist...
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No tasks found. This might be a database connection issue.</p>
                <Button onClick={handleRetry} variant="outline">
                  Retry Loading Tasks
                </Button>
              </div>
            ) : sortedCategories.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-red-500 mb-2">Tasks loaded but no categories found!</p>
                <p className="text-sm text-gray-500 mb-4">
                  Found {tasks.length} tasks. Categories: {[...new Set(tasks.map(t => t.category))].join(', ') || 'None'}
                </p>
                <Button onClick={() => setTasks(defaultTasks)} variant="outline">
                  Reset to Default Tasks
                </Button>
              </div>
            ) : (
              sortedCategories.map((category) => (
                <Card key={category} className="p-4 md:p-6 bg-white shadow-lg border-blue-300 border-2 group hover:shadow-xl transition-shadow duration-300 mb-6">
                  <CardHeader>
                    <CardTitle className="text-lg md:text-2xl text-cyan-300 group-hover:text-pink-500 transition-colors">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tasks
                      .filter((task) => task.category === category)
                      .sort((a, b) => parseInt(a.task_key) - parseInt(b.task_key)) // Sort tasks within category
                      .map((task) => (
                        <div key={task.task_key} className="flex items-center space-x-3 p-2 md:p-3 rounded-md hover:bg-pink-300 transition-colors duration-200">
                          <Checkbox
                            id={`task-${task.task_key}`}
                            checked={task.completed}
                            onCheckedChange={() => handleToggleTask(task.task_key)}
                            className="w-5 h-5 border-blue-300 data-[state=checked]:bg-cyan-300 data-[state=checked]:text-white"
                          />
                          <Label
                            htmlFor={`task-${task.task_key}`}
                            className={`text-base md:text-lg cursor-pointer flex-1 ${task.completed ? "line-through text-gray-500" : "text-gray-800"}`}
                          >
                            {task.text}
                          </Label>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )
      case "budget":
        return <WeddingBudget />
      case "vendors":
        return <WeddingVendors />
      case "guests":
        return <WeddingGuests />
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 flex items-center justify-between p-4 bg-blue-200 shadow z-50">
        <h1 className="text-lg font-bold">Wedding Planner</h1>
        <button onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Backdrop */}
      {menuOpen && (
        <div className="fixed transparent backdrop-blur-sm z-10" onClick={() => setMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed bg-blue-200 shadow-xl p-4 flex flex-col justify-between z-40
          transition-all duration-300 ease-in-out overflow-hidden
          md:top-0 md:left-0 md:w-64 md:h-110 md:rounded-b-full md:opacity-100 md:max-h-full md:block
          top-[60px] left-0 w-full
          ${menuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="mb-8 text-center hidden md:block">
          <h1 className="text-2xl font-bold">Wedding Planner</h1>
        </div>

        <nav className="space-y-2">
          {[
            { key: "overview", label: "Overview", icon: HomeIcon },
            { key: "checklist", label: "Checklist", icon: CheckSquareIcon },
            { key: "budget", label: "Budget", icon: DollarSignIcon },
            { key: "vendors", label: "Vendors", icon: BriefcaseIcon },
            { key: "guests", label: "Guests", icon: UsersIcon },
          ].map((item) => (
            <Button
              key={item.key}
              variant="ghost"
              className={`w-full justify-start text-base md:text-lg py-3 md:py-6 rounded-lg transition-all duration-200 ${activeSection === item.key
                ? "bg-pink-500/30 text-blue-600 shadow-md"
                : "text-gray-700 hover:bg-pink-500/10 hover:text-blue-400"
                }`}
              onClick={() => {
                setActiveSection(item.key);
                setMenuOpen(false);
              }}
            >
              <item.icon className="mr-3 h-5 w-5 md:h-6 md:w-6" />
              {item.label}
            </Button>
          ))}
          <div className="mt-4">
            <Button
              variant="ghost"
              className="w-full justify-center text-base md:text-lg py-3 md:py-6 rounded-lg text-blue-500 hover:text-fuchsia-600 hover:animate-pulse flex items-center gap-2"
              onClick={logout}
            >
              <LucideLogOut className="h-5 w-5 md:h-6 md:w-6" />
              Logout
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 p-4 md:p-8 overflow-auto transition-all duration-300
          md:ml-64
          ${menuOpen ? "mt-[360px] blur-sm" : "mt-[60px] blur-none"} md:mt-0`}
      >
        {renderSection()}
      </main>
    </div>
  );
}





