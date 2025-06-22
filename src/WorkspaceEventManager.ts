import { Workspace, Component } from 'obsidian';

export class WorkspaceEventManager extends Component {
	private workspace: Workspace;

	constructor(workspace: Workspace) {
		super();
		this.workspace = workspace;
	}

	onWorkspaceEvent(eventName: string, callback: () => void): void {
		this.registerEvent(this.workspace.on(eventName as 'active-leaf-change', callback));
	}

	offWorkspaceEvent(eventName: string, callback: () => void): void {
		this.workspace.off(eventName as 'active-leaf-change', callback);
	}

	onunload(): void {
		// Component automatically handles cleanup of registered events
	}

	hasRegisteredEvents(): boolean {
		return true; // Component handles this internally
	}
}