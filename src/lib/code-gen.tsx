// @/lib/code-gen.ts
import type { Node, Nodes } from '@craftjs/core';

let imports: { displayName: string; importPath: string }[] = [];

const generateComponentCode = (
  nodesMap: Nodes,
  nodeId: string,
  level: number,
  generatedCodes: Record<string, string> 
): string => {
  const node = nodesMap[nodeId];
  
  if (!node || !node.data) {
    console.warn(`Node or node.data is undefined for nodeId: ${nodeId}`);
    return '';
  }

  const { displayName, props, nodes, linkedNodes, custom } = node.data;

  const componentName = displayName || 'UnknownComponent';

  const indentation = getIndentation(level);

  // Special handling for AI Code Generator
  if (componentName === 'AI Code Generator') {
    console.log('generatedCodes ', generatedCodes);
    const id = props.id || '';
    const generatedCode = generatedCodes[id] || '';
    const defaultCode = props.defaultCode || '';
    const code = generatedCode || defaultCode || '// No code available';
    return `${indentation}<CodeGenerator id="${id}">\n${indentation}  {\`${code.replace(/`/g, '\\`')}\`}\n${indentation}</CodeGenerator>`;
  }

  const openingTag = `<${componentName}${generatePropsString(props || {})}>`;
  const closingTag = `</${componentName}>`;

  if (custom && custom.importPath) {
    if (!imports.find((item) => item.displayName === componentName)) {
      imports.push({
        displayName: componentName,
        importPath: custom.importPath,
      });
    }
  }

  let content = generateChildString(props?.children, level + 1);

  if (!nodes || nodes.length === 0 && (!linkedNodes || Object.keys(linkedNodes).length === 0)) {
    // No child nodes, return the tag with content
    return `${indentation}${openingTag}${content}${closingTag}`;
  } else {
    // Has child nodes, recursively generate code for children
    const childComponents = nodes ? nodes.map((childId) =>
      generateComponentCode(nodesMap, childId, level + 1, generatedCodes)
    ) : [];
  
    const childComponentsString = childComponents.length
      ? `\n${childComponents.join(`\n`)}`
      : '';
  
    const linkedChildComponents = linkedNodes ? Object.entries(linkedNodes).map(
      ([key, value]) => generateComponentCode(nodesMap, value, level + 1, generatedCodes)
    ) : [];
  
    const linkedChildComponentsString = linkedChildComponents.length
      ? `\n${linkedChildComponents.join(`\n`)}`
      : '';
  
    return `${indentation}${openingTag}${content}${childComponentsString}${linkedChildComponentsString}\n${indentation}${closingTag}`;
  }
};


interface ComponentInfo {
  displayName: string;
  importPath: string;
}

const generateImportStatements = (components: ComponentInfo[]): string => {
  const filteredComponents = components.filter(
    (comp) => comp.displayName !== 'div'
  );

  const groupedComponents: { [key: string]: ComponentInfo[] } = {};

  // Group components by import path
  filteredComponents.forEach((comp) => {
    const key = comp.importPath || ''; // Use an empty string for components without a path
    if (!groupedComponents[key]) {
      groupedComponents[key] = [];
    }
    groupedComponents[key].push(comp);
  });

  // Generate import statements
  const importStatements = Object.values(groupedComponents).map((group) => {
    const displayNameList = group.map((comp) => comp.displayName).join(', ');
    const importPath = group[0].importPath
      ? ` from "${group[0].importPath}"`
      : '';
    return `import { ${displayNameList} }${importPath};`;
  });

  return importStatements.join('\n');
};

function wrapInsideComponent(input: string): string {
  return `
export function Component() {
  return (
    ${input.trim().replace(/^/gm, '  ')}
  );
}
  `.trim();
}

const generatePropsString = (props: {
  [key: string]: string | undefined;

}): string => {
  const propsArray = Object.entries(props)
    .filter(([key]) => key !== 'children') // Exclude children from props
    .map(([key, value]) => `${key}="${value}"`);
  return propsArray.length > 0 ? ` ${propsArray.join(' ')}` : '';
};

const getIndentation = (level: number): string => {
  return ' '.repeat(level * 2); // Adjust the number of spaces per level as needed
};

const generateChildString = (
  children: string | Node[] | undefined,
  level: number
): string => {
  if (typeof children === 'string') {
    // If children is a string, return it directly
    return children;
  } else if (Array.isArray(children) && children.length > 0) {
    return children
      .map((child) => {
        if (typeof child === 'string') {
          return child;
        } else if (child && typeof child === 'object') {
          return generateComponentCode({ TEMP: child } as Nodes, 'TEMP', level, {});
        }
        return '';
      })
      .join('');
  } else {
    return '';
  }
};

export const getOutputCode = (nodes: Nodes, generatedCodes: Record<string, string>) => {
  imports = [];

  console.log('nodes ', nodes);
  const componentString = generateComponentCode(nodes, 'ROOT', 2, generatedCodes);
  let importString = generateImportStatements(imports);
  
  // Add import for CodeGenerator
  importString += "\nimport { CodeGenerator } from '@/components/codeGenerator';";

  const output = wrapInsideComponent(componentString);
  // console.log(generateImportStatements(imports));
  // console.log('imports ', imports);
  // console.log('output ', output);

  return { importString, output };
};

export const getOutputHTMLFromId = (iframeId: string): string => {
  const iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
  const iframeDocument = iframe?.contentWindow?.document || null;

  if (iframeDocument) {
    const indentation = '  '; // Adjust the indentation as needed
    const iframeHtml = iframeDocument.documentElement.outerHTML;
    const indentedHtml = iframeHtml.replace(/^(.*)$/gm, indentation + '$1');

    return indentedHtml;
  } else {
    alert('Failed to access iframe content.');
    return '';
  }
};
