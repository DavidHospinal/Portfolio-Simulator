// Constantes
const DEFAULT_LOADING_TEXT = 'Procesando...';
const DEFAULT_BUTTON_TEXT = 'Ejecutar Simulación';

// Importar la función de simulación
import { runSimulation } from '../simulation.js';

/**
 * Muestra u oculta el estado de carga en un botón
 * @param {HTMLElement} button - Elemento del botón
 * @param {boolean} isLoading - Indica si se debe mostrar el estado de carga
 * @param {string} [loadingText] - Texto opcional para mostrar durante la carga
 * @returns {boolean} True si la operación fue exitosa
 */
export function setButtonLoading(button, isLoading, loadingText = DEFAULT_LOADING_TEXT) {
    if (!button || !(button instanceof HTMLElement)) {
        console.error('setButtonLoading: Se requiere un elemento de botón válido');
        return false;
    }
    
    try {
        // Verificar si el estado está cambiando
        const currentState = button.hasAttribute('data-loading') && 
                           button.getAttribute('data-loading') === 'true';
        
        if (isLoading === currentState) {
            return true; // No hacer nada si el estado es el mismo
        }
        
        if (isLoading) {
            // Guardar el contenido original solo si no está ya en estado de carga
            if (!button.hasAttribute('data-original-html')) {
                button.setAttribute('data-original-html', button.innerHTML);
            }
            
            // Crear elemento de carga
            const spinnerHTML = `
                <svg class="animate-spin -ml-1 mr-2 h-5 w-5 text-white inline-block" 
                     xmlns="http://www.w3.org/2000/svg" 
                     fill="none" 
                     viewBox="0 0 24 24"
                     aria-hidden="true">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ${loadingText}
            `;
            
            // Aplicar estado de carga
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            button.setAttribute('data-loading', 'true');
            button.innerHTML = spinnerHTML;
            
        } else {
            // Restaurar estado normal
            const originalHTML = button.getAttribute('data-original-html') || DEFAULT_BUTTON_TEXT;
            button.disabled = false;
            button.removeAttribute('aria-busy');
            button.removeAttribute('data-loading');
            button.removeAttribute('data-original-html');
            button.innerHTML = originalHTML;
        }
        
        return true;
        
    } catch (error) {
        console.error('Error en setButtonLoading:', error);
        
        // Asegurarse de que el botón no quede en un estado inconsistente
        if (button && button instanceof HTMLElement) {
            button.disabled = false;
            button.removeAttribute('aria-busy');
            button.removeAttribute('data-loading');
            button.textContent = DEFAULT_BUTTON_TEXT;
        }
        
        return false;
    }
}

/**
 * Muestra un mensaje de éxito en la interfaz
 * @param {string} message - Mensaje a mostrar
 * @param {number} [duration=3000] - Duración en milisegundos que se mostrará el mensaje
 * @returns {boolean} True si se mostró el mensaje correctamente
 */
export function showSuccess(message, duration = 3000) {
    if (!message || typeof message !== 'string') {
        console.warn('showSuccess: Se requiere un mensaje de texto');
        return false;
    }
    
    console.log('Éxito:', message);
    
    try {
        let successElement = document.getElementById('success-message');
        
        // Crear el elemento si no existe
        if (!successElement) {
            const container = document.createElement('div');
            container.id = 'success-message';
            container.className = 'fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg transform transition-all duration-300 ease-in-out opacity-0 translate-y-4';
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(successElement = container);
        }
        
        // Ocultar otros mensajes
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.classList.remove('opacity-100', 'translate-y-0');
            errorElement.classList.add('opacity-0', 'translate-y-4');
        }
        
        // Configurar y mostrar el mensaje de éxito
        successElement.textContent = message;
        successElement.className = 'fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded-lg shadow-lg transform transition-all duration-300 ease-in-out opacity-100 translate-y-0 z-50';
        successElement.setAttribute('aria-hidden', 'false');
        
        // Configurar temporizador para ocultar el mensaje
        if (duration > 0) {
            // Limpiar cualquier temporizador existente
            if (window.successMessageTimeout) {
                clearTimeout(window.successMessageTimeout);
            }
            
            window.successMessageTimeout = setTimeout(() => {
                if (successElement) {
                    successElement.classList.remove('opacity-100', 'translate-y-0');
                    successElement.classList.add('opacity-0', 'translate-y-4');
                    successElement.setAttribute('aria-hidden', 'true');
                }
            }, duration);
        }
        
        return true;
        
    } catch (error) {
        console.error('Error en showSuccess:', error);
        return false;
    }
}

