// Módulo para manejar características avanzadas
import { exportToPDF, exportToCSV, exportToJSON, shareResults } from './exportUtils.js';
import { 
    portfolioPresets, 
    saveConfiguration, 
    loadConfiguration, 
    getSavedConfigurations,
    deleteConfiguration,
    saveSimulationHistory,
    getSimulationHistory,
    clearSimulationHistory,
    getComparisonData
} from './configUtils.js';
import { showError, showSuccess } from './eventListeners.js';

// Último resultado de simulación
let lastSimulationResults = null;
let lastSimulationParams = null;

// Estado de las características avanzadas
let advancedFeaturesInitialized = false;

// Verificar dependencias
const checkDependencies = () => {
    const missingDeps = [];
    
    if (typeof exportToPDF !== 'function') missingDeps.push('exportToPDF');
    if (typeof exportToCSV !== 'function') missingDeps.push('exportToCSV');
    if (typeof exportToJSON !== 'function') missingDeps.push('exportToJSON');
    if (typeof shareResults !== 'function') missingDeps.push('shareResults');
    
    return missingDeps;
};

/**
 * Inicializa las características avanzadas
 * @returns {boolean} True si la inicialización fue exitosa
 */
export function initAdvancedFeatures() {
    if (advancedFeaturesInitialized) {
        console.warn('Las características avanzadas ya han sido inicializadas');
        return true;
    }
    
    try {
        console.log('Inicializando características avanzadas...');
        
        // Verificar dependencias
        const missingDeps = checkDependencies();
        if (missingDeps.length > 0) {
            const errorMsg = `Faltan dependencias para características avanzadas: ${missingDeps.join(', ')}`;
            console.error(errorMsg);
            showError('Algunas características avanzadas podrían no funcionar correctamente');
        }
        
        // Configurar características
        setupToggleAdvancedFeatures();
        setupExportMenu();
        setupPresets();
        setupConfigSaving();
        setupHistoryViewer();
        setupComparisonTool();
        
        advancedFeaturesInitialized = true;
        console.log('Características avanzadas inicializadas correctamente');
        return true;
        
    } catch (error) {
        const errorMsg = `Error al inicializar características avanzadas: ${error.message}`;
        console.error(errorMsg, error);
        showError('No se pudieron cargar todas las características avanzadas');
        return false;
    }
}

/**
 * Configura el toggle para mostrar/ocultar características avanzadas
 * @returns {boolean} True si la configuración fue exitosa
 */
function setupToggleAdvancedFeatures() {
    try {
        const toggleButton = document.getElementById('toggleAdvancedFeatures');
        const advancedPanel = document.getElementById('advancedFeaturesPanel');
        
        if (!toggleButton || !advancedPanel) {
            console.warn('No se encontraron los elementos necesarios para el toggle de características avanzadas');
            return false;
        }
        
        // Configurar accesibilidad
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.setAttribute('aria-controls', 'advancedFeaturesPanel');
        
        // Función para actualizar el estado
        const updateToggleState = (isExpanded) => {
            if (isExpanded) {
                advancedPanel.classList.remove('hidden');
                toggleButton.textContent = 'Ocultar características avanzadas';
                toggleButton.setAttribute('aria-expanded', 'true');
                // Enfocar el primer elemento enfocable del panel
                const firstFocusable = advancedPanel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (firstFocusable) firstFocusable.focus();
            } else {
                advancedPanel.classList.add('hidden');
                toggleButton.textContent = 'Mostrar características avanzadas';
                toggleButton.setAttribute('aria-expanded', 'false');
            }
        };
        
        // Configurar evento de clic
        toggleButton.addEventListener('click', () => {
            const isHidden = advancedPanel.classList.contains('hidden');
            updateToggleState(isHidden);
        });
        
        // Cerrar al presionar Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !advancedPanel.classList.contains('hidden')) {
                updateToggleState(false);
                toggleButton.focus();
            }
        });
        
        // Estado inicial
        updateToggleState(false);
        
        return true;
        
    } catch (error) {
        console.error('Error al configurar el toggle de características avanzadas:', error);
        return false;
    }
}

/**
 * Configura el menú de exportación
 */
