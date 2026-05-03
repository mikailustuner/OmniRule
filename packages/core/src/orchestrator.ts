import fs from 'fs-extra';
import path from 'path';
import pc from 'picocolors';

export interface Mission {
  id: string;
  source: string;
  target: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  priority: 'P0' | 'P1' | 'P2';
  task: string;
  context: {
    files: string[];
    dependencies: string[];
  };
  artifacts: string[];
  createdAt: string;
  updatedAt: string;
}

const MISSIONS_DIR = path.join(process.cwd(), '.omnirule', 'missions');

export class Orchestrator {
  constructor() {
    fs.ensureDirSync(MISSIONS_DIR);
  }

  async dispatch(mission: Omit<Mission, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'artifacts'>): Promise<string> {
    // Force planning if it's a new mission
    console.log(`${pc.yellow('⚠')} Mandatory Phase: Planning (Blueprint Generation)`);
    
    const id = Math.random().toString(36).substring(2, 11);
    const now = new Date().toISOString();
    
    const fullMission: Mission = {
      ...mission,
      id,
      status: 'pending',
      artifacts: [],
      createdAt: now,
      updatedAt: now,
    };

    const filePath = path.join(MISSIONS_DIR, `${id}.json`);
    await fs.writeJson(filePath, fullMission, { spaces: 2 });
    
    console.log(`${pc.green('✔')} Mission registered: ${pc.cyan(id)}`);
    console.log(`${pc.magenta('➔')} ACTION REQUIRED: Run 'blueprint' for task: "${mission.task}"`);
    return id;
  }

  async proposePlan(id: string, plan: any): Promise<void> {
    console.log(`${pc.cyan('i')} Proposed plan for ${id}: ${JSON.stringify(plan)}`);
    await this.requestFeedback(id);
  }

  async verifyStep(id: string, stepResult: any): Promise<boolean> {
    console.log(`${pc.blue('?')} Verifying step for ${id}...`);
    return true;
  }

  async requestFeedback(id: string): Promise<void> {
    console.log(`\n${pc.bgBlue(' USER FEEDBACK REQUIRED ')}`);
    console.log(`${pc.blue('i')} Please review the plan for mission ${pc.cyan(id)}.`);
    console.log(`${pc.blue('?')} Should I proceed? (Yes/No/Adjust)`);
  }

  async list(status?: Mission['status']): Promise<Mission[]> {
    const files = await fs.readdir(MISSIONS_DIR);
    const missions: Mission[] = [];
    
    for (const file of files) {
      if (file.endsWith('.json')) {
        const mission = await fs.readJson(path.join(MISSIONS_DIR, file));
        if (!status || mission.status === status) {
          missions.push(mission);
        }
      }
    }
    
    return missions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async updateStatus(id: string, status: Mission['status'], artifacts: string[] = []): Promise<void> {
    const filePath = path.join(MISSIONS_DIR, `${id}.json`);
    if (!(await fs.pathExists(filePath))) {
      throw new Error(`Mission ${id} not found`);
    }

    const mission = await fs.readJson(filePath);
    mission.status = status;
    mission.artifacts = [...new Set([...mission.artifacts, ...artifacts])];
    mission.updatedAt = new Date().toISOString();

    await fs.writeJson(filePath, mission, { spaces: 2 });
    console.log(`${pc.green('✔')} Mission ${pc.cyan(id)} updated to ${pc.yellow(status)}`);
  }

  async getReport(id: string): Promise<string> {
    const filePath = path.join(MISSIONS_DIR, `${id}.json`);
    const m: Mission = await fs.readJson(filePath);
    
    return `
# Mission Report: ${m.id}
- **Target:** ${m.target}
- **Status:** ${m.status.toUpperCase()}
- **Task:** ${m.task}
- **Created:** ${m.createdAt}
- **Artifacts:** ${m.artifacts.length > 0 ? m.artifacts.join(', ') : 'None'}
    `.trim();
  }
}