// Función para mostrar errores en la interfaz
export function showError(message, duration = 5000) {
    // Manejar diferentes tipos de entrada para el mensaje
    const errorMessage = message instanceof Error ? 
        `${message.message || 'Error desconocido'}` : 
        String(message || 'Ha ocurrido un error inesperado');
    
    console.error('Error:', errorMessage);
    
    try {
        let errorElement = document.getElementById('error-message');
        
        // Crear el elemento si no existe
        if (!errorElement) {
            const container = document.createElement('div');
            container.id = 'error-message';
            container.className = 'fixed bottom-4 right-4 p-4 bg-red-500 text-white rounded-lg shadow-lg transform transition-all duration-300 ease-in-out opacity-0 translate-y-4';
            container.setAttribute('role', 'alert');
            container.setAttribute('aria-live', 'assertive');
            
            // Añadir botón de cierre
            const closeButton = document.createElement('button');
            closeButton.className = 'absolute top-1 right-1 p-1 text-white hover:text-gray-200';
            closeButton.innerHTML = '&times;';
            closeButton.setAttribute('aria-label', 'Cerrar mensaje');
            closeButton.addEventListener('click', () => {
                if (errorElement) {
                    errorElement.classList.remove('opacity-100', 'translate-y-0');
                    errorElement.classList.add('opacity-0', 'translate-y-4');
                    errorElement.setAttribute('aria-hidden', 'true');
                }
            });
            
            container.appendChild(closeButton);
            document.body.appendChild(container);
            errorElement = container;
        }
        
        // Ocultar otros mensajes
        const successElement = document.getElementById('success-message');
        if (successElement) {
            successElement.classList.remove('opacity-100', 'translate-y-0');
            successElement.classList.add('opacity-0', 'translate-y-4');
        }
        
        // Configurar y mostrar el mensaje de error
        const messageElement = document.createElement('div');
        messageElement.className = 'pr-4';
        messageElement.textContent = errorMessage;
        
        // Limpiar contenido anterior (excepto el botón de cierre)
        while (errorElement.firstChild) {
            errorElement.removeChild(errorElement.firstChild);
        }
        
        // Añadir botón de cierre de nuevo
        const closeButton = document.createElement('button');
        closeButton.className = 'absolute top-1 right-1 p-1 text-white hover:text-gray-200';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'Cerrar mensaje');
        closeButton.addEventListener('click', () => {
            errorElement.classList.remove('opacity-100', 'translate-y-0');
            errorElement.classList.add('opacity-0', 'translate-y-4');
            errorElement.setAttribute('aria-hidden', 'true');
        });
        
        errorElement.appendChild(messageElement);
        errorElement.appendChild(closeButton);
        
        // Aplicar estilos para mostrar el mensaje
        errorElement.className = 'fixed bottom-4 right-4 p-4 pr-8 bg-red-500 text-white rounded-lg shadow-lg transform transition-all duration-300 ease-in-out opacity-100 translate-y-0 z-50 max-w-md';
        errorElement.setAttribute('aria-hidden', 'false');
        
        // Configurar temporizador para ocultar el mensaje
        if (duration > 0) {
            // Limpiar cualquier temporizador existente
            if (window.errorMessageTimeout) {
                clearTimeout(window.errorMessageTimeout);
            }
            
            window.errorMessageTimeout = setTimeout(() => {
                if (errorElement) {
                    errorElement.classList.remove('opacity-100', 'translate-y-0');
                    errorElement.classList.add('opacity-0', 'translate-y-4');
                    errorElement.setAttribute('aria-hidden', 'true');
                }
            }, duration);
        }
        
        return true;
        
    } catch (error) {
        console.error('Error al mostrar el mensaje de error:', error);
        return false;
    }
}

