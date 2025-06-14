import { EventRef, Workspace } from 'obsidian';

export class WorkspaceEventManager {
	private eventRefs: EventRef[] = [];
	private workspace: Workspace;

	constructor(workspace: Workspace) {
		this.workspace = workspace;
	}

	on(eventName: string, callback: () => void): void {
		const eventRef = this.workspace.on(eventName as any, callback);
		this.eventRefs.push(eventRef);
	}

	off(eventName: string, callback: () => void): void {
		this.workspace.off(eventName as any, callback);
	}

	offAll(): void {
		this.eventRefs.forEach(eventRef => {
			this.workspace.offref(eventRef);
		});
		this.eventRefs = [];
	}

	isRegistered(): boolean {
		return this.eventRefs.length > 0;
	}
}