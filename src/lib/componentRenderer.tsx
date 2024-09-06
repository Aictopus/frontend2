// @/lib/componentRenderer.tsx
import React from 'react';
import { Element } from '@craftjs/core';
import { ResizableComponent } from '@/components/resizableComponent';
import { DynamicContent } from '@/components/dynamicContent';
import { componentMap } from '@/lib/component-map'
import { renderToString } from 'react-dom/server';

function parseProps(attributesString) {
  const props = {};
  if (attributesString) {
    const attributeRegex = /(\w+)=(?:{([^}]*)}|"([^"]*)"|'([^']*)')/g;
    let attributeMatch;
    while ((attributeMatch = attributeRegex.exec(attributesString))) {
      const [, name, jsValue, doubleQuotedValue, singleQuotedValue] = attributeMatch;
      if (name === 'className') {
        props[name] = `${props[name] || ''} ${jsValue || doubleQuotedValue || singleQuotedValue}`.trim();
      } else {
        props[name] = jsValue || doubleQuotedValue || singleQuotedValue;
      }
    }
  }
  return props;
}

type ChildProps = {
  id?: string;
  // other props...
};

function createComponent(name, props, children) {
  let Component = componentMap[name];
  if (Component) {
    if (Component === ResizableComponent) {
      return (
        <Element
          key={Math.random()}
          is={ResizableComponent}
          canvas
          {...props}
        >
          {React.Children.map(children, child =>
            React.isValidElement(child)
              ? React.cloneElement(child, { id: props.id } as ChildProps)
              : child
          )}
        </Element>
      );
    } else if (Component === DynamicContent) {
      console.log('Creating DynamicContent');
      return (
        <Element
          key={Math.random()}
          is={DynamicContent}
          canvas
          {...props}
        >
          {children}
        </Element>
      );
    }
    else if (name === 'CodeGenerator') {
      // Special handling for CodeGenerator
      const codeContent = children.reduce((acc, child) => {
        if (typeof child === 'string') {
          return acc + child;
        } else if (React.isValidElement(child)) {
          return acc + renderToString(child);
        }
        return acc;
      }, '');
      return <Element key={Math.random()} is={Component} canvas {...props} defaultCode={codeContent}>{children}</Element>;
    }
    else {
      return <Element key={Math.random()} is={Component} canvas {...props}>{children}</Element>;
    }
  } else {
    // Handle native HTML elements
    const processedChildren = children.map(child => {
      if (React.isValidElement(child)) {
        return child;
      } else if (typeof child === 'string') {
        return child;
      } else if (Array.isArray(child)) {
        return child.map(subChild => createComponent(subChild.type, subChild.props, subChild.props.children));
      } else if (typeof child === 'object' && child !== null) {
        return createComponent(child.type, child.props, child.props.children);
      }
      return null;
    }).filter(child => child !== null);
    console.log(`Creating component: ${name}`, processedChildren);
    return React.createElement(name, { key: Math.random(), ...props }, ...processedChildren);
  }
}

export function renderComponents(componentsString) {
  const regex = /<(\w+)(\s[^>]*)?>(.*?)<\/\1>|<(\w+)(\s[^>]*)?\/>|([^<]+)/gs;
  const components = [];

  let match;
  while ((match = regex.exec(componentsString))) {
    const [, componentName, attributes, children, selfClosingName, selfClosingAttributes, textContent] = match;

    if (componentName || selfClosingName) {
      const name = componentName || selfClosingName;
      const props = parseProps(attributes || selfClosingAttributes);
      console.log(`Creating component: ${name}`);

      let childComponents = [];
      if (children) {
        childComponents = renderComponents(children);
      }

      components.push(createComponent(name, props, childComponents));
    } else if (textContent) {
      components.push(textContent.trim());
    }
  }

  return components;
}