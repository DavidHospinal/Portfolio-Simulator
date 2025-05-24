// Importar módulos necesarios
import { initializeDarkMode } from './utils/darkMode.js';
import { setupEventListeners, showError, showSuccess } from './utils/eventListeners.js';
import { initializeCharts } from './charts.js';
import { runSimulation } from './simulation.js';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Chart from 'chart.js/auto';

// Hacer que Chart.js esté disponible globalmente
window.Chart = Chart;
window.jsPDF = jsPDF;
// Hacer que runSimulation esté disponible globalmente
window.runSimulation = runSimulation;

console.log('main.js cargado correctamente');

// Verificar dependencias críticas
const checkDependencies = () => {
    const missingDeps = [];
    
    if (typeof Chart === 'undefined') {
        missingDeps.push('Chart.js');
    }
    
    if (typeof jsPDF === 'undefined') {
        missingDeps.push('jsPDF');
    }
    
    return missingDeps;
};

// Función para inicializar la aplicación
async function initApp() {
    console.log('Inicializando aplicación...');
    showSuccess('Iniciando aplicación...', 2000);
    
    try {
        // Verificar dependencias
        const missingDeps = checkDependencies();
        if (missingDeps.length > 0) {
            const errorMsg = `Faltan dependencias: ${missingDeps.join(', ')}. Recarga la página.`;
            console.error(errorMsg);
            showError(errorMsg);
            return;
        }
        
        // Inicializar modo oscuro
        if (typeof initializeDarkMode === 'function') {
            initializeDarkMode();
        } else {
            console.warn('initializeDarkMode no es una función');
        }
        
        // Configurar manejadores de eventos
        if (typeof setupEventListeners === 'function') {
            setupEventListeners();
        } else {
            console.error('setupEventListeners no es una función');
            showError('Error al configurar los manejadores de eventos');
        }
        
        // Inicializar gráficos
        if (typeof initializeCharts === 'function') {
            try {
                window.distributionChart = initializeCharts();
                console.log('Gráficos inicializados correctamente');
            } catch (chartError) {
                const errorMsg = `Error al inicializar gráficos: ${chartError.message}`;
                console.error(errorMsg, chartError);
                showError(errorMsg);
            }
        } else {
            const errorMsg = 'La función initializeCharts no está disponible';
            console.error(errorMsg);
            showError(errorMsg);
        }
        
        console.log('Aplicación inicializada correctamente');
        showSuccess('Aplicación lista', 2000);
    } catch (error) {
        const errorMsg = `Error al inicializar la aplicación: ${error.message}`;
        console.error(errorMsg, error);
        showError(errorMsg);
    }
}

// Función para verificar si el DOM está listo
const domReady = (callback) => {
    if (document.readyState !== 'loading') {
        callback();
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
};

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente cargado, iniciando aplicación...');
    initApp();
});

// Verificar dependencias en consola
console.log('Dependencias cargadas:', {
    'Chart.js': typeof Chart !== 'undefined',
    'jsPDF': typeof jsPDF !== 'undefined',
    'runSimulation': typeof runSimulation === 'function'
});