// Constantes para pesos por defecto
const DEFAULT_WEIGHT_A = 0.6;
const DEFAULT_WEIGHT_B = 0.4;

/**
 * Actualiza los pesos del portafolio y muestra información relacionada
 * @returns {{valueA: number, valueB: number}} Objeto con los valores actualizados de los pesos
 */
export function updateWeights() {
    // Obtener referencias a los elementos del DOM
    const elements = {
        weightA: document.getElementById('weightA'),
        weightB: document.getElementById('weightB'),
        weightAValue: document.getElementById('weightAValue'),
        weightBValue: document.getElementById('weightBValue'),
        financialInfo: document.getElementById('financialInfo'),
        financialPerspective: document.getElementById('financialPerspective')
    };
    
    try {
        // Validar elementos requeridos
        const requiredElements = ['weightA', 'weightB', 'weightAValue', 'weightBValue'];
        const missingElements = requiredElements.filter(id => !elements[id]);
        
        if (missingElements.length > 0) {
            console.error('No se encontraron los siguientes elementos:', missingElements.join(', '));
            return { valueA: DEFAULT_WEIGHT_A, valueB: DEFAULT_WEIGHT_B };
        }
        
        // Obtener y validar valores actuales
        let valueA = parseFloat(elements.weightA.value);
        let valueB = parseFloat(elements.weightB.value);
        
        // Validar valores numéricos
        valueA = isNaN(valueA) ? DEFAULT_WEIGHT_A : Math.max(-1, Math.min(2, valueA)); // Limitar entre -1 y 2
        valueB = isNaN(valueB) ? DEFAULT_WEIGHT_B : Math.max(-1, Math.min(2, valueB)); // Limitar entre -1 y 2
        
        // Actualizar los valores mostrados con formato
        const formatPercentage = (value) => {
            const percentage = Math.round(value * 100);
            return `${percentage > 0 ? '+' : ''}${percentage}%`; // Mostrar signo para valores positivos
        };
        
        elements.weightAValue.textContent = formatPercentage(valueA);
        elements.weightBValue.textContent = formatPercentage(valueB);
        
        // Aplicar clases de estilo según el valor
        const updateValueStyle = (element, value) => {
            element.className = 'text-sm font-medium';
            if (value < 0) {
                element.classList.add('text-red-600', 'dark:text-red-400');
            } else if (value > 1) {
                element.classList.add('text-purple-600', 'dark:text-purple-400');
            } else {
                element.classList.add('text-green-600', 'dark:text-green-400');
            }
        };
        
        updateValueStyle(elements.weightAValue, valueA);
        updateValueStyle(elements.weightBValue, valueB);
        
        // Manejar la perspectiva financiera
        const financialPerspective = elements.financialPerspective?.checked || false;
        
        if (financialPerspective) {
            // Mostrar información financiera
            if (elements.financialInfo) {
                elements.financialInfo.classList.remove('hidden');
            }
            
            // Calcular la suma de pesos
            const sum = valueA + valueB;
            let message = '';
            let messageClass = '';
            
            if (sum === 1.0) {
                message = 'Portfolio tradicional (ej: 60% acciones + 40% bonos)';
                messageClass = 'text-green-600 dark:text-green-400';
            } else if (sum < 1.0) {
                message = `Portfolio + efectivo (${Math.round(sum * 100)}% inversiones + ${Math.round((1 - sum) * 100)}% cash)`;
                messageClass = 'text-blue-600 dark:text-blue-400';
            } else if (sum > 1.0) {
                message = `Portfolio apalancado (${Math.round(sum * 100)}% inversiones, incluyendo ${Math.round((sum - 1) * 100)}% de apalancamiento)`;
                messageClass = 'text-purple-600 dark:text-purple-400';
            }
            
            // Mostrar mensaje de interpretación
            let interpretationElement = document.getElementById('weightInterpretation');
            if (!interpretationElement) {
                interpretationElement = document.createElement('div');
                interpretationElement.id = 'weightInterpretation';
                interpretationElement.className = 'mt-2 text-sm font-medium';
                elements.weightB.parentNode.insertBefore(interpretationElement, elements.weightB.nextSibling);
            }
            interpretationElement.className = `mt-2 text-sm font-medium ${messageClass}`;
            interpretationElement.textContent = message;
            
            // Resaltar si hay posiciones cortas
            if (valueA < 0 || valueB < 0) {
                const shortMessage = '⚠️ Advertencia: Posiciones cortas detectadas (pesos negativos)';
                if (!document.getElementById('shortPositionWarning')) {
                    const warningElement = document.createElement('div');
                    warningElement.id = 'shortPositionWarning';
                    warningElement.className = 'mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-sm rounded';
                    warningElement.textContent = shortMessage;
                    interpretationElement.parentNode.insertBefore(warningElement, interpretationElement.nextSibling);
                }
            } else {
                const warningElement = document.getElementById('shortPositionWarning');
                if (warningElement) warningElement.remove();
            }
        } else {
            // Ocultar información financiera si no está activada
            if (elements.financialInfo) elements.financialInfo.classList.add('hidden');
            const interpretationElement = document.getElementById('weightInterpretation');
            if (interpretationElement) interpretationElement.remove();
            const warningElement = document.getElementById('shortPositionWarning');
            if (warningElement) warningElement.remove();
            
            // Si la perspectiva financiera está desactivada, forzar que sumen 1
            const total = valueA + valueB;
            if (total > 0) {
                const ratio = 1 / total;
                valueA = valueA * ratio;
                valueB = valueB * ratio;
                
                // Actualizar los valores en los inputs
                elements.weightA.value = valueA.toFixed(2);
                elements.weightB.value = valueB.toFixed(2);
                elements.weightAValue.textContent = formatPercentage(valueA);
                elements.weightBValue.textContent = formatPercentage(valueB);
                
                // Actualizar estilos después de normalizar
                updateValueStyle(elements.weightAValue, valueA);
                updateValueStyle(elements.weightBValue, valueB);
            }
        }
        
        return { valueA, valueB };
        
    } catch (error) {
        console.error('Error al actualizar pesos:', error);
        showError('Error al actualizar los pesos del portafolio');
        return { valueA: DEFAULT_WEIGHT_A, valueB: DEFAULT_WEIGHT_B };
    }
}

