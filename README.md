# 📊 Portfolio Simulator - Variables Aleatorias
## Simulador de Portfolio de Inversiones con Análisis de Riesgo
![AnimationVI](https://github.com/user-attachments/assets/af32e403-2e76-4292-89b9-1f2e9f3de89a)


### 🎯 **DESCRIPCIÓN DEL PROYECTO**

**Contexto Real**: Análisis de riesgo en inversiones financieras
- **X, Y**: Retornos de dos activos independientes (ej: acciones de Apple y Google)
- **aX + bY**: Portfolio combinado con pesos a y b
- **Aplicación**: Optimizar la combinación para minimizar riesgo y maximizar retorno

### 🧮 **FUNDAMENTOS MATEMÁTICOS**
![image](https://github.com/user-attachments/assets/f18fb7a2-c830-4962-a268-6c616271aab9)

#### **Variables Aleatorias Independientes**
- **Activo X ~ N(μₓ, σₓ²)**: Representa el retorno de un activo financiero
- **Activo Y ~ N(μᵧ, σᵧ²)**: Representa el retorno de otro activo independiente
- **Portfolio Z = aX + bY**: Combinación lineal con pesos a y b

#### **Análisis de Covarianza**
E[Z] = a·E[X] + b·E[Y]  
Var(Z) = a²·Var(X) + b²·Var(Y) + 2ab·Cov(X,Y)  
Matriz de Covarianza 3x3:  
```
ΣZ = [Var(X)    Cov(X,Y)   Cov(X,Z)]
     [Cov(Y,X)  Var(Y)     Cov(Y,Z)]
     [Cov(Z,X)  Cov(Z,Y)   Var(Z)  ]
```

#### **Simulación Monte Carlo**
- Generación de 10,000+ realizaciones de (X,Y) independientes
- Cálculo empírico de μZ y ΣZ
- Comparación teoría vs simulación

### 🚀 **CARACTERÍSTICAS PRINCIPALES**

- ✅ **Simulación interactiva** con parámetros ajustables
- ✅ **Visualización en tiempo real** con Chart.js
- ✅ **Métricas financieras**: Ratio Sharpe, VaR, retorno esperado
- ✅ **Matriz de covarianza** calculada matemáticamente
- ✅ **Diseño responsivo** con Tailwind CSS
- ✅ **Validación de inputs** y manejo de errores
- ✅ **Presets de portfolios** (conservador, moderado, agresivo)

### 📁 **ESTRUCTURA DEL PROYECTO**
```
portfolio-simulator/
├── index.html                 # 🎯 Aplicación principal
├── src/
│   ├── assets/                # 🖼️ Imágenes y recursos estáticos
│   ├── components/            # 🧩 Componentes de UI reutilizables
│   ├── hooks/                 # 🎣 Custom hooks
│   ├── scripts/
│   │   ├── charts.js          # 📊 Visualizaciones Chart.js
│   │   ├── index.js           # 📌 Punto de entrada
│   │   ├── main.js            # 🔄 Controlador principal
│   │   ├── simulation.js      # 🧮 Lógica de simulación Monte Carlo
│   │   └── utils/             # 🛠️ Funciones utilitarias
│   ├── styles/
│   │   └── main.css           # 🎨 Estilos CSS principal
│   └── utils/                 # 🔧 Utilidades generales
├── public/                    # 📂 Archivos públicos estáticos
├── package.json               # 📋 Dependencias y scripts
├── tailwind.config.js         # ⚙️ Configuración Tailwind CSS
├── vite.config.js             # 🔌 Configuración de Vite
└── README.md                  # 📖 Este archivo
```

### 📊 **COMPONENTES DE LA APLICACIÓN**

#### **1. Panel de Controles**
- **Activos Financieros**: Configuración de μ y σ para activos X e Y
- **Pesos del Portfolio**: Sliders para ajustar coeficientes a y b
- **Parámetros de Simulación**: Número de iteraciones Monte Carlo
- **Presets**: Configuraciones predefinidas (60/40, 80/20, Long-Short, Apalancado)

#### **2. Dashboard de Resultados**
- **Retorno Esperado**: E[Z] calculado teórica y empíricamente
- **Riesgo (Volatilidad)**: σZ del portfolio combinado
- **Ratio Sharpe**: Medida de eficiencia riesgo-retorno
- **VaR 95%**: Value at Risk - pérdida máxima esperada

#### **3. Visualizaciones Interactivas**
- **Histograma de Retornos**: Distribución del portfolio Z
- **Matriz de Covarianza**: Representación numérica 3x3
- **Análisis de Sensibilidad**: Impacto de cambios en parámetros

#### **4. Interpretación Financiera**
- **Análisis automático** del portfolio configurado
- **Recomendaciones** basadas en métricas de riesgo
- **Alertas** para configuraciones de alto riesgo
- **Insights educativos** sobre variables aleatorias

### 🛠️ **TECNOLOGÍAS UTILIZADAS**

- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Styling**: Tailwind CSS v3.4+
- **Visualización**: Chart.js v4.4+
- **Build System**: Vite v6.3+
- **Exportación**: jsPDF para reportes PDF
- **Matemáticas**: Algoritmo Box-Muller para distribuciones normales
- **Deploy**: Netlify, Vercel, GitHub Pages

### 🚀 **INSTALACIÓN Y USO**

#### **1. Clonar repositorio**
```bash
git clone https://github.com/DavidHospinal/Portfolio-Simulator.git
cd Portfolio-Simulator
```

#### **2. Instalar dependencias**
```bash
npm install
```

#### **3. Desarrollo local**
```bash
npm run dev
# Abre la URL mostrada en la terminal (normalmente http://localhost:5173)
```

#### **4. Build para producción**
```bash
npm run build
```

### 📈 **CASOS DE USO**

#### **1. Portfolio Tradicional (60/40)**
- a = 0.6, b = 0.4: 60% acciones, 40% bonos
- Riesgo moderado, retorno estable
- Ideal para: Inversores conservadores

#### **2. Portfolio Agresivo (80/20)**
- a = 0.8, b = 0.2: 80% acciones, 20% bonos
- Mayor riesgo, mayor potencial de retorno
- Ideal para: Inversores con tolerancia alta al riesgo

#### **3. Long-Short Strategy**
- a = 1.2, b = -0.2: Posición larga + posición corta
- Estrategia neutral al mercado
- Ideal para: Gestores de fondos hedge

#### **4. Portfolio Apalancado**
- a = 1.5, b = 0.6: Total > 100% (apalancamiento)
- Riesgo extremo, retornos amplificados
- Ideal para: Trading profesional (con precaución)

### 📚 **CONCEPTOS EDUCATIVOS**

#### **Variables Aleatorias**
- Independencia estadística: Cov(X,Y) ≈ 0
- Distribuciones normales: Características de los retornos financieros
- Combinaciones lineales: Impacto en media y varianza

#### **Análisis de Riesgo**
- Diversificación: Beneficios de combinar activos
- Correlación: Impacto en el riesgo del portfolio
- Apalancamiento: Amplificación de riesgo y retorno

#### **Métricas Financieras**
- Ratio Sharpe: Retorno ajustado por riesgo
- VaR (Value at Risk): Medida de pérdida potencial
- Volatilidad: Medida de incertidumbre

### 🎯 **APLICACIONES REALES**
Este simulador demuestra conceptos utilizados en:

- Gestión de portfolios institucionales
- Análisis cuantitativo en finanzas
- Optimización de Markowitz
- Modelos de riesgo bancarios
- Trading algorítmico

### 🌐 **DEPLOYMENTS**

- 🟠 **Netlify**: [davidhospinal-portfolio-valeator.netlify.app](https://davidhospinal-portfolio-valeator.netlify.app/)
- 🐱 **GitHub Pages**: [davidhospinal.github.io/Portfolio-Simulator](https://davidhospinal.github.io/Portfolio-Simulator/)
- ▲ **Vercel**: [davidhospinal-portfolio-simulator.vercel.app](https://davidhospinal-portfolio-simulator.vercel.app/)

### 👨‍💻 **AUTOR**
**David H'spinal**

- 🏢 H'spinal Systems
- 📍 Chile, Santiago
- 🎓 Ingeniero de Sistemas con Magíster en TI (PUC Chile)
- 💼 Consultor en Gestión de Proyectos e IA
- 🌐 [hospinalsystems.carrd.co](https://hospinalsystems.carrd.co)
- 🐦 [@DavidHspinal](https://twitter.com/DavidHspinal)

### 📄 **LICENCIA**
MIT License - Ver archivo LICENSE para detalles.

### 🤝 **CONTRIBUCIONES**
Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

### 📞 **SOPORTE**
Para preguntas, sugerencias o contribuciones:

- 🦊 **GitLab**: [david.hospinal](https://gitlab.com/david.hospinal)
- 𝕏 **Twitter/X**: [@DavidHspinal](https://twitter.com/DavidHspinal)


⭐ Si este proyecto te resulta útil, ¡no olvides darle una estrella en GitHub!
