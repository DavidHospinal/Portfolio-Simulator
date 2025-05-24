// Archivo principal para inicializar la aplicación
import { runSimulation } from './simulation.js';
import { setupEventListeners } from './utils/eventListeners.js';
import { initAdvancedFeatures } from './utils/advancedFeatures.js';
import { initializeCharts } from './charts.js';

// Inicializar la aplicación cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    console.log('Inicializando Simulador de Portfolio de Inversiones...');
    
    try {
        // Inicializar gráficos
        initializeCharts();
        
        // Inicializar los event listeners básicos
        setupEventListeners();
        
        // Inicializar características avanzadas
        initAdvancedFeatures();
        
        console.log('Simulador inicializado correctamente');
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        alert('Error al inicializar la aplicación. Por favor, revisa la consola para más detalles.');
    }
});

// Exponer funciones globalmente para acceso desde la consola (solo para depuración)
window.portfolioSimulator = {
    runSimulation,
    initializeCharts
};
