import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { ReadonlyScriptSelection, ScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import { ScriptSelectionChange } from '@/application/Context/State/Selection/Script/ScriptSelectionChange';
import { RevertStatusType } from './RevertStatusType';

export function setCurrentRevertStatus(
  desiredRevertStatus: boolean,
  selection: ScriptSelection,
) {
  const scriptRevertStatusChanges = getScriptRevertStatusChanges(
    selection.selectedScripts,
    desiredRevertStatus,
  );
  if (scriptRevertStatusChanges.length === 0) {
    return;
  }
  selection.processChanges({ changes: scriptRevertStatusChanges });
}

export function getCurrentRevertStatus(
  selection: ReadonlyScriptSelection,
): RevertStatusType {
  const allScriptRevertStatuses = filterReversibleScripts(selection.selectedScripts)
    .map((selectedScript) => selectedScript.revert);
  if (!allScriptRevertStatuses.length) {
    return RevertStatusType.NoReversibleScripts;
  }
  if (allScriptRevertStatuses.every((revertStatus) => revertStatus)) {
    return RevertStatusType.AllScriptsReverted;
  }
  if (allScriptRevertStatuses.every((revertStatus) => !revertStatus)) {
    return RevertStatusType.NoScriptsReverted;
  }
  return RevertStatusType.SomeScriptsReverted;
}

function getScriptRevertStatusChanges(
  selectedScripts: readonly SelectedScript[],
  desiredRevertStatus: boolean,
): ScriptSelectionChange[] {
  const reversibleSelectedScripts = filterReversibleScripts(selectedScripts);
  const selectedScriptsRequiringChange = filterScriptsRequiringRevertStatusChange(
    reversibleSelectedScripts,
    desiredRevertStatus,
  );
  const revertStatusChanges = mapToScriptSelectionChanges(
    selectedScriptsRequiringChange,
    desiredRevertStatus,
  );
  return revertStatusChanges;
}

function filterReversibleScripts(selectedScripts: readonly SelectedScript[]) {
  return selectedScripts.filter(
    (selectedScript) => selectedScript.script.canRevert(),
  );
}

function filterScriptsRequiringRevertStatusChange(
  selectedScripts: readonly SelectedScript[],
  desiredRevertStatus: boolean,
) {
  return selectedScripts.filter(
    (selectedScript) => selectedScript.revert !== desiredRevertStatus,
  );
}

function mapToScriptSelectionChanges(
  scriptsNeedingChange: readonly SelectedScript[],
  newRevertStatus: boolean,
): ScriptSelectionChange[] {
  return scriptsNeedingChange.map((script): ScriptSelectionChange => ({
    scriptId: script.id,
    newStatus: {
      isSelected: true,
      isReverted: newRevertStatus,
    },
  }));
}
