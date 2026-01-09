// Telegram Web App SDK types and utilities
// SDK is loaded via script tag in index.html

declare global {
    interface Window {
        Telegram?: {
            WebApp: TelegramWebApp;
        };
    }
}

export interface TelegramUser {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    photo_url?: string;
}

export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
        query_id?: string;
        user?: TelegramUser;
        auth_date?: number;
        hash?: string;
    };
    version: string;
    platform: string;
    colorScheme: 'light' | 'dark';
    themeParams: {
        bg_color?: string;
        text_color?: string;
        hint_color?: string;
        link_color?: string;
        button_color?: string;
        button_text_color?: string;
        secondary_bg_color?: string;
    };
    isExpanded: boolean;
    viewportHeight: number;
    viewportStableHeight: number;
    headerColor: string;
    backgroundColor: string;
    isClosingConfirmationEnabled: boolean;

    // Methods
    ready: () => void;
    expand: () => void;
    close: () => void;
    enableClosingConfirmation: () => void;
    disableClosingConfirmation: () => void;
    setHeaderColor: (color: 'bg_color' | 'secondary_bg_color' | string) => void;
    setBackgroundColor: (color: string) => void;

    // Haptic Feedback
    HapticFeedback: {
        impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
        notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
        selectionChanged: () => void;
    };

    // Main Button
    MainButton: {
        text: string;
        color: string;
        textColor: string;
        isVisible: boolean;
        isActive: boolean;
        isProgressVisible: boolean;
        setText: (text: string) => void;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
        enable: () => void;
        disable: () => void;
        showProgress: (leaveActive?: boolean) => void;
        hideProgress: () => void;
    };

    // Back Button
    BackButton: {
        isVisible: boolean;
        onClick: (callback: () => void) => void;
        offClick: (callback: () => void) => void;
        show: () => void;
        hide: () => void;
    };

    // Events
    onEvent: (eventType: string, eventHandler: () => void) => void;
    offEvent: (eventType: string, eventHandler: () => void) => void;
    sendData: (data: string) => void;
    openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
    openTelegramLink: (url: string) => void;
    showPopup: (params: { title?: string; message: string; buttons?: Array<{ id?: string; type?: string; text?: string }> }, callback?: (buttonId: string) => void) => void;
    showAlert: (message: string, callback?: () => void) => void;
    showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
}

// Check if running inside Telegram
export const isTelegramWebApp = (): boolean => {
    return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
};

// Get Telegram WebApp instance
export const getTelegramWebApp = (): TelegramWebApp | null => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
        return window.Telegram.WebApp;
    }
    return null;
};

// Get current user from Telegram
export const getTelegramUser = (): TelegramUser | null => {
    const webApp = getTelegramWebApp();
    return webApp?.initDataUnsafe?.user || null;
};

// Initialize Telegram WebApp
export const initTelegramApp = (): void => {
    const webApp = getTelegramWebApp();
    if (!webApp) return;

    // Tell Telegram we're ready
    webApp.ready();

    // Expand to full height
    webApp.expand();

    // Set dark theme colors
    webApp.setHeaderColor('#0a0a0a');
    webApp.setBackgroundColor('#0a0a0a');

    // Enable closing confirmation for unsaved data
    webApp.enableClosingConfirmation();
};

// Haptic feedback utilities
export const haptic = {
    light: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('light'),
    medium: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('medium'),
    heavy: () => getTelegramWebApp()?.HapticFeedback?.impactOccurred('heavy'),
    success: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('success'),
    error: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('error'),
    warning: () => getTelegramWebApp()?.HapticFeedback?.notificationOccurred('warning'),
    selection: () => getTelegramWebApp()?.HapticFeedback?.selectionChanged(),
};

// Theme utilities
export const getTelegramTheme = (): 'light' | 'dark' => {
    return getTelegramWebApp()?.colorScheme || 'dark';
};

// Main Button utilities
export const mainButton = {
    show: (text: string, onClick: () => void) => {
        const webApp = getTelegramWebApp();
        if (!webApp) return;

        webApp.MainButton.setText(text);
        webApp.MainButton.onClick(onClick);
        webApp.MainButton.show();
    },
    hide: () => {
        getTelegramWebApp()?.MainButton?.hide();
    },
    showProgress: () => {
        getTelegramWebApp()?.MainButton?.showProgress(true);
    },
    hideProgress: () => {
        getTelegramWebApp()?.MainButton?.hideProgress();
    }
};

// Back Button utilities
export const backButton = {
    show: (onClick: () => void) => {
        const webApp = getTelegramWebApp();
        if (!webApp) return;

        webApp.BackButton.onClick(onClick);
        webApp.BackButton.show();
    },
    hide: () => {
        getTelegramWebApp()?.BackButton?.hide();
    }
};

// Get unique user ID for Supabase
export const getUserId = (): string => {
    const telegramUser = getTelegramUser();
    if (telegramUser) {
        return `tg_${telegramUser.id}`;
    }
    // Fallback for web usage
    let localId = localStorage.getItem('strategist-user-id');
    if (!localId) {
        localId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('strategist-user-id', localId);
    }
    return localId;
};
