// Global type definitions for SVG imports
// This file is explicitly included in tsconfig.json

declare module '*.svg' {
    const content: any;
    export default content;
}

declare module '*.svg?url' {
    const content: any;
    export default content;
}
