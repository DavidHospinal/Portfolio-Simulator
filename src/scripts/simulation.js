console.log('Cargando módulo de simulación...');

// Importar funciones necesarias
import { setButtonLoading, showError, showSuccess } from './utils/eventListeners.js';
import { saveLastSimulationResults } from './utils/advancedFeatures.js';
import Chart from 'chart.js/auto';

// Hacer que Chart.js esté disponible globalmente
window.Chart = Chart;

// Variable para almacenar la instancia del gráfico
let distributionChart = null;

// Verificar dependencias
if (typeof Chart === 'undefined') {
    console.error('Error: Chart.js no está cargado correctamente');
    showError('Error: No se pudo cargar la biblioteca de gráficos. Por favor, recarga la página.');
}

// Función para generar números aleatorios con distribución normal (Box-Muller)
function generateNormalRandom(mean = 0, std = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * std + mean;
}

// Función principal de simulación
export async function runSimulation() {
    console.log('Iniciando simulación...');
    
    // Mostrar indicador de carga
    const runButton = document.getElementById('runSimulation');
    if (!runButton) {
        const errorMsg = 'No se encontró el botón de simulación';
        console.error(errorMsg);
        showError(errorMsg);
        return { success: false, error: errorMsg };
    }
    
    const originalButtonText = runButton.innerHTML;
    let simulationSuccess = false;
    try {
        runButton.disabled = true;
        runButton.innerHTML = '⌛ Procesando...';
        // Obtener parámetros de la interfaz
        const getValue = (id) => {
            const element = document.getElementById(id);
            if (!element) throw new Error(`No se encontró el elemento con ID: ${id}`);
            return parseFloat(element.value);
        };
        
        const meanX = getValue('meanX');
        const stdX = getValue('stdX');
        const meanY = getValue('meanY');
        const stdY = getValue('stdY');
        const weightA = getValue('weightA');
        const weightB = getValue('weightB');
        const numSims = parseInt(document.getElementById('numSims')?.value || '1000');
        
        // Validar entradas
        if (isNaN(meanX) || isNaN(stdX) || isNaN(meanY) || isNaN(stdY) || 
            isNaN(weightA) || isNaN(weightB) || isNaN(numSims)) {
            throw new Error('Por favor, ingrese valores válidos en todos los campos.');
        }
        
        // Normalizar los pesos para que sumen 1 (en lugar de lanzar un error)
        const totalWeight = weightA + weightB;
        if (totalWeight === 0) {
            throw new Error('La suma de los pesos no puede ser cero.');
        }
        
        // Normalizar los pesos
        const normalizedWeightA = weightA / totalWeight;
        const normalizedWeightB = weightB / totalWeight;
        console.log(`Pesos normalizados: A=${normalizedWeightA.toFixed(2)}, B=${normalizedWeightB.toFixed(2)}`);
        
        // Ejecutar simulación con pesos normalizados
        const results = runMonteCarloSimulation(meanX, stdX, meanY, stdY, normalizedWeightA, normalizedWeightB, numSims);
        
        // Agregar los pesos a los resultados para usarlos en la matriz de covarianza
        results.weightA = weightA;
        results.weightB = weightB;
        
        // Actualizar la interfaz con los resultados
        updateUI(results);
        
        // Actualizar el gráfico
        updateDistributionChart(results.portfolioReturns);
        
        // Actualizar la matriz de covarianza
        updateCovarianceMatrix(results);
        
        // Actualizar la interpretación
        updateInterpretation(results, weightA, weightB);
        
        // Guardar los resultados para exportación y comparación
        const params = {
            meanX, stdX, meanY, stdY, weightA, weightB, numSims,
            financialPerspective: document.getElementById('financialPerspective')?.checked || false
        };
        saveLastSimulationResults(results, params);
        
        return results;
        
    } catch (error) {
        console.error('Error en la simulación:', error);
        // Mostrar mensaje de error en la interfaz
        const errorElement = document.createElement('div');
        errorElement.className = 'bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4';
        errorElement.innerHTML = `<p class="font-bold">Error</p><p>${error.message}</p>`;
        
        const interpretation = document.getElementById('interpretation');
        if (interpretation) {
            interpretation.innerHTML = '';
            interpretation.appendChild(errorElement);
        }
        
        throw error; // Relanzar el error para que pueda ser manejado por el llamador
    } finally {
        // Restaurar el botón
        if (runButton) {
            runButton.disabled = false;
            runButton.innerHTML = originalButtonText;
        }
    }
}

