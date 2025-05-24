// Módulo para manejar configuraciones y presets

// Definir presets de portfolios
export const portfolioPresets = {
    conservador: {
        name: 'Conservador',
        description: 'Bajo riesgo, bajo retorno',
        meanX: 0.05,  // 5% anual
        stdX: 0.10,   // 10% volatilidad
        meanY: 0.03,  // 3% anual
        stdY: 0.05,   // 5% volatilidad
        weightA: 0.3, // 30% en activo X
        weightB: 0.7  // 70% en activo Y
    },
    moderado: {
        name: 'Moderado',
        description: 'Equilibrio entre riesgo y retorno',
        meanX: 0.08,
        stdX: 0.20,
        meanY: 0.06,
        stdY: 0.15,
        weightA: 0.6,
        weightB: 0.4
    },
    agresivo: {
        name: 'Agresivo',
        description: 'Alto riesgo, mayores retornos potenciales',
        meanX: 0.12,
        stdX: 0.30,
        meanY: 0.09,
        stdY: 0.25,
        weightA: 0.8,
        weightB: 0.2
    },
    apalancado: {
        name: 'Apalancado',
        description: 'Uso de apalancamiento para amplificar retornos',
        meanX: 0.10,
        stdX: 0.25,
        meanY: 0.07,
        stdY: 0.20,
        weightA: 1.2,
        weightB: 0.3
    },
    cobertura: {
        name: 'Cobertura',
        description: 'Uso de posiciones cortas para reducir riesgo',
        meanX: 0.09,
        stdX: 0.22,
        meanY: 0.04,
        stdY: 0.18,
        weightA: 1.3,
        weightB: -0.3
    }
};

/**
 * Guarda la configuración actual en localStorage
 * @param {Object} config - Configuración a guardar
 * @param {string} name - Nombre de la configuración
 * @returns {boolean} - Éxito de la operación
 */
export function saveConfiguration(config, name) {
    try {
        // Obtener configuraciones guardadas
        const savedConfigs = getSavedConfigurations();
        
        // Añadir timestamp
        config.timestamp = new Date().toISOString();
        config.name = name || `Configuración ${Object.keys(savedConfigs).length + 1}`;
        
        // Guardar la nueva configuración
        const configId = `config_${Date.now()}`;
        savedConfigs[configId] = config;
        
        // Guardar en localStorage
        localStorage.setItem('portfolioConfigurations', JSON.stringify(savedConfigs));
        
        return true;
    } catch (error) {
        console.error('Error al guardar la configuración:', error);
        return false;
    }
}

/**
 * Obtiene todas las configuraciones guardadas
 * @returns {Object} - Configuraciones guardadas
 */
export function getSavedConfigurations() {
    try {
        const savedConfigs = localStorage.getItem('portfolioConfigurations');
        return savedConfigs ? JSON.parse(savedConfigs) : {};
    } catch (error) {
        console.error('Error al obtener configuraciones guardadas:', error);
        return {};
    }
}

/**
 * Carga una configuración guardada
 * @param {string} configId - ID de la configuración a cargar
 * @returns {Object|null} - Configuración cargada o null si no existe
 */
export function loadConfiguration(configId) {
    try {
        const savedConfigs = getSavedConfigurations();
        return savedConfigs[configId] || null;
    } catch (error) {
        console.error('Error al cargar la configuración:', error);
        return null;
    }
}

/**
 * Elimina una configuración guardada
 * @param {string} configId - ID de la configuración a eliminar
 * @returns {boolean} - Éxito de la operación
 */
export function deleteConfiguration(configId) {
    try {
        const savedConfigs = getSavedConfigurations();
        
        if (!savedConfigs[configId]) {
            return false;
        }
        
        delete savedConfigs[configId];
        localStorage.setItem('portfolioConfigurations', JSON.stringify(savedConfigs));
        
        return true;
    } catch (error) {
        console.error('Error al eliminar la configuración:', error);
        return false;
    }
}

/**
 * Guarda el historial de simulaciones
 * @param {Object} results - Resultados de la simulación
 * @param {Object} params - Parámetros de la simulación
 * @returns {boolean} - Éxito de la operación
 */
export function saveSimulationHistory(results, params) {
    try {
        // Obtener historial guardado
        const history = getSimulationHistory();
        
        // Crear entrada de historial
        const historyEntry = {
            id: `sim_${Date.now()}`,
            timestamp: new Date().toISOString(),
            params: params,
            results: {
                meanPortfolio: results.meanPortfolio,
                stdPortfolio: results.stdPortfolio,
                sharpeRatio: results.sharpeRatio,
                var95: results.var95,
                covXY: results.covXY
            }
        };
        
        // Añadir al historial
        history.unshift(historyEntry);
        
        // Limitar a 20 entradas para no saturar localStorage
        if (history.length > 20) {
            history.pop();
        }
        
        // Guardar en localStorage
        localStorage.setItem('simulationHistory', JSON.stringify(history));
        
        return true;
    } catch (error) {
        console.error('Error al guardar historial de simulación:', error);
        return false;
    }
}

/**
 * Obtiene el historial de simulaciones
 * @returns {Array} - Historial de simulaciones
 */
export function getSimulationHistory() {
    try {
        const history = localStorage.getItem('simulationHistory');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('Error al obtener historial de simulaciones:', error);
        return [];
    }
}

/**
 * Limpia el historial de simulaciones
 * @returns {boolean} - Éxito de la operación
 */
export function clearSimulationHistory() {
    try {
        localStorage.removeItem('simulationHistory');
        return true;
    } catch (error) {
        console.error('Error al limpiar historial de simulaciones:', error);
        return false;
    }
}

/**
 * Obtiene los datos para comparación de escenarios
 * @param {Array} simulationIds - IDs de las simulaciones a comparar
 * @returns {Object} - Datos para comparación
 */
export function getComparisonData(simulationIds) {
    try {
        const history = getSimulationHistory();
        const comparisonData = [];
        
        simulationIds.forEach(id => {
            const simulation = history.find(item => item.id === id);
            if (simulation) {
                comparisonData.push(simulation);
            }
        });
        
        return comparisonData;
    } catch (error) {
        console.error('Error al obtener datos para comparación:', error);
        return [];
    }
}
