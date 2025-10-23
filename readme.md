# ShadowDomKit Documentation

## Introduction

ShadowDomKit is a lightweight, framework-agnostic JavaScript utility designed to solve the challenges of working with components inside Shadow DOM. It provides a simple, consistent API for finding elements and initializing JavaScript components across Shadow DOM boundaries.

**Zero dependencies. Works anywhere. Use with any framework or library.**

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

### Module Import

```javascript
// ES6 import
import ShadowDomKit from './ShadowDomKit.js';

// CommonJS
const ShadowDomKit = require('./ShadowDomKit.js');
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
    customInit: (element, context, options) => {
        // Your initialization code
        return new MyComponent(element, options);
    },
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
| `componentType` | String | No** | Type of component to initialize (must be registered first) |
| `customInit` | Function | No** | Custom initialization function |
| `options` | Object | No | Options to pass to the component |
| `delay` | Number | No | Override search delay for this initialization |

\* Either `elementId` or `selector` must be provided
\** Either `componentType` or `customInit` must be provided

#### `registerComponentType(typeName, initFunction)`

Registers a custom component initializer that can be reused throughout your application.

```javascript
shadowKit.registerComponentType('my-component', (element, context, options) => {
    // Initialize and return the component
    return new MyComponent(element, options);
});

// Now you can use it by name
shadowKit.initComponent({
    elementId: 'my-element',
    componentType: 'my-component',
    options: { /* ... */ }
});
```

Parameters:

- `typeName` (String): Name of the component type
- `initFunction` (Function): Function that initializes the component. Receives `element`, `context`, and `options` parameters

### Utility Methods

#### `log(...args)`

Logs debug messages when debug is enabled.

#### `warn(...args)`

Logs warning messages.

#### `error(...args)`

Logs error messages.

## Usage Examples

### Basic Usage - Finding Elements

```javascript
document.addEventListener("DOMContentLoaded", function() {
    const shadowKit = new ShadowDomKit({ debug: true });

    // Find an element in Shadow DOM by ID
    const result = shadowKit.findElementById('my-element');
    if (result) {
        console.log('Found element:', result.element);
        console.log('In context:', result.context);

        // You can now manipulate the element
        result.element.textContent = 'Updated content';
    }

    // Find multiple elements by selector
    const results = shadowKit.findElementsBySelector('.card');
    results.forEach(({ element, context }) => {
        console.log('Found card:', element);
    });
});
```

### Using Custom Initialization Function

```javascript
// Initialize a datepicker component
shadowKit.initComponent({
    selector: '.datepicker',
    customInit: (element, context, options) => {
        const picker = new Pikaday({
            field: element,
            format: options.format || 'YYYY-MM-DD',
            onSelect: options.onSelect
        });

        return picker;
    },
    options: {
        format: 'MM/DD/YYYY',
        onSelect: (date) => console.log('Selected:', date)
    }
});
```

### Registering and Using Custom Component Types

```javascript
// Register a chart component type
shadowKit.registerComponentType('chart', (element, context, options) => {
    return new Chart(element, {
        type: options.type || 'bar',
        data: options.data || {},
        options: options.chartOptions || {}
    });
});

// Register a custom dropdown component
shadowKit.registerComponentType('dropdown', (element, context, options) => {
    return new CustomDropdown(element, {
        items: options.items || [],
        multiSelect: options.multiSelect || false,
        onChange: options.onChange
    });
});

