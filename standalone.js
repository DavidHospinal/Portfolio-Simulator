// Portfolio Simulator - Script independiente para funcionalidad completa
document.addEventListener('DOMContentLoaded', () => {
    console.log('Portfolio Simulator inicializado');
    
    // Establecer valores por defecto
    setDefaultValues();
    
    // Inicializar modo oscuro
    initDarkMode();
    
    // Inicializar sliders
    initWeightSliders();
    
    // Inicializar botón de simulación
    initRunButton();
});

// Establecer valores por defecto para todos los inputs
function setDefaultValues() {
    const defaults = {
        'meanX': 0.08,
        'stdX': 0.20,
        'meanY': 0.12,
        'stdY': 0.30,
        'weightA': 0.6,
        'weightB': 0.4,
        'numSims': 10000
    };
    
    Object.keys(defaults).forEach(id => {
        const element = document.getElementById(id);
        if (element && (!element.value || element.value === '0')) {
            element.value = defaults[id];
            console.log(`Valor por defecto establecido para ${id}: ${defaults[id]}`);
        }
    });
}

// Inicializar modo oscuro
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        document.documentElement.classList.toggle('dark', isDarkMode);
        
        darkModeToggle.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
            console.log('Modo oscuro cambiado');
        });
    }
}

// Inicializar sliders de pesos
function initWeightSliders() {
    const weightA = document.getElementById('weightA');
    const weightB = document.getElementById('weightB');
    const weightAValue = document.getElementById('weightAValue');
    const weightBValue = document.getElementById('weightBValue');
    
    if (weightA && weightAValue) {
        weightAValue.textContent = `${parseInt(weightA.value * 100)}%`;
        weightA.addEventListener('input', () => {
            weightAValue.textContent = `${parseInt(weightA.value * 100)}%`;
            // Actualizar weightB para complementar weightA
            if (weightB) {
                weightB.value = (1 - parseFloat(weightA.value)).toFixed(2);
                if (weightBValue) {
                    weightBValue.textContent = `${parseInt(weightB.value * 100)}%`;
                }
            }
        });
    }
    
    if (weightB && weightBValue) {
        weightBValue.textContent = `${parseInt(weightB.value * 100)}%`;
        weightB.addEventListener('input', () => {
            weightBValue.textContent = `${parseInt(weightB.value * 100)}%`;
            // Actualizar weightA para complementar weightB
            if (weightA) {
                weightA.value = (1 - parseFloat(weightB.value)).toFixed(2);
                if (weightAValue) {
                    weightAValue.textContent = `${parseInt(weightA.value * 100)}%`;
                }
            }
        });
    }
}

// Inicializar botón de simulación
function initRunButton() {
    const runButton = document.getElementById('runSimulation');
    if (runButton) {
        runButton.addEventListener('click', async () => {
            try {
                console.log('Ejecutando simulación...');
                runButton.disabled = true;
                runButton.innerHTML = '⌛ Procesando...';
                
                // Obtener valores de entrada
                const meanX = parseFloat(document.getElementById('meanX').value);
                const stdX = parseFloat(document.getElementById('stdX').value);
                const meanY = parseFloat(document.getElementById('meanY').value);
                const stdY = parseFloat(document.getElementById('stdY').value);
                const weightA = parseFloat(document.getElementById('weightA').value);
                const weightB = parseFloat(document.getElementById('weightB').value);
                const numSims = parseInt(document.getElementById('numSims').value);
                
                // Ejecutar simulación
                const results = runMonteCarloSimulation(meanX, stdX, meanY, stdY, weightA, weightB, numSims);
                
                // Actualizar UI
                updateUI(results);
                updateDistributionChart(results.portfolioReturns);
                updateCovarianceMatrix(results);
                updateInterpretation(results, weightA, weightB);
                
                // Mostrar mensaje de éxito
                showMessage('Simulación completada con éxito', 'success');
            } catch (error) {
                console.error('Error en la simulación:', error);
                showMessage('Error en la simulación: ' + error.message, 'error');
            } finally {
                runButton.disabled = false;
                runButton.innerHTML = '🚀 Ejecutar Simulación';
            }
        });
    }
}