function setupExportMenu() {
    const exportButton = document.getElementById('exportButton');
    const exportMenu = document.getElementById('exportMenu');
    
    // Toggle del menú de exportación
    if (exportButton && exportMenu) {
        exportButton.addEventListener('click', () => {
            exportMenu.classList.toggle('hidden');
        });
        
        // Cerrar el menú al hacer clic fuera
        document.addEventListener('click', (event) => {
            if (!exportButton.contains(event.target) && !exportMenu.contains(event.target)) {
                exportMenu.classList.add('hidden');
            }
        });
    }
    
    // Botones de exportación
    setupExportButton('exportPDF', () => {
        if (lastSimulationResults && lastSimulationParams) {
            exportToPDF(lastSimulationResults, lastSimulationParams);
        } else {
            showNotification('No hay resultados para exportar', 'error');
        }
    });
    
    setupExportButton('exportCSV', () => {
        if (lastSimulationResults) {
            exportToCSV(lastSimulationResults);
        } else {
            showNotification('No hay resultados para exportar', 'error');
        }
    });
    
    setupExportButton('exportJSON', () => {
        if (lastSimulationResults && lastSimulationParams) {
            exportToJSON(lastSimulationResults, lastSimulationParams);
        } else {
            showNotification('No hay resultados para exportar', 'error');
        }
    });
    
    // Botones de compartir
    setupExportButton('shareTwitter', () => {
        if (lastSimulationResults) {
            shareResults('twitter', lastSimulationResults);
        } else {
            showNotification('No hay resultados para compartir', 'error');
        }
    });
    
    setupExportButton('shareLinkedIn', () => {
        if (lastSimulationResults) {
            shareResults('linkedin', lastSimulationResults);
        } else {
            showNotification('No hay resultados para compartir', 'error');
        }
    });
}

/**
 * Configura un botón de exportación
 */
function setupExportButton(id, callback) {
    const button = document.getElementById(id);
    if (button) {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('exportMenu').classList.add('hidden');
            callback();
        });
    }
}

/**
 * Configura los presets de portfolio
 */
function setupPresets() {
    const presetSelect = document.getElementById('portfolioPreset');
    
    if (presetSelect) {
        presetSelect.addEventListener('change', () => {
            const presetKey = presetSelect.value;
            
            if (presetKey && portfolioPresets[presetKey]) {
                const preset = portfolioPresets[presetKey];
                
                // Actualizar los campos con los valores del preset
                updateInputValue('meanX', preset.meanX);
                updateInputValue('stdX', preset.stdX);
                updateInputValue('meanY', preset.meanY);
                updateInputValue('stdY', preset.stdY);
                updateInputValue('weightA', preset.weightA);
                updateInputValue('weightB', preset.weightB);
                
                // Activar perspectiva financiera si es necesario
                const financialPerspective = document.getElementById('financialPerspective');
                if (financialPerspective && (preset.weightA + preset.weightB !== 1 || preset.weightA < 0 || preset.weightB < 0)) {
                    financialPerspective.checked = true;
                }
                
                // Actualizar los pesos
                const updateWeightsEvent = new Event('input');
                document.getElementById('weightA').dispatchEvent(updateWeightsEvent);
                
                showNotification(`Preset "${preset.name}" aplicado: ${preset.description}`, 'success');
            }
        });
    }
}

/**
 * Configura el guardado de configuraciones
 */
function setupConfigSaving() {
    const saveButton = document.getElementById('saveConfig');
    
    if (saveButton) {
        saveButton.addEventListener('click', () => {
            const configName = document.getElementById('configName').value.trim() || `Configuración ${new Date().toLocaleString()}`;
            
            const config = {
                meanX: getInputValue('meanX'),
                stdX: getInputValue('stdX'),
                meanY: getInputValue('meanY'),
                stdY: getInputValue('stdY'),
                weightA: getInputValue('weightA'),
                weightB: getInputValue('weightB'),
                numSims: getSelectValue('numSims'),
                financialPerspective: document.getElementById('financialPerspective')?.checked || false
            };
            
            if (saveConfiguration(config, configName)) {
                showNotification(`Configuración "${configName}" guardada correctamente`, 'success');
                document.getElementById('configName').value = '';
            } else {
                showNotification('Error al guardar la configuración', 'error');
            }
        });
    }
}

/**
 * Configura el visor de historial
 */
