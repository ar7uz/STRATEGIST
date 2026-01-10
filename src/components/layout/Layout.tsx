import React from 'react';
import {
    LayoutDashboard,
    PieChart,
    BarChart3,
    Settings,
    ListTodo,
    Flame,
    Shield,
    Zap,
    Grid3X3,
    Brain,
    FolderKanban,
    MoreHorizontal,
    StickyNote
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { haptic, getTelegramUser, isTelegramWebApp } from '../../lib/telegram';

interface NavItem {
    icon: React.ElementType;
    label: string;
    id: string;
}

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tabId: string) => void;
}

const NAV_ITEMS: NavItem[] = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: ListTodo },
    { id: 'habits', label: 'Habits', icon: Flame },
    { id: 'projects', label: 'Projects', icon: FolderKanban },
    { id: 'sectors', label: 'Sectors', icon: PieChart },
    { id: 'eisenhower', label: 'Matrix', icon: Grid3X3 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'insights', label: 'AI Insights', icon: Brain },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'notes', label: 'Quick Notes', icon: StickyNote },
];

// Mobile navigation items (first 4 + More menu)
const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 4);

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
    const [showMoreMenu, setShowMoreMenu] = React.useState(false);
    const telegramUser = getTelegramUser();
    const isInTelegram = isTelegramWebApp();

    const handleNavClick = (tabId: string) => {
        haptic.light();
        onTabChange(tabId);
        setShowMoreMenu(false);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-72 flex-col bg-gray-900/40 backdrop-blur-xl border-r border-gray-800/50">
                {/* Logo */}
                <div className="p-6 border-b border-gray-800/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-glow-cyan">
                            <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">THE STRATEGIST</h1>
                            <p className="text-xs text-cyan-400 font-medium">Strategic Command</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1">
                    {NAV_ITEMS.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={cn(
                                    `
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl
                  text-sm font-medium
                  transition-all duration-200
                  `,
                                    isActive
                                        ? 'bg-gradient-to-r from-cyan-400/20 to-purple-400/10 text-cyan-400 border border-cyan-400/20'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                                )}
                            >
                                <item.icon className={cn('w-5 h-5', isActive && 'text-cyan-400')} />
                                <span>{item.label}</span>
                                {isActive && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-glow-cyan" />
                                )}
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-800/50">
                    <div className="glass-card p-4 rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                                {telegramUser ? telegramUser.first_name.charAt(0) : 'S'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {telegramUser ? telegramUser.first_name : 'Strategist'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {isInTelegram ? 'Telegram Mini App' : 'Pro Plan'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-gray-800/50 bg-gray-900/60 backdrop-blur-xl flex items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white">THE STRATEGIST</span>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <div className="px-4 py-4 md:p-8 max-w-6xl mx-auto w-full">
                        {children}
                    </div>
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden h-20 border-t border-gray-800/50 bg-gray-900/80 backdrop-blur-xl flex items-center justify-around px-2 pb-safe">
                    {MOBILE_NAV_ITEMS.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item.id)}
                                className={cn(
                                    'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px]',
                                    isActive
                                        ? 'text-cyan-400'
                                        : 'text-gray-500 hover:text-gray-300'
                                )}
                            >
                                <item.icon className={cn('w-6 h-6', isActive && 'drop-shadow-[0_0_8px_rgba(0,212,170,0.5)]')} />
                                <span className="text-[10px] mt-1 font-medium">{item.label.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                    {/* More Menu Button */}
                    <div className="relative">
                        <button
                            onClick={() => { haptic.light(); setShowMoreMenu(!showMoreMenu); }}
                            className={cn(
                                'flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 min-w-[60px]',
                                showMoreMenu ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'
                            )}
                        >
                            <MoreHorizontal className="w-6 h-6" />
                            <span className="text-[10px] mt-1 font-medium">More</span>
                        </button>

                        {/* More Menu Dropdown */}
                        {showMoreMenu && (
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-elevated overflow-hidden">
                                {NAV_ITEMS.slice(4).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleNavClick(item.id)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                                            activeTab === item.id
                                                ? 'bg-cyan-400/10 text-cyan-400'
                                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        )}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </nav>
            </main>
        </div>
    );
};