// Funciones auxiliares
function showMessage(message, type) {
    const element = document.getElementById(type === 'success' ? 'success-message' : 'error-message');
    if (element) {
        element.textContent = message;
        element.classList.remove('translate-x-full');
        setTimeout(() => {
            element.classList.add('translate-x-full');
        }, 3000);
    }
}

// Simulación Monte Carlo
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
        ...stats,
        weightA,
        weightB
    };
}

// Generar números aleatorios normales
function generateNormalRandom(mean = 0, std = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * std + mean;
}

// Calcular estadísticas
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
    
    // Ratio de Sharpe (asumiendo tasa libre de riesgo = 0 por simplicidad)
    const sharpeRatio = meanPortfolio / Math.sqrt(varPortfolio);
    
    // Value at Risk (VaR) al 95%
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

// Actualizar UI con resultados
function updateUI(results) {
    // Actualizar métricas
    updateElement('portfolioReturn', results.meanPortfolio, formatPercentage);
    updateElement('portfolioRisk', results.stdPortfolio, formatPercentage);
    updateElement('sharpeRatio', results.sharpeRatio, value => value.toFixed(3));
    updateElement('var95', results.var95, formatPercentage);
    
    // Actualizar colores
    updateMetricColor('portfolioReturn', results.meanPortfolio >= 0);
    updateMetricColor('portfolioRisk', false);
    updateMetricColor('sharpeRatio', results.sharpeRatio > 1);
    updateMetricColor('var95', results.var95 >= 0);
}

// Función auxiliar para actualizar elementos
function updateElement(id, value, formatter = null) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = formatter ? formatter(value) : value;
    }
}

// Formatear porcentaje
function formatPercentage(value) {
    return `${(value * 100).toFixed(2)}%`;
}

// Actualizar colores de métricas
function updateMetricColor(elementId, isPositive) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.remove('text-finance-bull', 'text-finance-bear');
        
        if (elementId === 'portfolioRisk' || elementId === 'var95') {
            element.classList.add('text-finance-bear');
        } else {
            element.classList.add(isPositive ? 'text-finance-bull' : 'text-finance-bear');
        }
    }
}

// Actualizar gráfico de distribución
function updateDistributionChart(portfolioReturns) {
    const chartCanvas = document.getElementById('distributionChart');
    if (!chartCanvas) return;
    
    // Limpiar gráfico existente
    if (window.Chart && typeof Chart.getChart === 'function') {
        const existingChart = Chart.getChart(chartCanvas);
        if (existingChart) {
            existingChart.destroy();
        }
    }
    
    // Crear bins para histograma
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
    
    // Crear gráfico
    if (window.Chart) {
        new Chart(chartCanvas.getContext('2d'), {
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
    }
}

// Actualizar matriz de covarianza
function updateCovarianceMatrix(results) {
    // Calcular covarianzas adicionales
    const covXPortfolio = results.weightA * results.varX + results.weightB * results.covXY;
    const covYPortfolio = results.weightA * results.covXY + results.weightB * results.varY;
    
    // Actualizar celdas de la matriz
    updateElement('varX', results.varX, value => value.toFixed(6));
    updateElement('covXY', results.covXY, value => value.toFixed(6));
    updateElement('covXPort', covXPortfolio, value => value.toFixed(6));
    updateElement('covYX', results.covXY, value => value.toFixed(6));
    updateElement('varY', results.varY, value => value.toFixed(6));
    updateElement('covYPort', covYPortfolio, value => value.toFixed(6));
    updateElement('covPortX', covXPortfolio, value => value.toFixed(6));
    updateElement('covPortY', covYPortfolio, value => value.toFixed(6));
    updateElement('varPort', results.varPortfolio, value => value.toFixed(6));
    
    // Actualizar vista de lista
    updateElement('varXLabel', results.varX, value => value.toFixed(6));
    updateElement('varYLabel', results.varY, value => value.toFixed(6));
    updateElement('varPortLabel', results.varPortfolio, value => value.toFixed(6));
    updateElement('covXYLabel', results.covXY, value => value.toFixed(6));
}

// Actualizar interpretación
function updateInterpretation(results, weightA, weightB) {
    const interpretation = document.getElementById('interpretation');
    if (!interpretation) return;
    
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