function setupHistoryViewer() {
    const historyButton = document.getElementById('showHistory');
    
    if (historyButton) {
        historyButton.addEventListener('click', () => {
            const history = getSimulationHistory();
            
            if (history.length === 0) {
                showNotification('No hay simulaciones en el historial', 'info');
                return;
            }
            
            // Crear modal para mostrar el historial
            const modal = createModal('Historial de Simulaciones', createHistoryContent(history));
            document.body.appendChild(modal);
            
            // Mostrar modal
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('.modal-content').classList.remove('scale-95');
            }, 10);
        });
    }
}

/**
 * Configura la herramienta de comparación
 */
function setupComparisonTool() {
    const compareButton = document.getElementById('compareScenarios');
    
    if (compareButton) {
        compareButton.addEventListener('click', () => {
            const history = getSimulationHistory();
            
            if (history.length < 2) {
                showNotification('Se necesitan al menos 2 simulaciones para comparar', 'info');
                return;
            }
            
            // Crear modal para seleccionar escenarios
            const modal = createModal('Comparar Escenarios', createComparisonSelector(history));
            document.body.appendChild(modal);
            
            // Mostrar modal
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('.modal-content').classList.remove('scale-95');
            }, 10);
        });
    }
}

/**
 * Crea el contenido del historial
 */
function createHistoryContent(history) {
    const container = document.createElement('div');
    container.className = 'space-y-4 max-h-96 overflow-y-auto';
    
    history.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'p-4 bg-white dark:bg-gray-800 rounded-lg shadow';
        
        const date = new Date(item.timestamp).toLocaleString();
        
        card.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <h4 class="font-medium">${date}</h4>
                    <p class="text-sm text-gray-500">Activo X: ${item.params.weightA.toFixed(2)}, Activo Y: ${item.params.weightB.toFixed(2)}</p>
                </div>
                <div class="flex space-x-2">
                    <button class="load-config-btn text-xs text-blue-500 hover:text-blue-700" data-index="${index}">Cargar</button>
                    <button class="delete-history-btn text-xs text-red-500 hover:text-red-700" data-id="${item.id}">Eliminar</button>
                </div>
            </div>
            <div class="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div>Retorno: <span class="font-medium">${(item.results.meanPortfolio * 100).toFixed(2)}%</span></div>
                <div>Riesgo: <span class="font-medium">${(item.results.stdPortfolio * 100).toFixed(2)}%</span></div>
                <div>Sharpe: <span class="font-medium">${item.results.sharpeRatio.toFixed(3)}</span></div>
                <div>VaR 95%: <span class="font-medium">${(item.results.var95 * 100).toFixed(2)}%</span></div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // Añadir botón para limpiar historial
    const clearButton = document.createElement('button');
    clearButton.className = 'btn btn-sm btn-outline w-full mt-4';
    clearButton.textContent = 'Limpiar Historial';
    clearButton.addEventListener('click', () => {
        if (clearSimulationHistory()) {
            showNotification('Historial limpiado correctamente', 'success');
            closeModal();
        } else {
            showNotification('Error al limpiar el historial', 'error');
        }
    });
    
    container.appendChild(clearButton);
    
    // Añadir event listeners para los botones
    setTimeout(() => {
        document.querySelectorAll('.load-config-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.getAttribute('data-index'));
                const item = history[index];
                
                // Cargar configuración
                updateInputValue('meanX', item.params.meanX);
                updateInputValue('stdX', item.params.stdX);
                updateInputValue('meanY', item.params.meanY);
                updateInputValue('stdY', item.params.stdY);
                updateInputValue('weightA', item.params.weightA);
                updateInputValue('weightB', item.params.weightB);
                
                // Actualizar perspectiva financiera
                const financialPerspective = document.getElementById('financialPerspective');
                if (financialPerspective) {
                    financialPerspective.checked = item.params.financialPerspective;
                }
                
                // Actualizar pesos
                const updateWeightsEvent = new Event('input');
                document.getElementById('weightA').dispatchEvent(updateWeightsEvent);
                
                showNotification('Configuración cargada correctamente', 'success');
                closeModal();
            });
        });
        
        document.querySelectorAll('.delete-history-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const historyItem = history.find(item => item.id === id);
                
                if (confirm(`¿Eliminar la simulación del ${new Date(historyItem.timestamp).toLocaleString()}?`)) {
                    const newHistory = history.filter(item => item.id !== id);
                    localStorage.setItem('simulationHistory', JSON.stringify(newHistory));
                    btn.closest('.p-4').remove();
                    
                    if (newHistory.length === 0) {
                        closeModal();
                        showNotification('Historial limpiado correctamente', 'success');
                    }
                }
            });
        });
    }, 100);
    
    return container;
}