// Función para alternar el modo oscuro
function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
}

/**
 * Configura los controladores de eventos para la aplicación
 * @returns {boolean} True si la configuración fue exitosa
 */
export function setupEventListeners() {
    console.log('Inicializando configuración de event listeners...');
    
    try {
        // Elementos requeridos para la funcionalidad básica
        const requiredElements = {
            runSimulation: 'Botón de ejecución de simulación',
            darkModeToggle: 'Botón de alternar modo oscuro',
            weightA: 'Control de peso A',
            weightB: 'Control de peso B'
        };
        
        // Verificar elementos faltantes
        const missingElements = Object.entries(requiredElements)
            .filter(([id]) => !document.getElementById(id))
            .map(([_, name]) => name);
        
        if (missingElements.length > 0) {
            const errorMsg = `Elementos requeridos no encontrados: ${missingElements.join(', ')}`;
            console.error(errorMsg);
            showError('Algunas funciones podrían no estar disponibles debido a elementos faltantes en la interfaz.');
        }
        
        // Configurar el botón de ejecución
        setupRunButton();
        
        // Configurar controles de peso
        setupWeightControls();
        
        // Configurar el botón de alternar modo oscuro
        setupDarkModeToggle();
        
        // Configurar controles adicionales
        setupAdditionalControls();
        
        console.log('Configuración de event listeners completada');
        return true;
        
    } catch (error) {
        const errorMsg = `Error al configurar los event listeners: ${error.message}`;
        console.error(errorMsg, error);
        showError('Error al configurar la aplicación. Por favor, recarga la página.');
        return false;
    }
}

