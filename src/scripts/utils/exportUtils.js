// Utilidades para exportación de datos
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Exporta los resultados de la simulación a un archivo PDF
 * @param {Object} results - Resultados de la simulación
 * @param {Object} params - Parámetros utilizados en la simulación
 */
export function exportToPDF(results, params) {
    try {
        // Crear un nuevo documento PDF
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Añadir título
        doc.setFontSize(20);
        doc.setTextColor(41, 65, 148); // Color primario
        doc.text('Reporte de Simulación de Portfolio', pageWidth / 2, 20, { align: 'center' });
        
        // Añadir fecha
        doc.setFontSize(10);
        doc.setTextColor(100);
        const date = new Date().toLocaleDateString();
        doc.text(`Generado el: ${date}`, pageWidth / 2, 28, { align: 'center' });
        
        // Parámetros de la simulación
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text('Parámetros de la Simulación', 14, 40);
        
        // Tabla de parámetros
        const paramsData = [
            ['Activo X - Media (μ)', params.meanX.toFixed(4)],
            ['Activo X - Volatilidad (σ)', params.stdX.toFixed(4)],
            ['Activo Y - Media (μ)', params.meanY.toFixed(4)],
            ['Activo Y - Volatilidad (σ)', params.stdY.toFixed(4)],
            ['Peso Activo X', `${(params.weightA * 100).toFixed(2)}%`],
            ['Peso Activo Y', `${(params.weightB * 100).toFixed(2)}%`],
            ['Número de Simulaciones', params.numSims.toLocaleString()]
        ];
        
        doc.autoTable({
            startY: 45,
            head: [['Parámetro', 'Valor']],
            body: paramsData,
            theme: 'grid',
            headStyles: { fillColor: [41, 65, 148], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            columnStyles: { 0: { cellWidth: 80 } }
        });
        
        // Resultados de la simulación
        doc.text('Resultados de la Simulación', 14, doc.autoTable.previous.finalY + 15);
        
        const resultsData = [
            ['Retorno Esperado', `${(results.meanPortfolio * 100).toFixed(2)}%`],
            ['Riesgo (Volatilidad)', `${(results.stdPortfolio * 100).toFixed(2)}%`],
            ['Ratio de Sharpe', results.sharpeRatio.toFixed(3)],
            ['Valor en Riesgo (VaR 95%)', `${(results.var95 * 100).toFixed(2)}%`],
            ['Covarianza X-Y', results.covXY.toFixed(6)]
        ];
        
        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 20,
            head: [['Métrica', 'Valor']],
            body: resultsData,
            theme: 'grid',
            headStyles: { fillColor: [41, 65, 148], textColor: [255, 255, 255] },
            styles: { fontSize: 10 },
            columnStyles: { 0: { cellWidth: 80 } }
        });
        
        // Añadir interpretación
        doc.text('Interpretación', 14, doc.autoTable.previous.finalY + 15);
        
        let interpretation = '';
        if (results.sharpeRatio > 1.5) {
            interpretation = 'Excelente relación riesgo-retorno. Considera aumentar la exposición a este portafolio.';
        } else if (results.sharpeRatio > 1) {
            interpretation = 'Buena relación riesgo-retorno. El portafolio es atractivo para inversores con perfil moderado.';
        } else if (results.sharpeRatio > 0.5) {
            interpretation = 'Relación riesgo-retorno aceptable. Considera ajustar los pesos para mejorar el rendimiento.';
        } else {
            interpretation = 'Baja relación riesgo-retorno. Se recomienda revisar la estrategia de inversión.';
        }
        
        const splitInterpretation = doc.splitTextToSize(interpretation, pageWidth - 30);
        doc.setFontSize(10);
        doc.text(splitInterpretation, 14, doc.autoTable.previous.finalY + 20);
        
        // Añadir pie de página
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text('Portfolio Simulator - Análisis de Variables Aleatorias', 14, doc.internal.pageSize.getHeight() - 10);
            doc.text(`Página ${i} de ${pageCount}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 10, { align: 'right' });
        }
        
        // Guardar el PDF
        doc.save('portfolio-simulation-report.pdf');
        return true;
    } catch (error) {
        console.error('Error al exportar a PDF:', error);
        return false;
    }
}

/**
 * Exporta los resultados de la simulación a un archivo CSV
 * @param {Object} results - Resultados de la simulación
 */
export function exportToCSV(results) {
    try {
        // Crear el contenido CSV
        let csvContent = 'data:text/csv;charset=utf-8,';
        
        // Encabezados
        csvContent += 'Retorno X,Retorno Y,Retorno Portfolio\n';
        
        // Datos
        for (let i = 0; i < results.xReturns.length; i++) {
            csvContent += `${results.xReturns[i]},${results.yReturns[i]},${results.portfolioReturns[i]}\n`;
        }
        
        // Crear un enlace para descargar
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'portfolio-simulation-data.csv');
        document.body.appendChild(link);
        
        // Descargar el archivo
        link.click();
        
        // Limpiar
        document.body.removeChild(link);
        return true;
    } catch (error) {
        console.error('Error al exportar a CSV:', error);
        return false;
    }
}

/**
 * Exporta los resultados de la simulación a un archivo JSON
 * @param {Object} results - Resultados de la simulación
 * @param {Object} params - Parámetros utilizados en la simulación
 */
export function exportToJSON(results, params) {
    try {
        // Crear el objeto JSON
        const data = {
            parameters: params,
            results: {
                meanPortfolio: results.meanPortfolio,
                stdPortfolio: results.stdPortfolio,
                sharpeRatio: results.sharpeRatio,
                var95: results.var95,
                covXY: results.covXY,
                // Limitar la cantidad de datos para evitar archivos muy grandes
                sampleData: {
                    xReturns: results.xReturns.slice(0, 1000),
                    yReturns: results.yReturns.slice(0, 1000),
                    portfolioReturns: results.portfolioReturns.slice(0, 1000)
                }
            },
            metadata: {
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }
        };
        
        // Convertir a string JSON
        const jsonString = JSON.stringify(data, null, 2);
        
        // Crear un enlace para descargar
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'portfolio-simulation.json');
        document.body.appendChild(link);
        
        // Descargar el archivo
        link.click();
        
        // Limpiar
        URL.revokeObjectURL(url);
        document.body.removeChild(link);
        return true;
    } catch (error) {
        console.error('Error al exportar a JSON:', error);
        return false;
    }
}

/**
 * Comparte los resultados en redes sociales
 * @param {string} platform - Plataforma de redes sociales (twitter, linkedin, etc.)
 * @param {Object} results - Resultados de la simulación
 */
export function shareResults(platform, results) {
    try {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent('Resultados de mi simulación de portfolio');
        const text = encodeURIComponent(`He simulado un portfolio con retorno esperado de ${(results.meanPortfolio * 100).toFixed(2)}% y riesgo de ${(results.stdPortfolio * 100).toFixed(2)}%. Ratio de Sharpe: ${results.sharpeRatio.toFixed(3)}.`);
        
        let shareUrl = '';
        
        switch (platform) {
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'linkedin':
                shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${text}`;
                break;
            case 'facebook':
                shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
                break;
            case 'whatsapp':
                shareUrl = `https://api.whatsapp.com/send?text=${text}%20${url}`;
                break;
            default:
                throw new Error(`Plataforma no soportada: ${platform}`);
        }
        
        // Abrir ventana para compartir
        window.open(shareUrl, '_blank', 'width=600,height=400');
        return true;
    } catch (error) {
        console.error(`Error al compartir en ${platform}:`, error);
        return false;
    }
}
