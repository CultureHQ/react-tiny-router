import React from "react";

const matchPath = (templatePath, currentPath, currentSegments) => {
  if (templatePath.includes(":")) {
    const templateSegments = templatePath.split("/").filter(Boolean);

    const props = {};
    const matched = templateSegments.every((templateSegment, index) => {
      if (!templateSegment.startsWith(":")) {
        return templateSegment === currentSegments[index];
      }

      props[templateSegment.slice(1)] = currentSegments[index];
      return true;
    });

    return matched && { props };
  } else if (templatePath === currentPath) {
    return { props: {} };
  }

  return false;
};

const findMatch = (children, currentPath) => {
  let matchData;

  const currentSegments = currentPath.split("/").filter(Boolean);
  const matchedIndex = children.findIndex((child, index) => (
    matchData = (
      (index !== children.length - 1) &&
      matchPath(child.props.path, currentPath, currentSegments)
    )
  ));

  if (matchedIndex !== -1) {
    return React.cloneElement(children[matchedIndex], matchData.props);
  }

  return children[children.length - 1];
};

export default findMatch;
