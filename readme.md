# 🎯 ShadowDomKit

A lightweight, framework-agnostic JavaScript utility for working with Shadow DOM.

**Zero dependencies. Works anywhere. Use with any framework or library.**

---

## 🚀 Quick Start

```html
<!-- Include the script -->
<script src="ShadowDomKit.js"></script>

<script>
  // Initialize
  const shadowKit = new ShadowDomKit({ debug: true });

  // Find elements in Shadow DOM
  const result = shadowKit.findElementById('my-element');
  console.log(result.element);
</script>
```

That's it! You can now find and work with elements inside Shadow DOM.

---

## 📚 Examples

**[View Interactive Examples →](examples/)**

We have ready-to-run HTML examples:

- **[01-basic-usage.html](examples/01-basic-usage.html)** - Finding elements in Shadow DOM
- **[02-custom-component.html](examples/02-custom-component.html)** - Building custom components
- **[03-modal-dialog.html](examples/03-modal-dialog.html)** - Creating a modal dialog
- **[04-multiple-components.html](examples/04-multiple-components.html)** - Working with multiple components

Just open any example in your browser and see ShadowDomKit in action!

---

## 🎓 Simple Tutorial

### Step 1: Find Elements

```javascript
const shadowKit = new ShadowDomKit();

// Find by ID across all Shadow DOM boundaries
const result = shadowKit.findElementById('my-button');

if (result) {
  console.log('Found:', result.element);
  console.log('Context:', result.context); // The ShadowRoot or Document
}

// Find multiple elements by selector
const results = shadowKit.findElementsBySelector('.card');
results.forEach(({ element, context }) => {
  console.log('Found card:', element);
});
```

### Step 2: Register Your Components

```javascript
// Register a component type once
shadowKit.registerComponentType('counter', (element, context, options) => {
  let count = options.startValue || 0;

  element.textContent = count;
  element.addEventListener('click', () => {
    count++;
    element.textContent = count;
  });

  return { count };
});
```

### Step 3: Initialize Components

```javascript
// Use your registered component anywhere
shadowKit.initComponent({
  elementId: 'my-counter',
  componentType: 'counter',
  options: { startValue: 0 }
})
.then(counter => {
  console.log('Counter initialized!');
})
.catch(error => {
  console.error('Failed:', error);
});
```

---

## 🛠️ API Reference

### Creating an Instance

```javascript
const shadowKit = new ShadowDomKit({
  debug: false,      // Enable console logging
  searchDelay: 300   // Wait time before searching (ms)
});
```

### Core Methods

#### `findElementById(elementId, root)`

Find an element by ID anywhere in the DOM, including Shadow DOM.

```javascript
const result = shadowKit.findElementById('my-element');
// Returns: { element: HTMLElement, context: ShadowRoot|Document } or null
```

#### `findElementsBySelector(selector, root)`

Find all elements matching a selector, including those in Shadow DOM.

```javascript
const results = shadowKit.findElementsBySelector('.card');
// Returns: Array of { element, context } objects
```

#### `registerComponentType(typeName, initFunction)`

Register a component type that can be reused.

```javascript
shadowKit.registerComponentType('modal', (element, context, options) => {
  // Your initialization code
  return { /* your component API */ };
});
```

#### `initComponent(config)`

Initialize a component inside Shadow DOM.

```javascript
shadowKit.initComponent({
  elementId: 'my-element',        // ID to find (required if no selector)
  selector: '.my-class',          // Selector to find (alternative to elementId)
  componentType: 'modal',         // Registered type (required if no customInit)
  customInit: (el, ctx, opts) => {}, // Custom init function (alternative to componentType)
  options: { /* ... */ },         // Options passed to your component
  delay: 300                      // Custom delay (optional)
});
```

---

## 💡 Real-World Examples

### Example 1: Simple Counter

```javascript
shadowKit.registerComponentType('counter', (element, context, options) => {
  let count = 0;
  const display = element.querySelector('.count');
  const btnInc = element.querySelector('.btn-inc');
  const btnDec = element.querySelector('.btn-dec');

  btnInc.addEventListener('click', () => {
    count++;
    display.textContent = count;
  });

  btnDec.addEventListener('click', () => {
    count--;
    display.textContent = count;
  });

  return { getCount: () => count };
});

// Use it
shadowKit.initComponent({
  elementId: 'counter-widget',
  componentType: 'counter'
});
```

### Example 2: Modal Dialog

```javascript
shadowKit.registerComponentType('modal', (element, context, options) => {
  const modal = element;
  const closeBtn = context.querySelector('.close-btn');

  const api = {
    open: () => modal.classList.add('open'),
    close: () => modal.classList.remove('open')
  };

  closeBtn.addEventListener('click', api.close);

  return api;
});

// Use it
shadowKit.initComponent({
  elementId: 'my-modal',
  componentType: 'modal'
}).then(modal => {
  // Control the modal
  document.getElementById('open-btn').addEventListener('click', () => {
    modal.open();
  });
});
```

### Example 3: Tabs Component

```javascript
shadowKit.registerComponentType('tabs', (element, context, options) => {
  const buttons = context.querySelectorAll('.tab-btn');
  const contents = context.querySelectorAll('.tab-content');

  function showTab(index) {
    buttons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
    contents.forEach((content, i) => {
      content.style.display = i === index ? 'block' : 'none';
    });
  }

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => showTab(i));
  });

  showTab(0); // Show first tab
  return { showTab };
});
```

### Example 4: Multiple Components at Once

