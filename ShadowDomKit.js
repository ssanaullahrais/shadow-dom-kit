/**
 * ShadowDomKit.js - A lightweight utility for working with components in Shadow DOM
 * 
 * This plugin makes it easy to:
 * 1. Find elements across Shadow DOM boundaries
 * 2. Initialize JS components that need to work inside Shadow DOM
 * 3. Provide a consistent API for working with Shadow DOM elements
 */

(function(global) {
    'use strict';

    /**
     * The main ShadowDomKit class that provides utility methods
     */
    class ShadowDomKit {
        /**
         * Create a new ShadowDomKit instance
         * @param {Object} options - Configuration options
         */
        constructor(options = {}) {
            this.options = {
                debug: options.debug || false,
                searchDelay: options.searchDelay || 300,
                ...options
            };
            
            this._initCallbacks = [];
            this.log('ShadowDomKit initialized with options:', this.options);
        }

        /**
         * Log messages when debug is enabled
         * @param {...any} args - Arguments to log
         */
        log(...args) {
            if (this.options.debug) {
                console.log('🔍 [ShadowDomKit]', ...args);
            }
        }

        /**
         * Log warnings
         * @param {...any} args - Arguments to log
         */
        warn(...args) {
            console.warn('⚠️ [ShadowDomKit]', ...args);
        }

        /**
         * Log errors
         * @param {...any} args - Arguments to log
         */
        error(...args) {
            console.error('❌ [ShadowDomKit]', ...args);
        }

        /**
         * Find an element in the Shadow DOM by ID
         * @param {string} elementId - The ID of the element to find
         * @param {Document|ShadowRoot} root - The root to start searching from
         * @returns {Object|null} - Object containing the element and its context, or null if not found
         */
        findElementById(elementId, root = document) {
            this.log(`Searching for element with ID: ${elementId}`);
            return this._findInShadowDOM(elementId, root);
        }

        /**
         * Find elements that match a selector in the Shadow DOM
         * @param {string} selector - CSS selector to match
         * @param {Document|ShadowRoot} root - The root to start searching from
         * @returns {Array} - Array of objects containing matching elements and their contexts
         */
        findElementsBySelector(selector, root = document) {
            this.log(`Searching for elements with selector: ${selector}`);
            const results = [];
            this._findAllInShadowDOM(selector, root, results);
            return results;
        }

        /**
         * Initialize a component that exists within Shadow DOM
         * @param {Object} config - Component configuration
         * @returns {Promise} - Promise that resolves when component is initialized
         */
        initComponent(config) {
            const {
                elementId,
                selector,
                componentType,
                options,
                customInit,
                delay = this.options.searchDelay
            } = config;
            
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    try {
                        let result;
                        
                        // Find the target element(s)
                        if (elementId) {
                            result = this.findElementById(elementId);
                            if (!result) {
                                this.warn(`Element with ID "${elementId}" not found in any DOM context.`);
                                reject(new Error(`Element with ID "${elementId}" not found`));
                                return;
                            }
                        } else if (selector) {
                            const results = this.findElementsBySelector(selector);
                            if (results.length === 0) {
                                this.warn(`No elements matching "${selector}" found in any DOM context.`);
                                reject(new Error(`No elements matching "${selector}" found`));
                                return;
                            }
                            result = results[0]; // Use the first match by default
                        } else {
                            this.error('Either elementId or selector must be provided');
                            reject(new Error('Either elementId or selector must be provided'));
                            return;
                        }
                        
                        this.log('Found element:', result.element);
                        
                        // Initialize the component
                        if (customInit && typeof customInit === 'function') {
                            // Use custom initialization function
                            const initResult = customInit(result.element, result.context, options);
                            resolve(initResult);
                        } else if (componentType) {
                            // Use built-in component initializers
                            const initResult = this._initializeByType(componentType, result.element, result.context, options);
                            resolve(initResult);
                        } else {
                            this.error('Either componentType or customInit must be provided');
                            reject(new Error('Either componentType or customInit must be provided'));
                        }
                    } catch (error) {
                        this.error('Error initializing component:', error);
                        reject(error);
                    }
                }, delay);
            });
        }

        /**
         * Register a custom component type for initialization
         * @param {string} typeName - Name of the component type
         * @param {Function} initFunction - Function to initialize the component
         */
        registerComponentType(typeName, initFunction) {
            if (typeof initFunction !== 'function') {
                this.error('Init function must be a function');
                return;
            }
            
            this._initCallbacks[typeName] = initFunction;
            this.log(`Registered component type: ${typeName}`);
        }

        /**
         * Initialize a Flowbite accordion
         * @param {HTMLElement} element - The accordion element
         * @param {ShadowRoot|Document} context - The DOM context
         * @param {Object} options - Accordion options
         * @returns {Object|null} - The initialized accordion instance or null
         */
        initFlowbiteAccordion(element, context, options = {}) {
            const accordionId = element.id;
            this.log(`Initializing Flowbite accordion: ${accordionId}`);
            
            // Helper function to find child elements
            const findElement = (selector) => {
                if (selector.includes(" ") || selector.includes(">")) {
                    return context.querySelector(selector);
                }
                if (selector.startsWith("#")) {
                    return context.getElementById(selector.substring(1));
                }
                return context.querySelector(selector);
            };
            
            // Create accordion items with dynamic ID generation
            const itemCount = options.itemCount || 3;
            const accordionItems = [];
            
            for (let i = 1; i <= itemCount; i++) {
                const item = {
                    id: `${accordionId}-heading-${i}`,
                    triggerEl: findElement(`#${accordionId}-heading-${i} button`),
                    targetEl: findElement(`#${accordionId}-body-${i}`),
                    active: i === 1 // First item active by default
                };
                
                if (options.activeItem === i) {
                    item.active = true;
                } else if (options.activeItem !== undefined && options.activeItem !== i) {
                    item.active = false;
                }
                
                accordionItems.push(item);
            }
            
            // Validate that all elements were found
            const missingElements = accordionItems.filter(item => !item.triggerEl || !item.targetEl);
            if (missingElements.length > 0) {
                this.warn("Some accordion elements could not be found:", missingElements);
            }
            
            // Default Flowbite options
            const accordionOptions = {
                alwaysOpen: options.alwaysOpen || false,
                activeClasses: options.activeClasses || "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
                inactiveClasses: options.inactiveClasses || "text-gray-500 dark:text-gray-400"
            };
            
            // Try to initialize using various methods
            try {
                // Method 1: Global Flowbite instance
                if (typeof flowbite !== "undefined" && typeof flowbite.Accordion !== "undefined") {
                    this.log("Initializing via global flowbite object");
                    return new flowbite.Accordion(element, accordionItems, accordionOptions);
                }
                
                // Method 2: Direct Accordion class
                if (typeof Accordion !== "undefined") {
                    this.log("Initializing via global Accordion class");
                    return new Accordion(element, accordionItems, accordionOptions);
                }
                
                // Method 3: Try window.Accordion
                if (typeof window !== "undefined" && typeof window.Accordion !== "undefined") {
                    this.log("Initializing via window.Accordion");
                    return new window.Accordion(element, accordionItems, accordionOptions);
                }
                
                this.warn("Flowbite Accordion API not found. Accordion may not be fully functional.");
                return null;
            } catch (error) {
                this.error("Error initializing accordion:", error);
                return null;
            }
        }

        // PRIVATE METHODS

        /**
         * Recursively find an element by ID in Shadow DOM
         * @private
         * @param {string} elementId - The ID to search for
         * @param {Document|ShadowRoot} root - The root to start searching from
         * @returns {Object|null} - Object containing the element and its context, or null if not found
         */
        _findInShadowDOM(elementId, root = document) {
            // First try direct lookup in current root
            const directMatch = root.getElementById(elementId);
            if (directMatch) return { element: directMatch, context: root };
            
            // Search through all child nodes with shadow roots
            const nodes = root.querySelectorAll("*");
            for (const node of nodes) {
                // Check if the node has a shadow root
                if (node.shadowRoot) {
                    // Try to find element in this shadow root
                    const found = node.shadowRoot.getElementById(elementId);
                    if (found) {
                        return { element: found, context: node.shadowRoot };
                    } else {
                        // Recursive search inside this shadow root
                        const nestedFound = this._findInShadowDOM(elementId, node.shadowRoot);
                        if (nestedFound) return nestedFound;
                    }
                }
            }
            return null;
        }

        /**
         * Recursively find all elements matching a selector in Shadow DOM
         * @private
         * @param {string} selector - CSS selector to match
         * @param {Document|ShadowRoot} root - The root to start searching from
         * @param {Array} results - Array to collect results
         */
        _findAllInShadowDOM(selector, root = document, results = []) {
            // Try direct query in current root
            const directMatches = root.querySelectorAll(selector);
            directMatches.forEach(element => {
                results.push({ element, context: root });
            });
            
            // Search through all child nodes with shadow roots
            const nodes = root.querySelectorAll("*");
            for (const node of nodes) {
                // Check if the node has a shadow root
                if (node.shadowRoot) {
                    // Find elements in this shadow root
                    this._findAllInShadowDOM(selector, node.shadowRoot, results);
                }
            }
        }

        /**
         * Initialize a component by its type
         * @private
         * @param {string} componentType - Type of the component to initialize
         * @param {HTMLElement} element - The target element
         * @param {ShadowRoot|Document} context - The DOM context
         * @param {Object} options - Component options
         * @returns {Object|null} - The initialized component instance or null
         */
        _initializeByType(componentType, element, context, options) {
            // Check for custom registered component type
            if (this._initCallbacks[componentType]) {
                return this._initCallbacks[componentType](element, context, options);
            }
            
            // Built-in component types
            switch (componentType.toLowerCase()) {
                case 'flowbite-accordion':
                case 'accordion':
                    return this.initFlowbiteAccordion(element, context, options);
                    
                // Add more built-in component initializers here
                
                default:
                    this.warn(`Unknown component type: ${componentType}`);
                    return null;
            }
        }
    }

    // Register as global object
    global.ShadowDomKit = ShadowDomKit;
    
    // Allow for AMD/CommonJS modules
    if (typeof define === 'function' && define.amd) {
        define([], function() { return ShadowDomKit; });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = ShadowDomKit;
    }

})(typeof window !== 'undefined' ? window : this);
