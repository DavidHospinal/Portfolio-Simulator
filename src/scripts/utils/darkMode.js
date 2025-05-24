// Dark mode functionality
export function initializeDarkMode() {
    try {
        console.log('Inicializando modo oscuro...');
        
        // Verificar si el elemento del botón existe
        const darkModeToggle = document.getElementById('darkModeToggle');
        if (!darkModeToggle) {
            console.warn('No se encontró el botón de alternar modo oscuro');
            return false;
        }
        
        // Verificar soporte para matchMedia
        if (!window.matchMedia) {
            console.warn('matchMedia no es compatible con este navegador');
            return false;
        }
        
        const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
        
        // Función para aplicar el tema
        const applyTheme = (isDark) => {
            try {
                const html = document.documentElement;
                if (isDark) {
                    html.classList.add('dark');
                    darkModeToggle.innerHTML = '☀️';
                    darkModeToggle.setAttribute('aria-label', 'Cambiar a modo claro');
                } else {
                    html.classList.remove('dark');
                    darkModeToggle.innerHTML = '🌙';
                    darkModeToggle.setAttribute('aria-label', 'Cambiar a modo oscuro');
                }
                return true;
            } catch (error) {
                console.error('Error al aplicar el tema:', error);
                return false;
            }
        };
        
        // Obtener preferencia almacenada o usar la preferencia del sistema
        let theme;
        try {
            theme = localStorage.getItem('theme');
        } catch (error) {
            console.warn('No se pudo acceder a localStorage:', error);
        }
        
        const systemDark = prefersDarkScheme.matches;
        const isDark = theme === 'dark' || (!theme && systemDark);
        
        // Aplicar el tema inicial
        if (!applyTheme(isDark)) {
            return false;
        }
        
        // Alternar entre modos oscuro y claro
        const toggleTheme = () => {
            try {
                const isDark = document.documentElement.classList.contains('dark');
                const newTheme = isDark ? 'light' : 'dark';
                
                if (applyTheme(!isDark)) {
                    try {
                        localStorage.setItem('theme', newTheme);
                    } catch (error) {
                        console.warn('No se pudo guardar la preferencia del tema:', error);
                    }
                }
            } catch (error) {
                console.error('Error al alternar el tema:', error);
            }
        };
        
        // Configurar el event listener
        darkModeToggle.addEventListener('click', toggleTheme);
        
        // Escuchar cambios en la preferencia del sistema
        const handleSystemThemeChange = (e) => {
            try {
                // Solo aplicar si no hay preferencia guardada
                if (!localStorage.getItem('theme')) {
                    applyTheme(e.matches);
                }
            } catch (error) {
                console.error('Error al manejar el cambio de tema del sistema:', error);
            }
        };
        
        // Usar addEventListener para compatibilidad con navegadores más antiguos
        if (prefersDarkScheme.addEventListener) {
            prefersDarkScheme.addEventListener('change', handleSystemThemeChange);
        } else if (prefersDarkScheme.addListener) {
            // Soporte para navegadores antiguos
            prefersDarkScheme.addListener(handleSystemThemeChange);
        }
        
        console.log('Modo oscuro inicializado correctamente');
        return true;
        
    } catch (error) {
        console.error('Error al inicializar el modo oscuro:', error);
        return false;
    }
}