/**
 * Crea el selector de comparación
 */
function createComparisonSelector(history) {
    const container = document.createElement('div');
    container.className = 'space-y-4';
    
    const instruction = document.createElement('p');
    instruction.className = 'text-sm text-gray-600 dark:text-gray-300';
    instruction.textContent = 'Selecciona hasta 3 escenarios para comparar:';
    container.appendChild(instruction);
    
    const scenariosContainer = document.createElement('div');
    scenariosContainer.className = 'max-h-72 overflow-y-auto space-y-2';
    
    history.forEach((item) => {
        const date = new Date(item.timestamp).toLocaleString();
        
        const checkbox = document.createElement('div');
        checkbox.className = 'flex items-center p-3 bg-white dark:bg-gray-800 rounded-lg';
        checkbox.innerHTML = `
            <input type="checkbox" class="scenario-checkbox mr-3" id="scenario-${item.id}" data-id="${item.id}">
            <label for="scenario-${item.id}" class="flex-grow">
                <div class="font-medium">${date}</div>
                <div class="text-xs text-gray-500">
                    Retorno: ${(item.results.meanPortfolio * 100).toFixed(2)}% | 
                    Riesgo: ${(item.results.stdPortfolio * 100).toFixed(2)}% | 
                    Sharpe: ${item.results.sharpeRatio.toFixed(3)}
                </div>
            </label>
        `;
        
        scenariosContainer.appendChild(checkbox);
    });
    
    container.appendChild(scenariosContainer);
    
    // Botón para comparar
    const compareButton = document.createElement('button');
    compareButton.className = 'btn btn-primary w-full mt-4';
    compareButton.textContent = 'Comparar Escenarios';
    compareButton.addEventListener('click', () => {
        const selectedIds = [];
        document.querySelectorAll('.scenario-checkbox:checked').forEach(checkbox => {
            selectedIds.push(checkbox.getAttribute('data-id'));
        });
        
        if (selectedIds.length < 2) {
            showNotification('Selecciona al menos 2 escenarios para comparar', 'error');
            return;
        }
        
        if (selectedIds.length > 3) {
            showNotification('Selecciona máximo 3 escenarios para comparar', 'error');
            return;
        }
        
        // Obtener datos para comparación
        const comparisonData = getComparisonData(selectedIds);
        
        // Cerrar modal actual
        closeModal();
        
        // Mostrar comparación
        showComparisonResults(comparisonData);
    });
    
    container.appendChild(compareButton);
    
    return container;
}

/**
 * Muestra los resultados de la comparación
 */
function showComparisonResults(data) {
    const modal = createModal('Comparación de Escenarios', createComparisonContent(data));
    document.body.appendChild(modal);
    
    // Mostrar modal
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.querySelector('.modal-content').classList.remove('scale-95');
    }, 10);
}

/**
 * Crea el contenido de la comparación
 */
