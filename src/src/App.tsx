import { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { SectorsView } from './features/sectors/SectorsView';
import { TasksView } from './features/tasks/TasksView';
import { AnalyticsView } from './features/analytics/AnalyticsView';
import { FocusSessionView } from './features/focus/FocusSessionView';
import { MorningBriefing } from './features/briefing/MorningBriefing';
import { HabitsView } from './features/habits/HabitsView';
import { SettingsView } from './features/settings/SettingsView';
import { AdminView } from './features/admin/AdminView';
import { NotesWidget } from './features/notes/NotesWidget';
import { PomodoroStats } from './features/pomodoro/PomodoroStats';
import { WeeklyReview } from './features/review/WeeklyReview';
import { ProjectsView } from './features/projects/ProjectsView';
import { EisenhowerView } from './features/eisenhower/EisenhowerView';
import { InsightsView } from './features/insights/InsightsView';
import type { Task } from './lib/types';
import { useSectorsStore } from './features/sectors/store';
import { useHabitsStore } from './features/habits/store';
import { Button } from './components/ui/Button';
import { Card } from './components/ui/Card';
import { FileText, Target, Zap, ArrowRight, Flame, ListTodo } from 'lucide-react';
import { initTelegramApp, isTelegramWebApp, getTelegramUser } from './lib/telegram';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSessionTask, setActiveSessionTask] = useState<Task | null>(null);
  const [showBriefing, setShowBriefing] = useState(false);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const { sectors } = useSectorsStore();
  const { getTodayProgress } = useHabitsStore();

  // Initialize Telegram WebApp
  useEffect(() => {
    initTelegramApp();

    if (isTelegramWebApp()) {
      const user = getTelegramUser();
      console.log('Running in Telegram Mini App', user);
    }
  }, []);

  const handleStartSession = (task: Task) => {
    setActiveSessionTask(task);
  };

  const activeSector = activeSessionTask ? sectors.find(s => s.id === activeSessionTask.sectorId) : null;
  const habitProgress = getTodayProgress();

  // Show briefing on first load of the day
  useEffect(() => {
    const lastBriefing = localStorage.getItem('lastBriefingDate');
    const today = new Date().toDateString();
    if (lastBriefing !== today) {
      localStorage.setItem('lastBriefingDate', today);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case '1':
          setActiveTab('dashboard');
          break;
        case '2':
          setActiveTab('tasks');
          break;
        case '3':
          setActiveTab('habits');
          break;
        case '4':
          setActiveTab('analytics');
          break;
        case 'b':
          setShowBriefing(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-gray-800/50 p-8">
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-purple-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl" />

              <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
                      <Zap className="w-4 h-4" />
                      <span>Strategic Command Center</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
                      Ready for impact?
                    </h1>
                    <p className="text-gray-400 text-lg max-w-md">
                      Review your mission briefing and start executing your strategic objectives.
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => setShowBriefing(true)}
                    className="whitespace-nowrap"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    View Briefing
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card
                hoverable
                onClick={() => setActiveTab('tasks')}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-cyan-600/10 flex items-center justify-center">
                  <ListTodo className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Tasks</h3>
                  <p className="text-sm text-gray-400">Plan your day</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </Card>

              <Card
                hoverable
                onClick={() => setActiveTab('habits')}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400/20 to-orange-600/10 flex items-center justify-center">
                  <Flame className="w-6 h-6 text-orange-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Habits</h3>
                  <p className="text-sm text-gray-400">{habitProgress.completed}/{habitProgress.total} today</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </Card>

              <Card
                hoverable
                onClick={() => setActiveTab('sectors')}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400/20 to-purple-600/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Sectors</h3>
                  <p className="text-sm text-gray-400">{sectors.length} active</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </Card>

              <Card
                hoverable
                onClick={() => setActiveTab('analytics')}
                className="flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400/20 to-green-600/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Analytics</h3>
                  <p className="text-sm text-gray-400">Insights</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </Card>
            </div>

            {/* Tasks Section */}
            <TasksView onStartSession={handleStartSession} />
          </div>
        );

      case 'tasks':
        return <TasksView onStartSession={handleStartSession} />;

      case 'sectors':
        return <SectorsView />;

      case 'habits':
        return <HabitsView />;

      case 'focus':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-24 h-24 rounded-3xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center">
              <Target className="w-12 h-12 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">No Active Session</h2>
              <p className="text-gray-400 max-w-md">
                Select a task from Tasks to start a focused work session.
              </p>
            </div>
            <Button onClick={() => setActiveTab('tasks')}>
              Go to Tasks
            </Button>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-8">
            <AnalyticsView />
            <PomodoroStats />
          </div>
        );

      case 'projects':
        return <ProjectsView />;

      case 'eisenhower':
        return <EisenhowerView />;

      case 'insights':
        return <InsightsView />;

      case 'settings':
        return <SettingsView />;

      case 'admin':
        return <AdminView />;

      default:
        return <div>Not Found</div>;
    }
  };

  // Focus Session Overlay
  if (activeSessionTask && activeSector) {
    return (
      <FocusSessionView
        task={activeSessionTask}
        sector={activeSector}
        onExit={() => setActiveSessionTask(null)}
        onComplete={() => setActiveSessionTask(null)}
      />
    );
  }

  return (
    <>
      <Layout activeTab={activeTab} onTabChange={(tab) => {
        if (tab === 'notes') {
          setShowNotes(true);
        } else {
          setActiveTab(tab);
        }
      }}>
        {renderContent()}
      </Layout>
      <MorningBriefing isOpen={showBriefing} onClose={() => setShowBriefing(false)} />
      <WeeklyReview isOpen={showWeeklyReview} onClose={() => setShowWeeklyReview(false)} />
      <NotesWidget externalOpen={showNotes} onExternalClose={() => setShowNotes(false)} />
    </>
  );
}

export default App;
