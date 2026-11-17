interface DomNode {
  id: string;
  classNames: string;
  children: WalkResult[];
}

type WalkResult = DomNode | { error: string };

export const walkDOM = (rootNode: Element | null): WalkResult => {
  if (!rootNode) {
    return { error: "NO_ROOT_NODE_FOUND" };
  }

  const domObject: DomNode = {
    id: rootNode.id,
    classNames: rootNode.classList.value,
    children: []
  };

  for (let i = 0; i < rootNode.childNodes.length; i++) {
    const child = rootNode.childNodes[i];
    if (child.nodeType === Node.ELEMENT_NODE) {
      domObject.children.push(walkDOM(child as Element));
    }
  }

  return domObject;
};