/**
 * Configura el botón de ejecución de la simulación
 */
function setupRunButton() {
    const runButton = document.getElementById('runSimulation');
    if (!runButton) {
        console.warn('No se encontró el botón de ejecución');
        return;
    }
    
    runButton.addEventListener('click', async () => {
        try {
            // Mostrar estado de carga
            setButtonLoading(runButton, true, 'Ejecutando simulación...');
            
            // Ejecutar la simulación si está disponible
            if (typeof window.runSimulation === 'function') {
                console.log('Iniciando simulación...');
                await window.runSimulation();
                showSuccess('Simulación completada correctamente');
            } else {
                throw new Error('La función de simulación no está disponible');
            }
            
        } catch (error) {
            console.error('Error en la simulación:', error);
            showError(`Error al ejecutar la simulación: ${error.message}`);
        } finally {
            // Restaurar el botón
            setButtonLoading(runButton, false);
        }
    });
    
    console.log('Botón de ejecución configurado correctamente');
}

/**
 * Configura los controles de peso del portafolio
 */
function setupWeightControls() {
    const weightA = document.getElementById('weightA');
    const weightB = document.getElementById('weightB');
    
    if (!weightA || !weightB) {
        console.warn('No se encontraron los controles de peso');
        return;
    }
    
    // Función para manejar cambios en los controles de peso
    const handleWeightChange = () => {
        try {
            updateWeights();
        } catch (error) {
            console.error('Error al actualizar pesos:', error);
            showError('Error al actualizar los pesos del portafolio');
        }
    };
    
    // Configurar event listeners para los controles de peso
    weightA.addEventListener('input', handleWeightChange);
    weightB.addEventListener('input', handleWeightChange);
    
    // Actualizar pesos iniciales
    handleWeightChange();
    
    console.log('Controles de peso configurados correctamente');
}

/**
 * Configura el botón de alternar modo oscuro
 */
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) {
        console.warn('No se encontró el botón de modo oscuro');
        return;
    }
    
    // Función para actualizar el estado del modo oscuro
    const updateDarkModeState = (isDark) => {
        try {
            if (isDark) {
                document.documentElement.classList.add('dark');
                localStorage.setItem('darkMode', 'true');
            } else {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('darkMode', 'false');
            }
        } catch (error) {
            console.error('Error al actualizar el modo oscuro:', error);
        }
    };
    
    // Configurar evento de clic
    darkModeToggle.addEventListener('click', () => {
        const isDark = !document.documentElement.classList.contains('dark');
        updateDarkModeState(isDark);
    });
    
    // Verificar preferencia guardada o del sistema
    try {
        const savedPreference = localStorage.getItem('darkMode');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (savedPreference === null) {
            // Usar preferencia del sistema si no hay preferencia guardada
            updateDarkModeState(systemPrefersDark);
        } else {
            // Usar preferencia guardada
            updateDarkModeState(savedPreference === 'true');
        }
    } catch (error) {
        console.error('Error al cargar la preferencia de modo oscuro:', error);
        // Usar modo claro como valor predeterminado en caso de error
        updateDarkModeState(false);
    }
    
    console.log('Control de modo oscuro configurado correctamente');
}

