// Configuración y manejo de gráficos
export function initializeCharts() {
    console.log('Inicializando gráficos...');
    
    try {
        // Inicializar el gráfico de distribución con un estado vacío
        console.log('Buscando elemento distributionChart...');
        const ctx = document.getElementById('distributionChart');
        if (!ctx) {
            console.error('No se encontró el elemento con ID "distributionChart"');
            return null;
        }
        
        console.log('Creando instancia de Chart...');
        // Crear un gráfico vacío que se actualizará con los datos de la simulación
        const chart = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Distribución de Retornos',
                    data: [],
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
                            title: function() {
                                return 'Ejecuta una simulación para ver los datos';
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
        
        console.log('Gráfico inicializado correctamente');
        return chart;
    } catch (error) {
        console.error('Error al inicializar los gráficos:', error);
        return null;
    }
}

// Función para actualizar el gráfico de distribución
export function updateDistributionChart(chart, portfolioReturns) {
    if (!chart || !portfolioReturns || portfolioReturns.length === 0) return;
    
    // Crear bins para el histograma
    const bins = 50;
    const min = Math.min(...portfolioReturns);
    const max = Math.max(...portfolioReturns);
    const binSize = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    const labels = [];
    
    // Inicializar etiquetas y contadores
    for (let i = 0; i < bins; i++) {
        labels.push((min + i * binSize).toFixed(3));
    }
    
    // Contar ocurrencias en cada bin
    portfolioReturns.forEach(value => {
        let binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
        histogram[binIndex]++;
    });
    
    // Actualizar datos del gráfico
    chart.data.labels = labels;
    chart.data.datasets[0].data = histogram;
    
    // Actualizar tooltips
    chart.options.plugins.tooltip.callbacks.title = function(context) {
        const minVal = parseFloat(context[0].label);
        const maxVal = minVal + binSize;
        return `Retorno: ${minVal.toFixed(3)} a ${maxVal.toFixed(3)}`;
    };
    
    // Actualizar el gráfico
    chart.update();
}

// Función para crear un gráfico de dispersión de los retornos
export function createScatterPlot(canvasId, xData, yData, xLabel, yLabel, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    // Destruir gráfico existente si existe
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    // Crear datos para el gráfico de dispersión
    const scatterData = xData.map((x, i) => ({
        x: x,
        y: yData[i]
    }));
    
    // Crear el gráfico
    const scatterChart = new Chart(ctx.getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Retornos',
                data: scatterData,
                pointBackgroundColor: 'rgba(102, 126, 234, 0.7)',
                pointBorderColor: 'rgba(102, 126, 234, 1)',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `(${context.parsed.x.toFixed(4)}, ${context.parsed.y.toFixed(4)})`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xLabel,
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
                        text: yLabel,
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    // Guardar referencia al gráfico
    ctx.chart = scatterChart;
    return scatterChart;
}

// Función para crear un gráfico de líneas
export function createLineChart(canvasId, labels, datasets, title) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;
    
    // Destruir gráfico existente si existe
    if (ctx.chart) {
        ctx.chart.destroy();
    }
    
    // Configuración de colores
    const colors = [
        'rgba(102, 126, 234, 1)',
        'rgba(118, 75, 162, 1)',
        'rgba(240, 147, 251, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
    ];
    
    // Preparar datasets con colores
    const formattedDatasets = datasets.map((dataset, index) => ({
        ...dataset,
        borderColor: colors[index % colors.length],
        backgroundColor: colors[index % colors.length].replace('1)', '0.2)'),
        borderWidth: 2,
        pointRadius: 2,
        fill: false,
        tension: 0.1
    }));
    
    // Crear el gráfico
    const lineChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels,
            datasets: formattedDatasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: title,
                    font: {
                        size: 16,
                        weight: 'bold'
                    }
                },
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Período',
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
                        text: 'Retorno',
                        font: {
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            }
        }
    });
    
    // Guardar referencia al gráfico
    ctx.chart = lineChart;
    return lineChart;
}
