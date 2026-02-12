/// <reference types="vite/client" />
import 'react';

declare global {
    namespace JSX {
        type Element = React.JSX.Element;
        type IntrinsicElements = React.JSX.IntrinsicElements;
        type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
        type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
    }
}