```javascript
// Initialize multiple components in parallel
Promise.all([
  shadowKit.initComponent({ elementId: 'modal-1', componentType: 'modal' }),
  shadowKit.initComponent({ elementId: 'tabs-1', componentType: 'tabs' }),
  shadowKit.initComponent({ elementId: 'counter-1', componentType: 'counter' })
])
.then(([modal, tabs, counter]) => {
  console.log('All components ready!');
});
```

---

## 🎨 Framework Integration

### React

```javascript
import { useState, useEffect } from 'react';

function useComponent(config) {
  const [component, setComponent] = useState(null);

  useEffect(() => {
    const shadowKit = new ShadowDomKit();
    shadowKit.initComponent(config).then(setComponent);
  }, []);

  return component;
}

// Usage
function MyComponent() {
  const modal = useComponent({
    elementId: 'my-modal',
    componentType: 'modal'
  });

  return <div id="my-modal">...</div>;
}
```

### Vue

```javascript
export default {
  mounted() {
    const shadowKit = new ShadowDomKit();
    shadowKit.initComponent({
      elementId: 'my-modal',
      componentType: 'modal'
    }).then(modal => {
      this.modal = modal;
    });
  }
}
```

### Vanilla JavaScript

```javascript
document.addEventListener('DOMContentLoaded', () => {
  const shadowKit = new ShadowDomKit({ debug: true });

  // Register all your components
  shadowKit.registerComponentType('modal', initModal);
  shadowKit.registerComponentType('tabs', initTabs);
  shadowKit.registerComponentType('counter', initCounter);

  // Initialize them
  shadowKit.initComponent({ elementId: 'app-modal', componentType: 'modal' });
  shadowKit.initComponent({ elementId: 'app-tabs', componentType: 'tabs' });
});
```

---

## 🔧 Use Cases

- **Web Components** - Find and initialize elements inside custom elements
- **WordPress Plugins** - Work with Shadow DOM in block editor
- **Browser Extensions** - Access Shadow DOM in injected content
- **Component Libraries** - Initialize third-party components in Shadow DOM
- **Dynamic Content** - Handle components loaded via AJAX/fetch
- **Micro-frontends** - Manage isolated component trees

---

## 🐛 Troubleshooting

### Element Not Found

**Problem:** `Element with ID "my-element" not found`

**Solutions:**
- Check the element ID is correct
- Increase `searchDelay` to wait for DOM to load
- Use `debug: true` to see search logs

```javascript
const shadowKit = new ShadowDomKit({
  debug: true,
  searchDelay: 500  // Wait longer
});
```

### Component Won't Initialize

**Problem:** Component initialization fails

**Solutions:**
- Make sure the element exists before calling `initComponent`
- Check if you registered the component type
- Use `.catch()` to see the error

```javascript
shadowKit.initComponent({
  elementId: 'my-element',
  componentType: 'modal'
})
.catch(error => {
  console.error('Failed:', error);
});
```

### Shadow DOM is Closed

**Problem:** Can't access closed Shadow DOM

**Solution:** Closed Shadow DOM (`mode: 'closed'`) cannot be accessed by JavaScript. Use `mode: 'open'` instead:

```javascript
// Good
element.attachShadow({ mode: 'open' });

// Can't be accessed
element.attachShadow({ mode: 'closed' });
```

---

## ⚡ Best Practices

### 1. Register Components Early

```javascript
// Good - Register at startup
const shadowKit = new ShadowDomKit();
shadowKit.registerComponentType('modal', initModal);
shadowKit.registerComponentType('tabs', initTabs);

// Bad - Repeating custom functions
shadowKit.initComponent({ elementId: 'modal-1', customInit: initModal });
shadowKit.initComponent({ elementId: 'modal-2', customInit: initModal });
```

### 2. Use IDs for Better Performance

```javascript
// Good - Fast lookup
shadowKit.findElementById('my-element');

// Slower - Has to traverse more
shadowKit.findElementsBySelector('#my-element');
```

### 3. Handle Errors

```javascript
// Always use .catch()
shadowKit.initComponent(config)
  .then(component => { /* success */ })
  .catch(error => { /* handle error */ });
```

### 4. Enable Debug During Development

```javascript
const shadowKit = new ShadowDomKit({
  debug: process.env.NODE_ENV === 'development'
});
```

---

## 📦 Installation

### Direct Download

Download `ShadowDomKit.js` and include it:

```html
<script src="path/to/ShadowDomKit.js"></script>
```

### ES6 Module

```javascript
import ShadowDomKit from './ShadowDomKit.js';
```

### CommonJS

```javascript
const ShadowDomKit = require('./ShadowDomKit.js');
```

---

## 🤝 Contributing

Contributions are welcome! Whether it's:
- Bug fixes
- New features
- Documentation improvements
- Example additions

Feel free to open issues and pull requests.

---

## 📄 License

MIT License - use it anywhere, for anything!

---

## 🌟 Why ShadowDomKit?

Shadow DOM is powerful but can be tricky to work with. ShadowDomKit solves this by:

- ✅ **Simple API** - Just a few methods to learn
- ✅ **No Dependencies** - Pure JavaScript, works anywhere
- ✅ **Framework Agnostic** - Use with React, Vue, Angular, or vanilla JS
- ✅ **Lightweight** - Tiny footprint, big functionality
- ✅ **Well Documented** - Lots of examples and clear docs
- ✅ **Production Ready** - Tested and reliable

---

**[View Examples →](examples/)** | **[GitHub →](https://github.com/ssanaullahrais/shadow-dom-kit)**

Made with ❤️ for the web development community
