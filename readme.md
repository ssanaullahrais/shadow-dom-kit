# ShadowDomKit Documentation

## Introduction

ShadowDomKit is a lightweight JavaScript utility designed to solve the challenges of working with components inside Shadow DOM. It provides a simple, consistent API for finding elements and initializing JavaScript components across Shadow DOM boundaries.

## Table of Contents

- [Installation](#installation)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
- [Usage Examples](#usage-examples)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Installation

### Direct Script Include

```html
<!-- Include ShadowDomKit.js in your HTML -->
<script src="path/to/ShadowDomKit.js"></script>
```

Then import in your JavaScript:

```javascript
// ES6 import
import ShadowDomKit from 'shadow-dom-kit';

// CommonJS
const ShadowDomKit = require('shadow-dom-kit');
```

## Core Concepts

### Shadow DOM Challenges

The Shadow DOM creates encapsulated DOM trees that are separate from the main document DOM. This encapsulation presents challenges when:

1. Finding elements across Shadow DOM boundaries
2. Initializing third-party JavaScript components that need to access elements inside Shadow DOM
3. Working with dynamic Shadow DOM elements that might not be immediately available

### How ShadowDomKit Solves These Problems

ShadowDomKit provides:

1. Methods to search for elements across all Shadow DOM boundaries
2. A flexible component initialization system
3. Promise-based API for handling timing and loading issues
4. Customizable plugin architecture for working with any JavaScript library

## API Reference

### Creating an Instance

```javascript
const shadowKit = new ShadowDomKit(options);
```

Options object properties:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `debug` | Boolean | `false` | Enable debug logging |
| `searchDelay` | Number | `300` | Delay in ms before searching for elements |

### Core Methods

#### `findElementById(elementId, root)`

Finds an element by ID across Shadow DOM boundaries.

```javascript
const result = shadowKit.findElementById('my-element');
// Returns: { element: HTMLElement, context: ShadowRoot|Document } or null
```

Parameters:

- `elementId` (String): The ID of the element to find
- `root` (Document|ShadowRoot, optional): The root to start searching from. Defaults to `document`

#### `findElementsBySelector(selector, root)`

Finds all elements matching a CSS selector across Shadow DOM boundaries.

```javascript
const results = shadowKit.findElementsBySelector('.my-class');
// Returns: Array of { element: HTMLElement, context: ShadowRoot|Document }
```

Parameters:

- `selector` (String): CSS selector to match
- `root` (Document|ShadowRoot, optional): The root to start searching from. Defaults to `document`

#### `initComponent(config)`

Initializes a component within Shadow DOM and returns a Promise.

```javascript
shadowKit.initComponent({
    elementId: 'my-element',
    componentType: 'flowbite-accordion',
    options: { /* component options */ }
})
.then(instance => console.log('Component initialized:', instance))
.catch(error => console.error('Error:', error));
```

Configuration object properties:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `elementId` | String | No* | ID of the element to initialize |
| `selector` | String | No* | CSS selector to find element(s) |
| `componentType` | String | No** | Type of component to initialize |
| `customInit` | Function | No** | Custom initialization function |
| `options` | Object | No | Options to pass to the component |
| `delay` | Number | No | Override search delay for this initialization |

\* Either `elementId` or `selector` must be provided  
\** Either `componentType` or `customInit` must be provided

#### `registerComponentType(typeName, initFunction)`

Registers a custom component initializer.

```javascript
shadowKit.registerComponentType('my-component', (element, context, options) => {
    // Initialize and return the component
    return new MyComponent(element, options);
});
```

Parameters:

- `typeName` (String): Name of the component type
- `initFunction` (Function): Function that initializes the component. Receives `element`, `context`, and `options` parameters

#### Built-in Component Initializers

##### `initFlowbiteAccordion(element, context, options)`

Initializes a Flowbite accordion.

```javascript
const accordion = shadowKit.initFlowbiteAccordion(element, context, {
    itemCount: 3,
    activeItem: 1,
    alwaysOpen: false
});
```

Options:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `itemCount` | Number | `3` | Number of accordion items |
| `activeItem` | Number | `1` | Index of the initially active item |
| `alwaysOpen` | Boolean | `false` | Whether multiple items can be open simultaneously |
| `activeClasses` | String | *Flowbite defaults* | Classes to apply to active elements |
| `inactiveClasses` | String | *Flowbite defaults* | Classes to apply to inactive elements |

### Utility Methods

#### `log(...args)`

Logs debug messages when debug is enabled.

#### `warn(...args)`

Logs warning messages.

#### `error(...args)`

Logs error messages.

## Usage Examples

### Basic Usage

```javascript
document.addEventListener("DOMContentLoaded", function() {
    const shadowKit = new ShadowDomKit({ debug: true });
    
    // Find an element in Shadow DOM
    const result = shadowKit.findElementById('my-element');
    if (result) {
        console.log('Found element:', result.element);
    }
    
    // Initialize a component
    shadowKit.initComponent({
        elementId: 'my-accordion',
        componentType: 'flowbite-accordion'
    })
    .then(accordion => {
        console.log('Accordion initialized successfully');
    });
});
```

### Initializing Flowbite Accordion

```javascript
shadowKit.initComponent({
    elementId: 'my-accordion',
    componentType: 'flowbite-accordion',
    options: {
        itemCount: 4, // Number of accordion items
        activeItem: 2, // Make the second item active by default
        alwaysOpen: true, // Allow multiple items to be open
        activeClasses: 'bg-blue-100 text-blue-900',
        inactiveClasses: 'text-gray-500'
    }
});
```

### Using Custom Initialization Function

```javascript
shadowKit.initComponent({
    selector: '.datepicker',
    customInit: (element, context, options) => {
        const picker = new Pikaday({
            field: element,
            format: options.format || 'YYYY-MM-DD'
        });
        
        return picker;
    },
    options: { format: 'MM/DD/YYYY' }
});
```

### Registering and Using Custom Component Types

```javascript
// Register a custom component type
shadowKit.registerComponentType('chart', (element, context, options) => {
    return new Chart(element, {
        type: options.type || 'bar',
        data: options.data || {},
        options: options.chartOptions || {}
    });
});

// Use the custom component type
shadowKit.initComponent({
    elementId: 'my-chart',
    componentType: 'chart',
    options: {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar'],
            datasets: [{
                label: 'Sales',
                data: [10, 20, 30]
            }]
        }
    }
});
```

### Working with Multiple Components

```javascript
// Initialize multiple components
Promise.all([
    shadowKit.initComponent({
        elementId: 'accordion-1',
        componentType: 'flowbite-accordion'
    }),
    shadowKit.initComponent({
        elementId: 'dropdown-1',
        componentType: 'custom-dropdown'
    }),
    shadowKit.initComponent({
        selector: '.datepickers',
        componentType: 'datepicker'
    })
])
.then(results => {
    console.log('All components initialized:', results);
})
.catch(error => {
    console.error('Error initializing components:', error);
});
```

## Advanced Usage

### Working with Dynamic Content

```javascript
// Function to initialize components when content is loaded dynamically
function initDynamicContent() {
    shadowKit.initComponent({
        elementId: 'dynamic-accordion',
        componentType: 'flowbite-accordion',
        // Increase delay for dynamic content
        delay: 500
    });
}

// Add event listener for content loading
document.addEventListener('content-loaded', initDynamicContent);

// Or call after AJAX completes
fetch('/api/content')
    .then(response => response.json())
    .then(data => {
        // Update DOM with new content
        document.getElementById('container').innerHTML = data.html;
        
        // Initialize components in new content
        initDynamicContent();
    });
```

### Creating a Plugin for a Web Framework

```javascript
// Example React Hook
function useShadowDomKit() {
    const [shadowKit] = useState(() => new ShadowDomKit({ debug: true }));
    
    const initComponent = useCallback((config) => {
        return shadowKit.initComponent(config);
    }, [shadowKit]);
    
    return { shadowKit, initComponent };
}

// Usage in a React component
function MyComponent() {
    const { initComponent } = useShadowDomKit();
    
    useEffect(() => {
        initComponent({
            elementId: 'my-accordion',
            componentType: 'flowbite-accordion'
        });
    }, []);
    
    return <div id="my-accordion">...</div>;
}
```

## Troubleshooting

### Common Issues and Solutions

#### Component Not Found

**Problem**: `Element with ID "my-element" not found in any DOM context.`

**Solutions**:
- Verify the element ID is correct
- Increase the `searchDelay` option to give more time for the DOM to load
- Check if the element is dynamically created after initialization

#### Component Library Not Available

**Problem**: `Flowbite Accordion API not found. Accordion may not be fully functional.`

**Solutions**:
- Ensure the component library is loaded before ShadowDomKit
- Check for any JavaScript errors that might prevent the library from loading
- Verify the library's global namespace matches what ShadowDomKit is looking for

#### Shadow DOM Not Accessible

**Problem**: Elements inside Shadow DOM can't be found even though they exist

**Solutions**:
- Check if the Shadow DOM is closed (not accessible via JavaScript)
- Ensure there are no Cross-Origin restrictions
- Verify the Shadow DOM is fully initialized before searching

### Debugging

Enable debug mode to see detailed logs:

```javascript
const shadowKit = new ShadowDomKit({ debug: true });
```

This will output detailed information about the search process, component initialization, and any errors encountered.

## Best Practices

### Performance Optimization

1. **Be Specific with Selectors**: Use IDs instead of complex CSS selectors when possible
2. **Minimize Shadow DOM Traversal**: Cache results of `findElementById` if you need to reference the same element multiple times
3. **Batch Initializations**: Use `Promise.all` with multiple `initComponent` calls rather than initializing components one by one

### Component Organization

1. **Register All Component Types Early**: Register custom component types at application startup
2. **Use Consistent Naming**: Establish a convention for component type names
3. **Document Component Options**: Maintain documentation for the options each component type accepts

### Integration Tips

1. **CMS Integration**: For WordPress, Drupal, or other CMS platforms, wrap ShadowDomKit in a dedicated plugin/module
2. **Framework Integration**: Create custom hooks or services for React, Vue, or Angular
3. **Build Process**: Include ShadowDomKit in your build process to avoid multiple versions
