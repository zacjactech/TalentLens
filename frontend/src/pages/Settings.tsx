import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    CheckCircle,
    XCircle
} from 'lucide-react';

export const Settings = () => {
    const { user } = useAuth();
    const { theme, settings, setTheme, updateSettings } = useTheme();
    const [activeTab, setActiveTab] = useState('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
        try {
            await setTheme(newTheme);
            setSaveMessage({ type: 'success', text: 'Theme updated successfully' });
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'Failed to update theme' });
        }
    };

    const handlePreferenceChange = async (key: string, value: any) => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await updateSettings({ [key]: value });
            setSaveMessage({ type: 'success', text: 'Settings updated successfully' });
            setTimeout(() => setSaveMessage(null), 3000);
        } catch (error) {
            setSaveMessage({ type: 'error', text: 'Failed to update settings' });
        } finally {
            setIsSaving(false);
        }
    };

    const renderTabIcon = (tab: string) => {
        switch (tab) {
            case 'profile': return <User className="w-5 h-5 mr-3" />;
            case 'account': return <Globe className="w-5 h-5 mr-3" />;
            case 'appearance': return <Palette className="w-5 h-5 mr-3" />;
            case 'notifications': return <Bell className="w-5 h-5 mr-3" />;
            case 'security': return <Shield className="w-5 h-5 mr-3" />;
            default: return null;
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings' },
        { id: 'account', label: 'Account Preferences' },
        { id: 'appearance', label: 'Appearance' },
        { id: 'notifications', label: 'Notifications' },
        { id: 'security', label: 'Security' },
    ];

    return (
        <div className="flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden">


            <div className="flex-1 flex overflow-hidden">
                {/* Settings Sidebar */}
                <div className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-primary overflow-y-auto transition-colors">
                    <nav className="p-4 space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-150 ${activeTab === tab.id
                                    ? 'bg-indigo-50 dark:bg-accent/20 text-accent dark:text-indigo-400'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                {renderTabIcon(tab.id)}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Settings Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-background-dark p-8 transition-colors">
                    <div className="max-w-3xl mx-auto space-y-8">

                        {/* Status Message Toast */}
                        {saveMessage && (
                            <div className={`p-4 rounded-lg flex items-center ${saveMessage.type === 'success'
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800/30'
                                : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800/30'
                                }`}>
                                {saveMessage.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <XCircle className="w-5 h-5 mr-2" />}
                                {saveMessage.text}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="bg-white dark:bg-primary rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Profile Information</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Update your personal details here.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="flex items-center space-x-6">
                                        <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-accent to-purple-500 flex items-center justify-center text-white text-3xl font-display font-semibold shadow-inner">
                                            {user?.email?.[0].toUpperCase() || 'U'}
                                        </div>
                                        <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                            Change Avatar
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                                            <input
                                                type="email"
                                                disabled
                                                value={user?.email || ''}
                                                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 shadow-sm focus:border-accent focus:ring-accent sm:text-sm px-4 py-2"
                                            />
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Your email is managed by your Identity Provider.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="bg-white dark:bg-primary rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance & Theme</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Customize how the application looks.</p>
                                </div>
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                        {/* Light Mode Box */}
                                        <button
                                            onClick={() => handleThemeChange('light')}
                                            className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${theme === 'light' ? 'border-accent bg-indigo-50/30 dark:bg-accent/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}>
                                            <div className="w-full h-24 bg-gray-100 rounded-lg mb-4 flex items-center justify-center border border-gray-200">
                                                <div className="w-16 h-12 bg-white rounded shadow-sm flex flex-col p-2 space-y-1">
                                                    <div className="w-full h-2 bg-gray-200 rounded"></div>
                                                    <div className="w-2/3 h-2 bg-gray-200 rounded"></div>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Light Mode</span>
                                            {theme === 'light' && (
                                                <div className="absolute top-2 right-2 text-accent">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                            )}
                                        </button>

                                        {/* Dark Mode Box */}
                                        <button
                                            onClick={() => handleThemeChange('dark')}
                                            className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${theme === 'dark' ? 'border-accent bg-indigo-50/30 dark:bg-accent/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}>
                                            <div className="w-full h-24 bg-gray-900 rounded-lg mb-4 flex items-center justify-center border border-gray-800">
                                                <div className="w-16 h-12 bg-gray-800 rounded shadow-md flex flex-col p-2 space-y-1 border border-gray-700">
                                                    <div className="w-full h-2 bg-gray-700 rounded"></div>
                                                    <div className="w-2/3 h-2 bg-gray-700 rounded"></div>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">Dark Mode</span>
                                            {theme === 'dark' && (
                                                <div className="absolute top-2 right-2 text-accent">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                            )}
                                        </button>

                                        {/* System Mode Box */}
                                        <button
                                            onClick={() => handleThemeChange('system')}
                                            className={`relative flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${theme === 'system' ? 'border-accent bg-indigo-50/30 dark:bg-accent/10' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                }`}>
                                            <div className="w-full h-24 bg-gradient-to-tr from-gray-100 to-gray-800 rounded-lg mb-4 flex items-center justify-center border border-gray-300 dark:border-gray-600">
                                                <div className="w-16 h-12 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded shadow-sm flex flex-col p-2 space-y-1">
                                                    <div className="w-full h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                                    <div className="w-2/3 h-2 bg-gray-300 dark:bg-gray-600 rounded"></div>
                                                </div>
                                            </div>
                                            <span className="font-medium text-gray-900 dark:text-white">System Preference</span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">Matches your OS setting</p>
                                            {theme === 'system' && (
                                                <div className="absolute top-2 right-2 text-accent">
                                                    <CheckCircle className="w-5 h-5" />
                                                </div>
                                            )}
                                        </button>

                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'account' && (
                            <div className="bg-white dark:bg-primary rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Account Preferences</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure your region, language, and localization settings.</p>
                                </div>
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                                            <select
                                                value={settings?.language || 'en'}
                                                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                                                disabled={isSaving}
                                                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-accent focus:ring-accent sm:text-sm px-4 py-2"
                                            >
                                                <option value="en">English (US)</option>
                                                <option value="es">Español</option>
                                                <option value="fr">Français</option>
                                                <option value="de">Deutsch</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timezone</label>
                                            <select
                                                value={settings?.timezone || 'UTC'}
                                                onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                                                disabled={isSaving}
                                                className="block w-full rounded-md border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:border-accent focus:ring-accent sm:text-sm px-4 py-2"
                                            >
                                                <option value="UTC">UTC (Universal Coordinated Time)</option>
                                                <option value="America/New_York">America/New_York (EST)</option>
                                                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                                                <option value="Europe/London">Europe/London (GMT)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-white dark:bg-primary rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Control how and when you receive alerts.</p>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Receive daily summaries and interview alerts via email.</p>
                                        </div>
                                        <button
                                            onClick={() => handlePreferenceChange('email_notifications', !settings?.email_notifications)}
                                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${settings?.email_notifications ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-700'
                                                }`}>
                                            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.email_notifications ? 'translate-x-5' : 'translate-x-0'
                                                }`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="bg-white dark:bg-primary rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors">
                                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Security & Access</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your passwords and active sessions.</p>
                                </div>
                                <div className="p-6">
                                    <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        Change Password
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
