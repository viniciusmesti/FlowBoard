import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { SubTask } from './entities/subtask.entity';
import { User } from '../users/entities/user.entity';
import { Attachment } from '../attachments/entities/attachment.entity';

const createMockRepo = () => ({
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
});

describe('TasksService', () => {
  let service: TasksService;
  let tasksRepo: ReturnType<typeof createMockRepo>;

  beforeEach(async () => {
    tasksRepo = createMockRepo();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: getRepositoryToken(Task), useValue: tasksRepo },
        { provide: getRepositoryToken(SubTask), useValue: createMockRepo() },
        { provide: getRepositoryToken(User), useValue: createMockRepo() },
        { provide: getRepositoryToken(Attachment), useValue: createMockRepo() },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('findAll should request comment authors', async () => {
    const data = [{ id: '1', comments: [{ id: 'c1', author: { id: 'u1' } }] }];
    tasksRepo.find.mockResolvedValue(data);

    const result = await service.findAll();

    expect(tasksRepo.find).toHaveBeenCalledWith({
      relations: [
        'owner',
        'requirement',
        'subtasks',
        'comments',
        'attachments',
        'activities',
        'assignee',
        'comments.author',
      ],
    });
    expect(result[0].comments[0].author).toBeDefined();
  });

  it('findOne should request comment authors', async () => {
    const data = { id: '1', comments: [{ id: 'c1', author: { id: 'u1' } }] } as Task;
    tasksRepo.findOne.mockResolvedValue(data);

    const result = await service.findOne('1');

    expect(tasksRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: [
        'owner',
        'requirement',
        'subtasks',
        'comments',
        'attachments',
        'activities',
        'assignee',
        'comments.author',
      ],
    });
    expect(result.comments[0].author).toBeDefined();
  });
});