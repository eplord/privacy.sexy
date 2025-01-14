import { EventSource } from '@/infrastructure/Events/EventSource';
import { IScriptingDefinition } from '@/domain/IScriptingDefinition';
import { SelectedScript } from '@/application/Context/State/Selection/Script/SelectedScript';
import { ReadonlyScriptSelection } from '@/application/Context/State/Selection/Script/ScriptSelection';
import { CodeChangedEvent } from './Event/CodeChangedEvent';
import { CodePosition } from './Position/CodePosition';
import { ICodeChangedEvent } from './Event/ICodeChangedEvent';
import { UserScriptGenerator } from './Generation/UserScriptGenerator';
import { IApplicationCode } from './IApplicationCode';
import { IUserScriptGenerator } from './Generation/IUserScriptGenerator';

export class ApplicationCode implements IApplicationCode {
  public readonly changed = new EventSource<ICodeChangedEvent>();

  public current: string;

  private scriptPositions = new Map<SelectedScript, CodePosition>();

  constructor(
    selection: ReadonlyScriptSelection,
    private readonly scriptingDefinition: IScriptingDefinition,
    private readonly generator: IUserScriptGenerator = new UserScriptGenerator(),
  ) {
    this.setCode(selection.selectedScripts);
    selection.changed.on((scripts) => {
      this.setCode(scripts);
    });
  }

  private setCode(scripts: ReadonlyArray<SelectedScript>): void {
    const oldScripts = Array.from(this.scriptPositions.keys());
    const code = this.generator.buildCode(scripts, this.scriptingDefinition);
    this.current = code.code;
    this.scriptPositions = code.scriptPositions;
    const event = new CodeChangedEvent(code.code, oldScripts, code.scriptPositions);
    this.changed.notify(event);
  }
}
