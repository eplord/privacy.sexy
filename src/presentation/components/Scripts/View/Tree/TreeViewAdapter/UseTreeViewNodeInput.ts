import {
  type Ref, computed, shallowReadonly,
} from 'vue';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { injectKey } from '@/presentation/injectionSymbols';
import { TreeInputNodeData } from '../TreeView/Bindings/TreeInputNodeData';
import { NodeMetadata } from '../NodeContent/NodeMetadata';
import { convertToNodeInput } from './TreeNodeMetadataConverter';
import { parseSingleCategory, parseAllCategories } from './CategoryNodeMetadataConverter';

export function useTreeViewNodeInput(
  categoryIdRef: Readonly<Ref<number | undefined>>,
  parser: CategoryNodeParser = {
    parseSingle: parseSingleCategory,
    parseAll: parseAllCategories,
  },
  nodeConverter = convertToNodeInput,
) {
  const { currentState } = injectKey((keys) => keys.useCollectionState);

  const nodes = computed<readonly TreeInputNodeData[]>(() => {
    const nodeMetadataList = parseNodes(categoryIdRef.value, currentState.value.collection, parser);
    const nodeInputs = nodeMetadataList.map((node) => nodeConverter(node));
    return nodeInputs;
  });

  return {
    treeViewInputNodes: shallowReadonly(nodes),
  };
}

function parseNodes(
  categoryId: number | undefined,
  categoryCollection: ICategoryCollection,
  parser: CategoryNodeParser,
): NodeMetadata[] {
  if (categoryId !== undefined) {
    return parser.parseSingle(categoryId, categoryCollection);
  }
  return parser.parseAll(categoryCollection);
}

export interface CategoryNodeParser {
  readonly parseSingle: typeof parseSingleCategory;
  readonly parseAll: typeof parseAllCategories;
}