// Función para ejecutar la simulación de Monte Carlo
function runMonteCarloSimulation(meanX, stdX, meanY, stdY, weightA, weightB, numSims) {
    const xReturns = [];
    const yReturns = [];
    const portfolioReturns = [];
    
    // Generar retornos simulados
    for (let i = 0; i < numSims; i++) {
        const x = generateNormalRandom(meanX, stdX);
        const y = generateNormalRandom(meanY, stdY);
        const portfolio = weightA * x + weightB * y;
        
        xReturns.push(x);
        yReturns.push(y);
        portfolioReturns.push(portfolio);
    }
    
    // Calcular estadísticas
    const stats = calculateStatistics(xReturns, yReturns, portfolioReturns);
    
    return {
        xReturns,
        yReturns,
        portfolioReturns,
        ...stats
    };
}

// Función para calcular estadísticas
function calculateStatistics(xReturns, yReturns, portfolioReturns) {
    const n = xReturns.length;
    
    // Medias
    const meanX = xReturns.reduce((sum, x) => sum + x, 0) / n;
    const meanY = yReturns.reduce((sum, y) => sum + y, 0) / n;
    const meanPortfolio = portfolioReturns.reduce((sum, r) => sum + r, 0) / n;
    
    // Varianzas
    const varX = xReturns.reduce((sum, x) => sum + Math.pow(x - meanX, 2), 0) / (n - 1);
    const varY = yReturns.reduce((sum, y) => sum + Math.pow(y - meanY, 2), 0) / (n - 1);
    const varPortfolio = portfolioReturns.reduce((sum, r) => sum + Math.pow(r - meanPortfolio, 2), 0) / (n - 1);
    
    // Covarianzas
    const covXY = xReturns.reduce((sum, x, i) => {
        return sum + (x - meanX) * (yReturns[i] - meanY);
    }, 0) / (n - 1);
    
    // Ratio de Sharpe (asumiendo tasa libre de riesgo = 0 para simplificar)
    const sharpeRatio = meanPortfolio / Math.sqrt(varPortfolio);
    
    // Valor en Riesgo (VaR) al 95%
    const sortedReturns = [...portfolioReturns].sort((a, b) => a - b);
    const var95 = sortedReturns[Math.floor(0.05 * n)];
    
    return {
        meanX,
        meanY,
        meanPortfolio,
        varX,
        varY,
        varPortfolio,
        covXY,
        stdX: Math.sqrt(varX),
        stdY: Math.sqrt(varY),
        stdPortfolio: Math.sqrt(varPortfolio),
        sharpeRatio,
        var95
    };
}

// Función para actualizar la interfaz con los resultados
function updateUI(results) {
    try {
        // Función auxiliar para actualizar elementos con verificación
        const updateElement = (id, value, formatter = null) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = formatter ? formatter(value) : value;
            } else {
                console.warn(`Elemento con ID '${id}' no encontrado`);
            }
        };
        
        // Actualizar métricas principales
        updateElement('portfolioReturn', results.meanPortfolio, formatPercentage);
        updateElement('portfolioRisk', results.stdPortfolio, formatPercentage);
        updateElement('sharpeRatio', results.sharpeRatio, value => value.toFixed(3));
        updateElement('var95', results.var95, formatPercentage);
        
        // Actualizar clases de color según el rendimiento
        updateMetricColor('portfolioReturn', results.meanPortfolio >= 0);
        updateMetricColor('portfolioRisk', false); // El riesgo siempre se muestra en rojo (es algo negativo)
        updateMetricColor('sharpeRatio', results.sharpeRatio > 1); // Buen ratio de Sharpe > 1
        updateMetricColor('var95', results.var95 >= 0); // VaR positivo es malo
    } catch (error) {
        console.error('Error al actualizar la interfaz:', error);
    }
}