// Use the registered component types
shadowKit.initComponent({
    elementId: 'sales-chart',
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

shadowKit.initComponent({
    elementId: 'status-dropdown',
    componentType: 'dropdown',
    options: {
        items: ['Active', 'Pending', 'Completed'],
        onChange: (value) => console.log('Status changed:', value)
    }
});
```

### Working with Multiple Components

```javascript
// Initialize multiple components in parallel
Promise.all([
    shadowKit.initComponent({
        elementId: 'chart-1',
        componentType: 'chart'
    }),
    shadowKit.initComponent({
        elementId: 'dropdown-1',
        componentType: 'dropdown'
    }),
    shadowKit.initComponent({
        selector: '.datepickers',
        customInit: (el) => new Pikaday({ field: el })
    })
])
.then(results => {
    console.log('All components initialized:', results);
})
.catch(error => {
    console.error('Error initializing components:', error);
});
```

### Working with Modal Dialogs

```javascript
// Register a modal component
shadowKit.registerComponentType('modal', (element, context, options) => {
    const openButton = context.querySelector(options.openButtonSelector);
    const closeButton = element.querySelector(options.closeButtonSelector);

    openButton?.addEventListener('click', () => {
        element.classList.add('open');
    });

    closeButton?.addEventListener('click', () => {
        element.classList.remove('open');
    });

    return {
        open: () => element.classList.add('open'),
        close: () => element.classList.remove('open')
    };
});

// Initialize modal
shadowKit.initComponent({
    elementId: 'my-modal',
    componentType: 'modal',
    options: {
        openButtonSelector: '#open-modal-btn',
        closeButtonSelector: '.close-btn'
    }
}).then(modal => {
    // You can control the modal programmatically
    setTimeout(() => modal.open(), 3000);
});
```

## Advanced Usage

### Working with Dynamic Content

```javascript
// Function to initialize components when content is loaded dynamically
function initDynamicComponents() {
    shadowKit.initComponent({
        elementId: 'dynamic-component',
        componentType: 'custom-widget',
        // Increase delay for dynamic content
        delay: 500
    });
}

// Add event listener for content loading
document.addEventListener('content-loaded', initDynamicComponents);

// Or call after AJAX completes
fetch('/api/content')
    .then(response => response.json())
    .then(data => {
        // Update DOM with new content
        document.getElementById('container').innerHTML = data.html;

        // Initialize components in new content
        initDynamicComponents();
    });
```

### Creating a Plugin for React

```javascript
// Example React Hook
import { useState, useCallback, useEffect } from 'react';

function useShadowDomKit(options = {}) {
    const [shadowKit] = useState(() => new ShadowDomKit({
        debug: options.debug || false
    }));

    const initComponent = useCallback((config) => {
        return shadowKit.initComponent(config);
    }, [shadowKit]);

    const findElement = useCallback((id) => {
        return shadowKit.findElementById(id);
    }, [shadowKit]);

    return { shadowKit, initComponent, findElement };
}

// Usage in a React component
function MyComponent() {
    const { initComponent } = useShadowDomKit({ debug: true });

    useEffect(() => {
        initComponent({
            elementId: 'my-widget',
            customInit: (element, context, options) => {
                return new CustomWidget(element, options);
            },
            options: { theme: 'dark' }
        });
    }, [initComponent]);

    return <div id="my-widget">...</div>;
}
```

### Creating a Plugin for Vue

```javascript
// Vue 3 Composable
import { onMounted, ref } from 'vue';

export function useShadowDomKit(options = {}) {
    const shadowKit = ref(new ShadowDomKit(options));
    const isReady = ref(false);

    onMounted(() => {
        isReady.value = true;
    });

    const initComponent = async (config) => {
        if (!isReady.value) {
            await new Promise(resolve => {
                const interval = setInterval(() => {
                    if (isReady.value) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 50);
            });
        }
        return shadowKit.value.initComponent(config);
    };

    return {
        shadowKit: shadowKit.value,
        initComponent
    };
}

// Usage in Vue component
export default {
    setup() {
        const { initComponent } = useShadowDomKit({ debug: true });

        onMounted(() => {
            initComponent({
                elementId: 'my-widget',
                componentType: 'custom-widget'
            });
        });
    }
}
```

### Integrating with Third-Party Libraries

```javascript
// Example: Integrating with Choices.js (select dropdown library)
shadowKit.registerComponentType('select-enhanced', (element, context, options) => {
    return new Choices(element, {
        searchEnabled: options.searchEnabled !== false,
        removeItemButton: options.removeItems || false,
        ...options.choicesOptions
    });
});

// Example: Integrating with Sortable.js (drag and drop)
shadowKit.registerComponentType('sortable-list', (element, context, options) => {
    return new Sortable(element, {
        animation: 150,
        onEnd: options.onEnd,
        ...options.sortableOptions
    });
});

// Example: Integrating with Quill (rich text editor)
shadowKit.registerComponentType('rich-editor', (element, context, options) => {
    return new Quill(element, {
        theme: options.theme || 'snow',
        modules: options.modules || {
            toolbar: [['bold', 'italic'], ['link', 'image']]
        }
    });
});
```

## Troubleshooting

### Common Issues and Solutions

#### Component Not Found

**Problem**: `Element with ID "my-element" not found in any DOM context.`

**Solutions**:
- Verify the element ID is correct
- Increase the `searchDelay` option to give more time for the DOM to load
- Check if the element is dynamically created after initialization
- Use browser DevTools to verify the element exists in the Shadow DOM

#### Component Library Not Available

**Problem**: Component initialization fails because the library is not loaded

**Solutions**:
- Ensure the component library is loaded before ShadowDomKit initialization
- Check for any JavaScript errors that might prevent the library from loading
- Use browser console to verify the library is available in the global scope
- Consider wrapping initialization in a check: `if (typeof MyLibrary !== 'undefined')`

#### Shadow DOM Not Accessible

**Problem**: Elements inside Shadow DOM can't be found even though they exist

**Solutions**:
- Check if the Shadow DOM is closed (mode: 'closed') - closed Shadow DOM is not accessible
- Ensure there are no Cross-Origin restrictions
- Verify the Shadow DOM is fully initialized before searching
- Use `debug: true` to see detailed search logs

#### Timing Issues

**Problem**: Components initialize before the DOM is ready

**Solutions**:
- Increase the `searchDelay` option
- Use `delay` parameter in `initComponent` for specific components
- Wrap initialization in `DOMContentLoaded` or framework lifecycle hooks
- Consider using MutationObserver for truly dynamic content

### Debugging

Enable debug mode to see detailed logs:

```javascript
const shadowKit = new ShadowDomKit({ debug: true });
```

This will output detailed information about:
- Element search process
- Shadow DOM traversal
- Component initialization
- Any errors or warnings encountered

## Best Practices

### Performance Optimization

1. **Be Specific with Selectors**: Use IDs instead of complex CSS selectors when possible
2. **Cache Results**: Store results of `findElementById` if you need to reference the same element multiple times
3. **Batch Initializations**: Use `Promise.all` with multiple `initComponent` calls
4. **Register Component Types**: Use `registerComponentType` instead of repeating `customInit` functions

```javascript
// Good - Register once, use many times
shadowKit.registerComponentType('dropdown', initDropdown);

// Bad - Repeating the same initialization function
shadowKit.initComponent({ elementId: 'dd1', customInit: initDropdown });
shadowKit.initComponent({ elementId: 'dd2', customInit: initDropdown });
```

### Component Organization

1. **Register All Component Types Early**: Register custom component types at application startup
2. **Use Consistent Naming**: Establish a convention for component type names (e.g., 'chart', 'modal', 'dropdown')
3. **Document Component Options**: Maintain documentation for the options each component type accepts
4. **Create a Component Registry**: Keep all component registrations in one central file

```javascript
// components.js - Central registry
export function registerAllComponents(shadowKit) {
    shadowKit.registerComponentType('chart', initChart);
    shadowKit.registerComponentType('modal', initModal);
    shadowKit.registerComponentType('dropdown', initDropdown);
    shadowKit.registerComponentType('datepicker', initDatepicker);
}

// app.js
import { registerAllComponents } from './components.js';
const shadowKit = new ShadowDomKit({ debug: true });
registerAllComponents(shadowKit);
```

### Integration Tips

1. **CMS Integration**: For WordPress, Drupal, or other CMS platforms, wrap ShadowDomKit in a dedicated plugin/module
2. **Framework Integration**: Create custom hooks (React), composables (Vue), or services (Angular)
3. **Build Process**: Include ShadowDomKit in your build process to ensure single version
4. **Error Handling**: Always use `.catch()` with `initComponent` to handle failures gracefully
5. **TypeScript**: Consider creating type definitions for better IDE support

### Security Considerations

1. **Validate Inputs**: Always validate options passed to component initializers
2. **Sanitize Content**: If injecting HTML, ensure it's properly sanitized
3. **Cross-Origin**: Be aware of cross-origin restrictions when working with iframes
4. **Closed Shadow DOM**: Respect closed Shadow DOM boundaries - they exist for security reasons

---

## Contributing

ShadowDomKit is open for contributions! Whether it's bug fixes, new features, or documentation improvements, all contributions are welcome.

## License

MIT License

## Support

For issues, questions, or feature requests, please visit the GitHub repository.
