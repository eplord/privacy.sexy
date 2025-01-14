import { ICategory } from '@/domain/ICategory';
import { ICategoryCollection } from '@/domain/ICategoryCollection';
import { ScriptSelection } from '../Script/ScriptSelection';
import { ScriptSelectionChange } from '../Script/ScriptSelectionChange';
import { CategorySelection } from './CategorySelection';
import { CategorySelectionChange, CategorySelectionChangeCommand } from './CategorySelectionChange';

export class ScriptToCategorySelectionMapper implements CategorySelection {
  constructor(
    private readonly scriptSelection: ScriptSelection,
    private readonly collection: ICategoryCollection,
  ) {

  }

  public areAllScriptsSelected(category: ICategory): boolean {
    const { selectedScripts } = this.scriptSelection;
    if (selectedScripts.length === 0) {
      return false;
    }
    const scripts = category.getAllScriptsRecursively();
    if (selectedScripts.length < scripts.length) {
      return false;
    }
    return scripts.every(
      (script) => selectedScripts.some((selected) => selected.id === script.id),
    );
  }

  public isAnyScriptSelected(category: ICategory): boolean {
    const { selectedScripts } = this.scriptSelection;
    if (selectedScripts.length === 0) {
      return false;
    }
    return selectedScripts.some((s) => category.includes(s.script));
  }

  public processChanges(action: CategorySelectionChangeCommand): void {
    const scriptChanges = action.changes.reduce((changes, change) => {
      changes.push(...this.collectScriptChanges(change));
      return changes;
    }, new Array<ScriptSelectionChange>());
    this.scriptSelection.processChanges({
      changes: scriptChanges,
    });
  }

  private collectScriptChanges(change: CategorySelectionChange): ScriptSelectionChange[] {
    const category = this.collection.getCategory(change.categoryId);
    const scripts = category.getAllScriptsRecursively();
    const scriptsChangesInCategory = scripts
      .map((script): ScriptSelectionChange => ({
        scriptId: script.id,
        newStatus: {
          ...change.newStatus,
        },
      }));
    return scriptsChangesInCategory;
  }
}