function createComparisonContent(data) {
    const container = document.createElement('div');
    container.className = 'space-y-6';
    
    // Tabla de comparación
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200 dark:divide-gray-700';
    
    // Cabecera
    const thead = document.createElement('thead');
    thead.className = 'bg-gray-50 dark:bg-gray-800';
    
    const headerRow = document.createElement('tr');
    
    // Primera columna vacía
    const emptyHeader = document.createElement('th');
    emptyHeader.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider';
    headerRow.appendChild(emptyHeader);
    
    // Columnas para cada escenario
    data.forEach((scenario, index) => {
        const date = new Date(scenario.timestamp).toLocaleString();
        const th = document.createElement('th');
        th.className = 'px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider';
        th.innerHTML = `Escenario ${index + 1}<br><span class="font-normal">${date}</span>`;
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Cuerpo
    const tbody = document.createElement('tbody');
    tbody.className = 'bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700';
    
    // Filas para parámetros
    const paramRows = [
        { label: 'Activo X - Media', key: 'params.meanX', format: v => `${(v * 100).toFixed(2)}%` },
        { label: 'Activo X - Volatilidad', key: 'params.stdX', format: v => `${(v * 100).toFixed(2)}%` },
        { label: 'Activo Y - Media', key: 'params.meanY', format: v => `${(v * 100).toFixed(2)}%` },
        { label: 'Activo Y - Volatilidad', key: 'params.stdY', format: v => `${(v * 100).toFixed(2)}%` },
        { label: 'Peso Activo X', key: 'params.weightA', format: v => `${(v * 100).toFixed(2)}%` },
        { label: 'Peso Activo Y', key: 'params.weightB', format: v => `${(v * 100).toFixed(2)}%` }
    ];
    
    // Filas para resultados
    const resultRows = [
        { label: 'Retorno Esperado', key: 'results.meanPortfolio', format: v => `${(v * 100).toFixed(2)}%` },
        { label: 'Riesgo', key: 'results.stdPortfolio', format: v => `${(v * 100).toFixed(2)}%` },
        { label: 'Ratio de Sharpe', key: 'results.sharpeRatio', format: v => v.toFixed(3) },
        { label: 'VaR 95%', key: 'results.var95', format: v => `${(v * 100).toFixed(2)}%` }
    ];
    
    // Añadir filas de parámetros
    const paramsHeaderRow = document.createElement('tr');
    const paramsHeader = document.createElement('td');
    paramsHeader.className = 'px-6 py-3 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 colspan-4';
    paramsHeader.setAttribute('colspan', data.length + 1);
    paramsHeader.textContent = 'Parámetros';
    paramsHeaderRow.appendChild(paramsHeader);
    tbody.appendChild(paramsHeaderRow);
    
    paramRows.forEach(row => {
        const tr = document.createElement('tr');
        
        // Etiqueta
        const labelCell = document.createElement('td');
        labelCell.className = 'px-6 py-2 text-sm font-medium text-gray-900 dark:text-white';
        labelCell.textContent = row.label;
        tr.appendChild(labelCell);
        
        // Valores para cada escenario
        data.forEach(scenario => {
            const valueCell = document.createElement('td');
            valueCell.className = 'px-6 py-2 text-sm text-gray-500 dark:text-gray-300';
            
            // Obtener valor anidado
            const keys = row.key.split('.');
            let value = scenario;
            for (const key of keys) {
                value = value[key];
            }
            
            valueCell.textContent = row.format(value);
            tr.appendChild(valueCell);
        });
        
        tbody.appendChild(tr);
    });
    
    // Añadir filas de resultados
    const resultsHeaderRow = document.createElement('tr');
    const resultsHeader = document.createElement('td');
    resultsHeader.className = 'px-6 py-3 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 colspan-4';
    resultsHeader.setAttribute('colspan', data.length + 1);
    resultsHeader.textContent = 'Resultados';
    resultsHeaderRow.appendChild(resultsHeader);
    tbody.appendChild(resultsHeaderRow);
    
    resultRows.forEach(row => {
        const tr = document.createElement('tr');
        
        // Etiqueta
        const labelCell = document.createElement('td');
        labelCell.className = 'px-6 py-2 text-sm font-medium text-gray-900 dark:text-white';
        labelCell.textContent = row.label;
        tr.appendChild(labelCell);
        
        // Valores para cada escenario
        data.forEach(scenario => {
            const valueCell = document.createElement('td');
            valueCell.className = 'px-6 py-2 text-sm text-gray-500 dark:text-gray-300';
            
            // Obtener valor anidado
            const keys = row.key.split('.');
            let value = scenario;
            for (const key of keys) {
                value = value[key];
            }
            
            valueCell.textContent = row.format(value);
            tr.appendChild(valueCell);
        });
        
        tbody.appendChild(tr);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Botón para exportar comparación
    const exportButton = document.createElement('button');
    exportButton.className = 'btn btn-sm btn-outline w-full mt-4';
    exportButton.textContent = 'Exportar Comparación a PDF';
    exportButton.addEventListener('click', () => {
        // Implementar exportación de comparación
        showNotification('Exportación de comparación no implementada', 'info');
    });
    
    container.appendChild(exportButton);
    
    return container;
}

/**
 * Crea un modal
 */
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 opacity-0';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    
    modal.innerHTML = `
        <div class="modal-content bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden transform transition-transform duration-300 scale-95">
            <div class="flex justify-between items-center p-4 border-b dark:border-gray-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
                <button class="modal-close text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="p-4 overflow-y-auto" style="max-height: calc(90vh - 8rem);">
                <!-- Contenido del modal -->
            </div>
        </div>
    `;
    
    // Añadir contenido
    modal.querySelector('.overflow-y-auto').appendChild(content);
    
    // Cerrar modal al hacer clic en el botón de cerrar
    modal.querySelector('.modal-close').addEventListener('click', () => {
        closeModal(modal);
    });
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
    
    return modal;
}

/**
 * Cierra el modal
 */
function closeModal(specificModal = null) {
    const modals = specificModal ? [specificModal] : document.querySelectorAll('.fixed.inset-0.z-50');
    
    modals.forEach(modal => {
        modal.classList.add('opacity-0');
        modal.querySelector('.modal-content').classList.add('scale-95');
        
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
}

/**
 * Muestra una notificación
 */
function showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg transform transition-transform duration-300 translate-y-full z-50`;
    
    // Establecer color según tipo
    switch (type) {
        case 'success':
            notification.classList.add('bg-green-500', 'text-white');
            break;
        case 'error':
            notification.classList.add('bg-red-500', 'text-white');
            break;
        case 'warning':
            notification.classList.add('bg-yellow-500', 'text-white');
            break;
        default:
            notification.classList.add('bg-blue-500', 'text-white');
    }
    
    notification.innerHTML = `
        <div class="flex items-center">
            <span class="mr-2">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.classList.remove('translate-y-full');
    }, 10);
    
    // Ocultar notificación después de 3 segundos
    setTimeout(() => {
        notification.classList.add('translate-y-full');
        
        // Eliminar notificación después de la animación
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Actualiza el valor de un input
 */
function updateInputValue(id, value) {
    const input = document.getElementById(id);
    if (input) {
        input.value = value;
    }
}

/**
 * Obtiene el valor de un input
 */
function getInputValue(id) {
    const input = document.getElementById(id);
    return input ? parseFloat(input.value) : 0;
}

/**
 * Obtiene el valor de un select
 */
function getSelectValue(id) {
    const select = document.getElementById(id);
    return select ? select.value : '';
}

/**
 * Guarda los resultados de la última simulación
 * @param {Object} results - Resultados de la simulación
 * @param {Object} params - Parámetros de la simulación
 * @returns {boolean} True si se guardó correctamente
 */
export function saveLastSimulationResults(results, params) {
    try {
        if (!results || !params) {
            console.warn('No se proporcionaron resultados o parámetros para guardar');
            return false;
        }
        
        console.log('Guardando resultados de la simulación...');
        lastSimulationResults = { ...results };
        lastSimulationParams = { ...params };
        
        // Guardar en el historial
        const saved = saveSimulationHistory(results, params);
        
        if (saved) {
            console.log('Resultados de la simulación guardados correctamente');
            showSuccess('Simulación guardada en el historial');
        } else {
            console.warn('No se pudo guardar la simulación en el historial');
            showError('No se pudo guardar la simulación en el historial');
        }
        
        return saved;
        
    } catch (error) {
        const errorMsg = `Error al guardar los resultados de la simulación: ${error.message}`;
        console.error(errorMsg, error);
        showError('Error al guardar los resultados');
        return false;
    }
}

/**
 * Obtiene los resultados de la última simulación
 * @returns {Object|null} Objeto con los resultados o null si no hay
 */
export function getLastSimulationResults() {
    return lastSimulationResults ? { ...lastSimulationResults } : null;
}

/**
 * Obtiene los parámetros de la última simulación
 * @returns {Object|null} Objeto con los parámetros o null si no hay
 */
export function getLastSimulationParams() {
    return lastSimulationParams ? { ...lastSimulationParams } : null;
}

/**
 * Verifica si hay resultados de simulación disponibles
 * @returns {boolean} True si hay resultados disponibles
 */
export function hasSimulationResults() {
    return lastSimulationResults !== null && lastSimulationParams !== null;
}