/**
 * Configura controles adicionales de la aplicación
 */
function setupAdditionalControls() {
    // Configurar botones de exportación si existen
    setupExportButtons();
    
    // Configurar otros controles según sea necesario
    // ...
}

/**
 * Configura los botones de exportación
 */
function setupExportButtons() {
    const exportPdf = document.getElementById('exportPdf');
    const exportCsv = document.getElementById('exportCsv');
    
    if (exportPdf) {
        exportPdf.addEventListener('click', () => {
            try {
                if (typeof window.exportToPDF === 'function') {
                    window.exportToPDF();
                    showSuccess('Exportando a PDF...');
                } else {
                    throw new Error('La función de exportación a PDF no está disponible');
                }
            } catch (error) {
                console.error('Error al exportar a PDF:', error);
                showError('No se pudo generar el archivo PDF');
            }
        });
    }
    
    if (exportCsv) {
        exportCsv.addEventListener('click', () => {
            try {
                if (typeof window.exportToCSV === 'function') {
                    window.exportToCSV();
                    showSuccess('Exportando a CSV...');
                } else {
                    throw new Error('La función de exportación a CSV no está disponible');
                }
            } catch (error) {
                console.error('Error al exportar a CSV:', error);
                showError('No se pudo generar el archivo CSV');
            }
        });
    }
    
    if (exportPdf || exportCsv) {
        console.log('Botones de exportación configurados correctamente');
    }
}

// Alias para compatibilidad con código existente
export function initEventListeners() {
    // Referencias a los elementos del DOM
    const runButton = document.getElementById('runSimulation');
    const weightAInput = document.getElementById('weightA');
    const weightBInput = document.getElementById('weightB');
    const financialPerspectiveCheckbox = document.getElementById('financialPerspective');
    
    let isSimulationRunning = false;

    // Función para ejecutar la simulación
    const executeSimulation = async () => {
        // Evitar múltiples ejecuciones simultáneas
        if (isSimulationRunning) {
            console.log('Simulación ya en progreso, ignorando solicitud');
            return;
        }
        
        // Configurar estado inicial
        isSimulationRunning = true;
        setButtonLoading(runButton, true);
        
        // Configurar un timeout de seguridad para evitar bloqueos
        const safetyTimeout = setTimeout(() => {
            if (isSimulationRunning) {
                console.warn('Timeout de seguridad alcanzado, forzando finalización');
                isSimulationRunning = false;
                setButtonLoading(runButton, false);
                showError('La simulación tomó demasiado tiempo. Por favor, intente nuevamente.');
            }
        }, 30000); // 30 segundos de timeout
        
        try {
            // Actualizar pesos antes de la simulación
            updateWeights();
            
            // Ejecutar la simulación directamente
            await runSimulation();
            
        } catch (error) {
            console.error('Error en la simulación:', error);
            showError(`Error al ejecutar la simulación: ${error.message}`);
        } finally {
            // Limpiar el timeout y restaurar el estado
            clearTimeout(safetyTimeout);
            isSimulationRunning = false;
            setButtonLoading(runButton, false);
        }
    }

    // Configurar eventos
    if (runButton) {
        runButton.addEventListener('click', executeSimulation);
    }
    
    if (weightAInput && weightBInput) {
        // Configurar controles deslizantes
        weightAInput.min = -1;
        weightAInput.max = 2;
        weightAInput.step = 0.1;
        
        weightBInput.min = -1;
        weightBInput.max = 2;
        weightBInput.step = 0.1;
        
        // Actualizar pesos cuando cambian los controles
        weightAInput.addEventListener('input', updateWeights);
        weightBInput.addEventListener('input', updateWeights);
    }
    
    // Configurar el checkbox de perspectiva financiera
    if (financialPerspectiveCheckbox) {
        financialPerspectiveCheckbox.addEventListener('change', updateWeights);
    }
    
    // Inicializar pesos
    updateWeights();
}
