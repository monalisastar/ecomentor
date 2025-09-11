import * as ReactDOM from "react-dom";

// Add findDOMNode back if missing (React 18 removed it)
if (!(ReactDOM as any).findDOMNode) {
  (ReactDOM as any).findDOMNode = () => null;
}

export {};
