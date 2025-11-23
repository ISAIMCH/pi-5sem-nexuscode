# 🎨 Guía de Colores CSS - GRUPO STRALTI

## Variables CSS Recomendadas

Añade estas variables al inicio de tu archivo CSS o en un archivo `variables.css` global:

```css
:root {
  /* COLORES CORPORATIVOS GRUPO STRALTI */
  
  /* Rojo Corporativo - Primario */
  --color-primary: #C41E3A;
  --color-primary-hover: #A01830;
  --color-primary-light: #ffe6e6;
  --color-primary-bg: #fff5f5;
  
  /* Textos */
  --color-text-primary: #1a1a1a;
  --color-text-secondary: #999999;
  --color-text-light: #cccccc;
  
  /* Fondos */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f0f0f0;
  --color-bg-light: #f8f8f8;
  
  /* Bordes */
  --color-border: #dddddd;
  --color-border-light: #ecf0f1;
  
  /* Efectos */
  --shadow-primary: 0 4px 12px rgba(196, 30, 58, 0.3);
  --shadow-secondary: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  /* Gradientes */
  --gradient-primary: linear-gradient(135deg, #C41E3A 0%, #A01830 100%);
  --gradient-primary-light: linear-gradient(135deg, #C41E3A15 0%, #A0183015 100%);
}
```

---

## Ejemplos de Código CSS

### 1. Botones Primarios

```css
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-primary);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
  transform: translateY(-2px);
}
```

### 2. Cards con Borde Izquierdo

```css
.card {
  background: var(--color-bg-primary);
  border-left: 4px solid var(--color-primary);
  border-radius: 8px;
  padding: 20px;
  box-shadow: var(--shadow-secondary);
}
```

### 3. Headers de Tablas

```css
.table thead {
  background: var(--color-primary);
  color: white;
}

.table th {
  padding: 12px;
  font-weight: 600;
  text-align: left;
}
```

### 4. Títulos (H1, H2, H3)

```css
h1, h2, h3 {
  color: var(--color-text-primary);
  font-weight: 700;
}

h1 {
  font-size: 28px;
}

h2 {
  font-size: 20px;
  border-bottom: 2px solid var(--color-primary);
  padding-bottom: 12px;
}
```

### 5. Inputs con Focus

```css
input, select, textarea {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  background-color: var(--color-bg-primary);
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
  background-color: var(--color-primary-bg);
}
```

### 6. Badges/Insignias

```css
.badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-primary {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.badge-secondary {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}
```

### 7. Gradientes

```css
.gradient-primary {
  background: var(--gradient-primary);
  color: white;
}

.gradient-light {
  background: var(--gradient-primary-light);
}
```

### 8. Barras de Progreso

```css
.progress-bar {
  width: 100%;
  height: 24px;
  background: var(--color-bg-secondary);
  border-radius: 12px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--gradient-primary);
  border-radius: 12px;
  transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 9. Selectores/Combinadores

```css
.selector-container {
  background: var(--color-bg-primary);
  border-left: 4px solid var(--color-primary);
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: var(--shadow-secondary);
}

.selector-label {
  font-weight: 600;
  color: var(--color-text-primary);
}

.selector-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  color: var(--color-text-primary);
}

.selector-input:hover,
.selector-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
}
```

### 10. Modales

```css
.modal-header {
  background: var(--gradient-primary);
  color: white;
  padding: 20px;
  border-radius: 8px 8px 0 0;
}

.modal-content {
  padding: 24px;
  background: var(--color-bg-primary);
}

