import React from 'react';

/**
 * Attaches subcomponents to a parent component for use in
 * composed components. Example:
 *
 * <Parent>
 *    <Parent.Title>abc</Parent.Title>
 *    <Parent.Body prop1="foobar"/>
 * </Parent>
 *
 *
 * This function also sets displayname on the parent component
 * and all children component, and has the correct return type
 * for typescript.
 *
 * @param displayName topLevelComponent's displayName
 * @param topLevelComponent the parent element of the composed component
 * @param otherComponents an object of child components (keys are the names of the child components)
 * @returns the top level component with otherComponents as static properties
 */
export function attachSubComponents<
  C extends React.FC<any>,
  O extends Record<string, React.ComponentType<any>>
>(displayName: string, topLevelComponent: C, otherComponents: O): C & O {
  topLevelComponent.displayName = displayName;
  Object.entries(otherComponents).forEach(([key, component]) => {
    component.displayName = `${displayName}.${key}`;
  });

  return Object.assign(topLevelComponent, otherComponents);
}
