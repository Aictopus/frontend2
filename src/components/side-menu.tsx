// @/components/side-menu.tsx
import React, { ReactElement, ReactNode, useState, useEffect } from 'react';
import {
  NavigationMenuLink,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuViewport,
} from '@/components/ui/vertical-navigation-menu';
import { cn } from '@/lib/utils';
import { useEditor, Element } from '@craftjs/core';
import { Components } from '@/components/node/components-map';
import { Button } from '@/components/ui/button';
import { renderComponents } from '@/lib/componentRenderer';
import { componentMap } from '@/lib/component-map';

export interface SideMenuProps {
  componentsMap: Components[];
  pages: { id: string; componentStrings: string[] }[];
  currentPageIndex: number;
  onPageChange: (index: number) => void;
}

// Updated createCraftElement function
const createCraftElement = (component, useCraftElement = true) => {
  if (typeof component !== 'object' || component === null) {
    return component;
  }

  const { type, props } = component;
  const Component = componentMap[type] || type;

  if (!Component) {
    console.error(`Component type "${type}" not found in componentMap`);
    return null;
  }

  const componentProps = { ...props };

  if (props && props.children) {
    componentProps.children = Array.isArray(props.children)
      ? props.children.map((child) => createCraftElement(child, useCraftElement))
      : createCraftElement(props.children, useCraftElement);
  }

  if (useCraftElement) {
    return (
      <Element canvas is={Component} {...componentProps}>
        {componentProps.children}
      </Element>
    );
  } else {
    return <Component {...componentProps}>{componentProps.children}</Component>;
  }
};


export const SideMenu = ({
  componentsMap,
  pages,
  currentPageIndex,
  onPageChange,
}: SideMenuProps) => {
  const { connectors } = useEditor();

  return (
<div className="flex flex-col border-r h-full">
      {/* 页面切换按钮 */}
      <div className="p-2 border-b">
        <div className="flex flex-wrap gap-2">
          {pages.map((page, index) => (
            <button
              key={page.id}
              onClick={() => onPageChange(index)}
              className={cn(
                'p-2 border rounded',
                currentPageIndex === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              )}
            >
              Page {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 现有的 SideMenu 内容 */}
      {/* <NavigationMenu
        orientation="vertical"
        className="justify-start items-start"
      >
        <NavigationMenuList className="flex-col w-36">
          {componentsMap.map((menuItem, index) => (
            <NavigationMenuItem key={index} className="p-2">
              <NavigationMenuTrigger className="flex justify-between w-full">
                {menuItem.name}
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-full">
                <ul className="w-full">
                  {menuItem.items.map((component, idx) => (
                    <ListItem
                      key={idx}
                      ref={(ref) => {
                        if (ref) {
                          connectors.create(ref, component.node);
                        }
                      }}
                    >
                      {component.demo ? component.demo : component.name}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
        <NavigationMenuViewport className="w-48 left-1 border-r shadow-none" />
      </NavigationMenu> */}

{/* 使用 flex-grow 填充中间的空白区域 */}
<div className="flex-grow overflow-auto p-2">
        {/* 您可以在这里添加其他内容 */}
      </div>

      {/* 在侧边菜单底部添加对话框 */}
      <div className="p-4 border-t">
        <div className="h-64 flex flex-col">
          <textarea
            className="flex-grow overflow-auto p-2 border rounded resize-none"
            placeholder="Please enter..."
          ></textarea>
          <button className="mt-2 p-2 bg-blue-500 text-white rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ListItem 组件保持不变

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, children, ...props }, ref) => {
  return (
    <li className="w-full p-2">
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block w-full select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
            className
          )}
          {...props}
        >
          <div className="text-sm w-full font-medium leading-none">
            {children}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