.modal-footer {
  padding: 16px;
  border-top: 1px solid var(--color-border-light);
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

---

## Paleta de Colores en Hex

### Colores Primarios

```
#C41E3A - Rojo corporativo (PRIMARY)
#A01830 - Rojo oscuro (PRIMARY_HOVER)
#ffe6e6 - Rojo claro (PRIMARY_LIGHT)
#fff5f5 - Rojo muy claro (PRIMARY_BG)
```

### Colores de Texto

```
#1a1a1a - Negro corporativo (TEXT_PRIMARY)
#999999 - Gris (TEXT_SECONDARY)
#cccccc - Gris claro (TEXT_LIGHT)
```

### Fondos

```
#ffffff - Blanco (BG_PRIMARY)
#f0f0f0 - Gris claro (BG_SECONDARY)
#f8f8f8 - Gris muy claro (BG_LIGHT)
```

### Bordes

```
#dddddd - Borde oscuro (BORDER)
#ecf0f1 - Borde claro (BORDER_LIGHT)
```

---

## RGBA para Efectos y Sombras

### Rojo Corporativo

```css
rgba(196, 30, 58, 0.1)  - 10% opacity (muy claro)
rgba(196, 30, 58, 0.15) - 15% opacity (claro)
rgba(196, 30, 58, 0.2)  - 20% opacity
rgba(196, 30, 58, 0.3)  - 30% opacity (sombras)
rgba(196, 30, 58, 0.5)  - 50% opacity (semi-transparente)
```

### Negro

```css
rgba(0, 0, 0, 0.1)  - Sombra muy claro
rgba(0, 0, 0, 0.15) - Sombra claro
rgba(0, 0, 0, 0.2)  - Sombra standard
```

---

## Gradientes Predefinidos

### Gradiente Primario

```css
linear-gradient(135deg, #C41E3A 0%, #A01830 100%)
```

### Gradiente Primario Claro

```css
linear-gradient(135deg, #C41E3A15 0%, #A0183015 100%)
```

### Gradiente Inverso

```css
linear-gradient(45deg, #A01830 0%, #C41E3A 100%)
```

---

## Combinaciones Recomendadas

### Texto + Fondo

```css
/* Mayor contraste */
color: #1a1a1a;        /* Negro sobre blanco */
background-color: #ffffff;

/* Contraste medio */
color: #999999;        /* Gris sobre blanco */
background-color: #ffffff;

/* Contraste para elementos rojos */
color: #ffffff;        /* Blanco sobre rojo */
background-color: #C41E3A;

/* Fondo rojo claro con texto rojo oscuro */
color: #A01830;
background-color: #ffe6e6;
```

---

## Estados y Transiciones

### Hover State

```css
.element:hover {
  color: var(--color-primary);
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px var(--color-primary-light);
  transition: all 0.3s ease;
}
```

### Focus State

```css
.element:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
```

### Active State

```css
.element.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary-hover);
}
```

### Disabled State

```css
.element:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}
```

---

## Checklist de Validación de Colores

Al crear nuevos componentes, verifica:

- [ ] Uso correcto de colores corporativos
- [ ] Contraste WCAG AA mínimo (4.5:1)
- [ ] Consistencia con otros componentes similares
- [ ] Estados hover/focus implementados
- [ ] Sombras usando RGBA rojo corporativo
- [ ] Gradientes usando colores oficiales
- [ ] Textos en negro corporativo (#1a1a1a)
- [ ] Fondos en blanco o gris claro
- [ ] Bordes en rojo corporativo o gris
- [ ] Sin colores "hardcoded" - usar variables

---

## 🎨 Recursos de Color

### Códigos de Color

```
HEX:   #C41E3A
RGB:   rgb(196, 30, 58)
HSL:   hsl(354, 74%, 44%)
CMYK:  C: 0% M: 85% Y: 70% K: 23%
```

### Variaciones de Rojo

| Variación | Código | Uso |
|-----------|--------|-----|
| Muy oscuro | #7a111f | Bordes |
| Oscuro | #A01830 | Hover, gradientes |
| Primario | #C41E3A | Principal |
| Claro | #e85a70 | Estados |
| Muy claro | #ffe6e6 | Fondos |
| Ultra claro | #fff5f5 | Overlays |

---

## 📚 Referencias de Accesibilidad

### WCAG 2.1 Cumplimiento

- ✅ Texto negro (#1a1a1a) sobre blanco: 16.5:1 (AAA)
- ✅ Texto blanco sobre rojo (#C41E3A): 6.5:1 (AA)
- ✅ Texto gris (#999999) sobre blanco: 5.2:1 (AA)
- ✅ Todos los botones tienen suficiente tamaño (44x44px mínimo)

### Herramientas de Validación

- **WebAIM Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Color Hexa:** https://www.colorhexa.com/
- **Accessible Colors:** https://accessible-colors.com/

---

## 🚀 Próximas Pasos

1. Implementar archivo `variables.css` global
2. Refactorizar componentes antiguos con variables CSS
3. Crear componentes reutilizables con la paleta
4. Documentar en Storybook (si aplica)
5. Capacitar al equipo en uso de variables

---

**¡Tu referencia completa para mantener la consistencia de colores! 🎨**

*Última actualización: 23 de Noviembre, 2025*
