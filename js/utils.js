


export function isExtensionContextValid() {
    try {
        return !!(chrome && chrome.runtime && chrome.runtime.id);
    } catch (error) {
        return false;
    }
}


export function safeSendMessage(message, timeout = 5000) {
    return new Promise((resolve, reject) => {
        if (!isExtensionContextValid()) {
            reject(new Error('Extension context invalidated'));
            return;
        }

        const timer = setTimeout(() => {
            reject(new Error('Message timeout'));
        }, timeout);

        try {
            chrome.runtime.sendMessage(message, (response) => {
                clearTimeout(timer);
                
                if (chrome.runtime.lastError) {
                    reject(new Error(chrome.runtime.lastError.message));
                } else {
                    resolve(response);
                }
            });
        } catch (error) {
            clearTimeout(timer);
            reject(error);
        }
    });
}


export function formatTime(ms) {
    if (ms < 1000) return '0m';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
        return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${seconds}s`;
    }
}


export function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (format === 'short') {
        return d.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    } else if (format === 'long') {
        return d.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } else if (format === 'relative') {
        return getRelativeTime(d);
    }
    
    return d.toISOString().split('T')[0];
}


export function getRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);

    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'just now';
}


export function truncate(str, length = 50) {
    if (!str) return '';
    if (str.length <= length) return str;
    return str.substring(0, length - 3) + '...';
}


export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}


export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}


export function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}


export function getCategoryColor(category) {
    const colors = {
        'Programming': '#6366f1',
        'Data Science': '#8b5cf6',
        'Web Development': '#3b82f6',
        'Mathematics': '#06b6d4',
        'Science': '#10b981',
        'Language': '#f59e0b',
        'Business': '#ef4444',
        'Design': '#ec4899',
        'DevOps': '#14b8a6',
        'Security': '#f97316',
        'General Learning': '#64748b'
    };
    
    return colors[category] || colors['General Learning'];
}


export function getCategoryIcon(category) {
    const icons = {
        'Programming': '💻',
        'Data Science': '📊',
        'Web Development': '🌐',
        'Mathematics': '🧮',
        'Science': '🔬',
        'Language': '🗣️',
        'Business': '💼',
        'Design': '🎨',
        'DevOps': '⚙️',
        'Security': '🔒',
        'General Learning': '📚'
    };
    
    return icons[category] || icons['General Learning'];
}


export function groupBy(array, key) {
    return array.reduce((groups, item) => {
        const value = typeof key === 'function' ? key(item) : item[key];
        (groups[value] = groups[value] || []).push(item);
        return groups;
    }, {});
}


export function average(array, key = null) {
    if (array.length === 0) return 0;
    const sum = array.reduce((acc, item) => {
        const value = key ? item[key] : item;
        return acc + (value || 0);
    }, 0);
    return sum / array.length;
}


export function getDateRange(range) {
    const end = new Date();
    const start = new Date();
    
    switch (range) {
        case 'today':
            start.setHours(0, 0, 0, 0);
            break;
        case 'yesterday':
            start.setDate(start.getDate() - 1);
            start.setHours(0, 0, 0, 0);
            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59, 999);
            break;
        case 'week':
            start.setDate(start.getDate() - 7);
            break;
        case 'month':
            start.setMonth(start.getMonth() - 1);
            break;
        case 'year':
            start.setFullYear(start.getFullYear() - 1);
            break;
    }
    
    return { start, end };
}


export function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}


export function calculateSkillLevel(experience) {
    const levels = [
        { name: 'Beginner', min: 0, max: 100 },
        { name: 'Elementary', min: 100, max: 300 },
        { name: 'Intermediate', min: 300, max: 600 },
        { name: 'Advanced', min: 600, max: 1000 },
        { name: 'Expert', min: 1000, max: Infinity }
    ];
    
    for (const level of levels) {
        if (experience >= level.min && experience < level.max) {
            const progress = ((experience - level.min) / (level.max - level.min)) * 100;
            return {
                name: level.name,
                progress: Math.min(progress, 100),
                nextLevel: levels[levels.indexOf(level) + 1]?.name || 'Master'
            };
        }
    }
    
    return { name: 'Expert', progress: 100, nextLevel: 'Master' };
}


export function deepMerge(target, source) {
    const output = { ...target };
    
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (source[key] instanceof Object && key in target && target[key] instanceof Object) {
                output[key] = deepMerge(target[key], source[key]);
            } else {
                output[key] = source[key];
            }
        }
    }
    
    return output;
}