// Función para actualizar el gráfico de distribución
function updateDistributionChart(portfolioReturns) {
    try {
        const chartCanvas = document.getElementById('distributionChart');
        if (!chartCanvas) {
            console.warn('Elemento del gráfico no encontrado');
            return;
        }
        
        // Destruir el gráfico anterior si existe
        if (distributionChart) {
            distributionChart.destroy();
            distributionChart = null;
        }
        
        // También verificar si hay un gráfico global en el canvas
        const existingChart = Chart.getChart(chartCanvas);
        if (existingChart) {
            existingChart.destroy();
        }
    
        // Crear bins para el histograma
        const bins = 50;
        const min = Math.min(...portfolioReturns);
        const max = Math.max(...portfolioReturns);
        const binSize = (max - min) / bins;
        
        const histogram = new Array(bins).fill(0);
        const labels = [];
        
        // Inicializar etiquetas
        for (let i = 0; i < bins; i++) {
            labels.push((min + i * binSize).toFixed(3));
        }
        
        // Contar ocurrencias en cada bin
        portfolioReturns.forEach(value => {
            let binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
            histogram[binIndex]++;
        });
        
        // Crear un nuevo gráfico
        distributionChart = new Chart(chartCanvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Distribución de Retornos',
                    data: histogram,
                    backgroundColor: 'rgba(102, 126, 234, 0.7)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `Frecuencia: ${context.raw}`;
                            },
                            title: function(context) {
                                const minVal = parseFloat(context[0].label);
                                const maxVal = minVal + binSize;
                                return `Retorno: ${minVal.toFixed(3)} a ${maxVal.toFixed(3)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Retorno del Portfolio',
                            color: '#6b7280',
                            font: {
                                weight: 'bold'
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Frecuencia',
                            color: '#6b7280',
                            font: {
                                weight: 'bold'
                            }
                        },
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('Error al actualizar el gráfico de distribución:', error);
    }
}

// Función para actualizar la matriz de covarianza
function updateCovarianceMatrix(results) {
    try {
        // Calcular covarianzas adicionales
        const covXPortfolio = results.weightA * results.varX + results.weightB * results.covXY;
        const covYPortfolio = results.weightA * results.covXY + results.weightB * results.varY;
        
        // Función auxiliar para actualizar elementos del DOM
        const updateElement = (id, value, isPercentage = false) => {
            const element = document.getElementById(id);
            if (element) {
                if (isPercentage) {
                    element.textContent = `${(value * 100).toFixed(2)}%`;
                } else {
                    element.textContent = value.toFixed(6);
                }
            }
        };
        
        // Actualizar celdas de la matriz
        updateElement('varX', results.varX);
        updateElement('covXY', results.covXY);
        updateElement('covXPort', covXPortfolio);
        updateElement('covYX', results.covXY);  // Cov(Y,X) = Cov(X,Y)
        updateElement('varY', results.varY);
        updateElement('covYPort', covYPortfolio);
        updateElement('covPortX', covXPortfolio);  // Cov(Port,X) = Cov(X,Port)
        updateElement('covPortY', covYPortfolio);  // Cov(Port,Y) = Cov(Y,Port)
        updateElement('varPort', results.varPortfolio);
        
        // Actualizar vista de lista
        updateElement('varXLabel', results.varX);
        updateElement('varYLabel', results.varY);
        updateElement('varPortLabel', results.varPortfolio);
        updateElement('covXYLabel', results.covXY);
        
        // Actualizar los valores en la vista de lista
        const volatilityX = Math.sqrt(results.varX);
        const volatilityY = Math.sqrt(results.varY);
        const volatilityPort = Math.sqrt(results.varPortfolio);
        
        updateElement('volatilityX', volatilityX);
        updateElement('volatilityY', volatilityY);
        updateElement('volatilityPort', volatilityPort);
        
        // Actualizar la correlación
        const correlation = results.covXY / (volatilityX * volatilityY);
        updateElement('correlationXY', correlation);
        
    } catch (error) {
        console.error('Error al actualizar la matriz de covarianza:', error);
        // Mostrar mensaje de error en la interfaz
        const errorContainer = document.getElementById('errorContainer');
        if (errorContainer) {
            errorContainer.innerHTML = `
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                    <p class="font-bold">Error</p>
                    <p>No se pudo actualizar la matriz de covarianza: ${error.message}</p>
                </div>
            `;
        }
        
        // También mostrar en la consola para depuración
        console.error('Detalles del error:', error);
    }
}

// Función para actualizar la interpretación de resultados
function updateInterpretation(results, weightA, weightB) {
    const interpretation = document.getElementById('interpretation');
    const sharpeCategory = results.sharpeRatio > 1 ? 'alta' : results.sharpeRatio > 0.5 ? 'moderada' : 'baja';
    const riskLevel = results.stdPortfolio > 0.3 ? 'alto' : results.stdPortfolio > 0.15 ? 'moderado' : 'bajo';
    
    let analysis = `
        <h4 class="text-lg font-semibold text-portfolio-primary mb-4">💡 Análisis del Portfolio</h4>
        <div class="space-y-3">
            <p><strong>Composición:</strong> ${Math.round(weightA * 100)}% Activo X + ${Math.round(weightB * 100)}% Activo Y</p>
            <p><strong>Retorno Esperado:</strong> <span class="${results.meanPortfolio >= 0 ? 'text-finance-bull' : 'text-finance-bear'}">${formatPercentage(results.meanPortfolio)}</span> anual</p>
            <p><strong>Volatilidad (Riesgo):</strong> <span class="text-finance-bear">${formatPercentage(results.stdPortfolio)}</span> (${riskLevel})</p>
            <p><strong>Ratio de Sharpe:</strong> <span class="${results.sharpeRatio > 1 ? 'text-finance-bull' : 'text-finance-bear'}">${results.sharpeRatio.toFixed(3)}</span> (${sharpeCategory})</p>
            <p><strong>VaR 95%:</strong> En el peor 5% de los casos, las pérdidas podrían superar el <span class="text-finance-bear">${formatPercentage(Math.abs(results.var95))}</span></p>
            
            <div class="mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <h5 class="font-semibold mb-2">🔍 Interpretación de la Matriz de Covarianza:</h5>
                <ul class="list-disc list-inside space-y-1 text-sm">
                    <li>La varianza del portafolio (${results.varPortfolio.toFixed(6)}) es la suma ponderada de las varianzas y covarianzas de los activos.</li>
                    <li>La covarianza entre X e Y es ${results.covXY >= 0 ? 'positiva' : 'negativa'}, lo que indica que los activos tienden a moverse ${results.covXY >= 0 ? 'en la misma dirección' : 'en direcciones opuestas'}.</li>
                    <li>La diversificación es ${Math.abs(results.covXY) < 0.05 ? 'efectiva' : 'limitada'} debido a la ${Math.abs(results.covXY) < 0.05 ? 'baja' : 'alta'} correlación entre los activos.</li>
                </ul>
            </div>
        </div>
    `;
    
    // Recomendación basada en el ratio de Sharpe
    let recommendation = '';
    if (results.sharpeRatio > 1.5) {
        recommendation = 'Excelente relación riesgo-retorno. Considera aumentar la exposición a este portafolio.';
    } else if (results.sharpeRatio > 1) {
        recommendation = 'Buena relación riesgo-retorno. El portafolio es atractivo para inversores con perfil moderado.';
    } else if (results.sharpeRatio > 0.5) {
        recommendation = 'Relación riesgo-retorno aceptable. Considera ajustar los pesos para mejorar el rendimiento.';
    } else {
        recommendation = 'Baja relación riesgo-retorno. Se recomienda revisar la estrategia de inversión.';
    }
    
    analysis += `
        <div class="mt-4 p-3 ${results.sharpeRatio > 1 ? 'bg-green-100 dark:bg-green-900' : 'bg-yellow-100 dark:bg-yellow-900'} rounded-lg">
            <h5 class="font-semibold mb-1">📌 Recomendación:</h5>
            <p class="text-sm">${recommendation}</p>
        </div>
    `;
    
    interpretation.innerHTML = analysis;
}

// Función auxiliar para formatear porcentajes
function formatPercentage(value) {
    return `${(value * 100).toFixed(2)}%`;
}

// Función para actualizar el color de las métricas
function updateMetricColor(elementId, isPositive) {
    try {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Elemento con ID '${elementId}' no encontrado para actualizar color`);
            return;
        }
        
        // Eliminar clases de color existentes
        element.classList.remove('text-finance-bull', 'text-finance-bear');
        
        // Agregar la clase de color apropiada
        if (elementId === 'portfolioRisk' || elementId === 'var95') {
            // Para riesgo y VaR, valores más altos son peores
            element.classList.add('text-finance-bear');
        } else {
            element.classList.add(isPositive ? 'text-finance-bull' : 'text-finance-bear');
        }
    } catch (error) {
        console.error(`Error al actualizar color para '${elementId}':`, error);
    }
}

// Exportar funciones para pruebas
// @ts-ignore
if (typeof module !== 'undefined' && module.exports) {
    // @ts-ignore
    module.exports = {
        generateNormalRandom,
        runMonteCarloSimulation,
        calculateStatistics,
        formatPercentage
    };
}
